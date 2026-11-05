// Host half of the Create Skills plugin.
//
// Serves a small same-origin JSON API for the Skills page: list the catalog,
// create a skill, edit its frontmatter/body, and enable/disable or delete it.
// The catalog is read with the scope of a live root agent, so preset-scoped
// providers (the project filesystem provider among them) contribute just as
// they do for the model.
import process from 'node:process';
import { homedir } from 'node:os';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const PREFIX = '/plugins/create-skills/';
const CATALOG_PATH = fileURLToPath(new URL('./catalog/catalog.json', import.meta.url));
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WRITABLE = new Set(['project-dsh', 'project-agents', 'user-dsh', 'user-agents', 'custom']);
const MAX_ARCHIVE_BYTES = 20 * 1024 * 1024;

// Diagnostics for the page itself: proves the browser actually called the API.
const stats = { requests: 0, lastAt: null, lastUserAgent: null, lastProjectRoot: null, mounted: false, events: [] };

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readJsonBody(req, limit = 256 * 1024) {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new HttpError(413, 'payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolveBody(text === '' ? {} : JSON.parse(text));
      } catch (error) {
        reject(new HttpError(400, `invalid JSON: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
    req.on('error', reject);
  });
}

export const name = 'create-skills';

// The web server is the only hard dependency; the rest is looked up optionally
// so the plugin stays inert in a headless profile.
export const inject = ['webServer'];

function sendJson(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}

function dshHome() {
  return process.env.DSH_HOME && process.env.DSH_HOME !== '' ? process.env.DSH_HOME : join(homedir(), '.dsh');
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// The filesystem provider resolves a project as the nearest ancestor with
// `.git`; mirror that so writes land in the root the provider scans.
async function findProjectRoot(cwd) {
  let current = resolve(cwd);
  for (let depth = 0; depth < 24; depth += 1) {
    if (await exists(join(current, '.git'))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return resolve(cwd);
}

function allowedRoots(projectRoot) {
  return [
    join(projectRoot, '.dsh', 'skills'),
    join(projectRoot, '.agents', 'skills'),
    join(dshHome(), 'skills'),
    join(dshHome(), 'agents', 'skills'),
  ];
}

function assertInside(path, roots) {
  const target = resolve(path);
  for (const root of roots) {
    const base = resolve(root);
    if (target === base || target.startsWith(base + sep)) return;
  }
  throw new HttpError(403, 'path is outside the writable skill roots');
}

async function resolveView(ctx, requested) {
  const view = { cwd: requested ?? undefined, scope: undefined };

  try {
    const agents = ctx.get('agents');
    if (agents) {
      const roots = agents.roots();
      const agent = roots[roots.length - 1];
      if (agent) {
        view.scope = agent;
        if (!view.cwd) {
          try {
            view.cwd = await ctx.workingDirectory.ensure(agent);
          } catch {
            // fall through to the session header
          }
        }
      }
    }
  } catch {
    // fall through
  }

  if (!view.cwd) {
    try {
      const sessions = ctx.get('sessions');
      const live = sessions?.list() ?? [];
      for (let index = live.length - 1; index >= 0; index -= 1) {
        const session = live[index];
        if (session?.header?.parentSession) continue;
        const cwd = session?.header?.cwd;
        if (typeof cwd === 'string' && cwd !== '') {
          view.cwd = cwd;
          break;
        }
      }
    } catch {
      // fall through
    }
  }

  if (!view.cwd) {
    try {
      const workingDirectory = ctx.get('workingDirectory');
      if (workingDirectory && typeof workingDirectory.defaultDirectory === 'string') {
        view.cwd = workingDirectory.defaultDirectory;
      }
    } catch {
      // fall through
    }
  }

  if (!view.cwd) view.cwd = process.cwd();
  return view;
}

function weightOf(skill) {
  const size =
    (skill.name?.length ?? 0) +
    (skill.description?.length ?? 0) +
    (skill.whenToUse?.length ?? 0);
  return Math.max(1, Math.ceil(size / 4));
}

function toRow(skill) {
  return {
    name: skill.name,
    description: skill.description,
    whenToUse: skill.whenToUse ?? null,
    path: skill.path ?? null,
    source: skill.source ?? 'custom',
    provider: skill.provider ?? null,
    modelInvocable: skill.invocation?.modelInvocable !== false,
    userInvocable: skill.invocation?.userInvocable !== false,
    weight: weightOf(skill),
    writable: WRITABLE.has(skill.source) && typeof skill.path === 'string',
  };
}

async function readSnapshot(ctx, view) {
  const skills = ctx.get('skills');
  if (!skills) throw new HttpError(503, 'skills service is not available in this profile');
  const snapshot = await skills.snapshot({ cwd: view.cwd, scope: view.scope });
  return snapshot;
}

async function listSkills(ctx, req, url, res) {
  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const snapshot = await readSnapshot(ctx, view);

  let catalog = { categories: [], skills: [] };
  try {
    catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
  } catch {
    // a missing or broken catalog must not break the installed list
  }
  const categoryOf = new Map(catalog.skills.map((entry) => [entry.name, entry.category]));

  const rows = snapshot.skills.map((skill) => {
    const row = toRow(skill);
    row.category = categoryOf.get(row.name) ?? (row.source === 'bundled' ? 'builtin' : 'mine');
    return row;
  });

  const categories = [
    ...catalog.categories,
    { id: 'builtin', title: 'Встроенные' },
    { id: 'mine', title: 'Мои скиллы' },
  ];

  stats.requests += 1;
  stats.lastAt = new Date().toISOString();
  stats.lastUserAgent = req.headers['user-agent'] ?? null;
  stats.lastProjectRoot = view.cwd;

  sendJson(res, 200, {
    projectRoot: view.cwd,
    complete: snapshot.complete !== false,
    skills: rows,
    categories,
    totalWeight: rows.reduce((sum, row) => sum + row.weight, 0),
    catalogOverhead: 200,
  });
}

async function getSkill(ctx, view, name, res) {
  const skills = ctx.get('skills');
  if (!skills) throw new HttpError(503, 'skills service is not available in this profile');
  const definition = await skills.get(name, { cwd: view.cwd, scope: view.scope });
  if (!definition) throw new HttpError(404, `skill "${name}" not found`);
  sendJson(res, 200, { ...toRow(definition), content: definition.content });
}

function validateName(name) {
  if (typeof name !== 'string' || !KEBAB.test(name) || name.length > 64) {
    throw new HttpError(400, 'name must be kebab-case (a-z, 0-9, dashes), up to 64 characters');
  }
}

function validateDescription(description) {
  if (typeof description !== 'string') throw new HttpError(400, 'description is required');
  const trimmed = description.trim();
  if (trimmed.length === 0 || trimmed.length > 200 || /[\r\n]/.test(trimmed)) {
    throw new HttpError(400, 'description must be one line, 1-200 characters');
  }
  return trimmed;
}

function validateWhenToUse(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new HttpError(400, 'whenToUse must be a string');
  const trimmed = value.trim();
  if (trimmed.length > 120 || /[\r\n]/.test(trimmed)) {
    throw new HttpError(400, 'whenToUse must be one line, up to 120 characters');
  }
  return trimmed;
}

function splitFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { frontmatter: '', body: text, fields: {} };
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, '');
  }
  return { frontmatter: match[1], body: text.slice(match[0].length), fields };
}

function quote(value) {
  return JSON.stringify(value);
}

function setField(frontmatter, key, value) {
  const lines = frontmatter === '' ? [] : frontmatter.split(/\r?\n/);
  const pattern = new RegExp(`^${key}\\s*:`);
  const index = lines.findIndex((line) => pattern.test(line));
  if (value === null) {
    if (index >= 0) lines.splice(index, 1);
    return lines.join('\n');
  }
  const line = `${key}: ${value}`;
  if (index >= 0) lines[index] = line;
  else lines.push(line);
  return lines.join('\n');
}

function buildSkillFile({ name, description, whenToUse, content }) {
  const lines = ['---', `name: ${name}`, `description: ${quote(description)}`];
  if (whenToUse) lines.push(`whenToUse: ${quote(whenToUse)}`);
  lines.push('---', '');
  return `${lines.join('\n')}${content.trim()}\n`;
}

async function writeSkill(ctx, view, body, res) {
  const scope = body.scope === 'user' ? 'user' : 'project';
  validateName(body.name);
  const description = validateDescription(body.description);
  const whenToUse = validateWhenToUse(body.whenToUse);
  if (typeof body.content !== 'string' || body.content.trim() === '') {
    throw new HttpError(400, 'content is required');
  }

  const projectRoot = await findProjectRoot(view.cwd);
  const root = scope === 'user' ? join(dshHome(), 'skills') : join(projectRoot, '.dsh', 'skills');
  assertInside(join(root, body.name), allowedRoots(projectRoot));

  const directory = join(root, body.name);
  const file = join(directory, 'SKILL.md');
  if (await exists(file)) throw new HttpError(409, `skill "${body.name}" already exists in ${scope}`);

  await mkdir(directory, { recursive: true });
  await writeFile(file, buildSkillFile({ name: body.name, description, whenToUse, content: body.content }), 'utf8');

  res.statusCode = 201;
  sendJson(res, 201, { ok: true, path: file, name: body.name, scope });
}

async function findWritable(snapshot, name) {
  const skill = snapshot.skills.find((candidate) => candidate.name === name);
  if (!skill) throw new HttpError(404, `skill "${name}" not found`);
  if (!WRITABLE.has(skill.source) || typeof skill.path !== 'string') {
    throw new HttpError(403, `skill "${name}" is provided by ${skill.source} and is read-only here`);
  }
  return skill;
}

async function updateSkill(ctx, view, body, res) {
  if (typeof body.name !== 'string') throw new HttpError(400, 'name is required');
  const snapshot = await readSnapshot(ctx, view);
  const skill = await findWritable(snapshot, body.name);
  assertInside(skill.path, allowedRoots(await findProjectRoot(view.cwd)));

  const raw = await readFile(skill.path, 'utf8');
  const parsed = splitFrontmatter(raw);
  let frontmatter = parsed.frontmatter;
  let content = parsed.body;

  if (body.description !== undefined) {
    frontmatter = setField(frontmatter, 'description', quote(validateDescription(body.description)));
  }
  if (body.whenToUse !== undefined) {
    const whenToUse = validateWhenToUse(body.whenToUse);
    frontmatter = setField(frontmatter, 'whenToUse', whenToUse === null ? null : quote(whenToUse));
  }
  if (body.content !== undefined) {
    if (typeof body.content !== 'string' || body.content.trim() === '') {
      throw new HttpError(400, 'content must not be empty');
    }
    content = body.content;
  }
  if (body.enabled !== undefined) {
    frontmatter = setField(frontmatter, 'disable-model-invocation', body.enabled ? null : 'true');
  }

  const next = `---\n${frontmatter}\n---\n\n${content.replace(/^\n+/, '').trimEnd()}\n`;
  await writeFile(skill.path, next, 'utf8');
  sendJson(res, 200, { ok: true, path: skill.path, name: skill.name });
}

async function deleteSkill(ctx, view, url, res) {
  const name = url.searchParams.get('name');
  if (!name) throw new HttpError(400, 'name is required');
  const snapshot = await readSnapshot(ctx, view);
  const skill = await findWritable(snapshot, name);
  assertInside(skill.path, allowedRoots(await findProjectRoot(view.cwd)));

  const target = basename(skill.path) === 'SKILL.md' ? dirname(skill.path) : skill.path;
  assertInside(target, allowedRoots(await findProjectRoot(view.cwd)));
  await rm(target, { recursive: true, force: true });
  sendJson(res, 200, { ok: true, removed: target });
}

function errorResponse(res, error) {
  const status = error instanceof HttpError ? error.status : 500;
  sendJson(res, status, { error: error instanceof Error ? error.message : String(error) });
}

function readTarString(header, offset, length) {
  const slice = header.subarray(offset, offset + length);
  const zero = slice.indexOf(0);
  return slice.subarray(0, zero === -1 ? slice.length : zero).toString('utf8');
}

function parseTar(buffer) {
  const entries = [];
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const name = readTarString(header, 0, 100);
    const prefix = readTarString(header, 345, 155);
    const size = Number.parseInt(readTarString(header, 124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156] || 48);
    const start = offset + 512;
    entries.push({ name: prefix ? `${prefix}/${name}` : name, type, data: buffer.subarray(start, start + size) });
    offset = start + Math.ceil(size / 512) * 512;
  }
  return entries;
}

async function downloadSkill(entry) {
  const url = `https://codeload.github.com/${entry.source.repo}/tar.gz/${entry.source.ref}`;
  const response = await fetch(url, { headers: { 'user-agent': 'create-skills/0.1' } });
  if (!response.ok) throw new HttpError(502, `download failed: HTTP ${response.status} for ${entry.source.repo}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_ARCHIVE_BYTES) throw new HttpError(413, 'archive is too large');
  return parseTar(gunzipSync(buffer));
}

function skillPrefix(entries, path) {
  const suffix = `${path}/SKILL.md`;
  const hit = entries.find((candidate) => candidate.name === suffix || candidate.name.endsWith(`/${suffix}`));
  if (!hit) throw new HttpError(422, `SKILL.md not found at ${path}`);
  return hit.name.slice(0, hit.name.length - 'SKILL.md'.length);
}

async function installEntry(entry, targetRoot) {
  if (typeof entry.name !== 'string' || !KEBAB.test(entry.name)) {
    throw new HttpError(422, `catalog entry ${entry.id} has an invalid name`);
  }
  const target = join(targetRoot, entry.name);
  if (await exists(target)) return { id: entry.id, status: 'skipped', reason: 'already installed' };

  const entries = await downloadSkill(entry);
  const prefix = skillPrefix(entries, entry.source.path);
  await mkdir(target, { recursive: true });
  try {
    for (const item of entries) {
      if (!item.name.startsWith(prefix)) continue;
      const relative = item.name.slice(prefix.length);
      if (relative === '' || relative.includes('..') || relative.startsWith('/')) continue;
      const destination = join(target, relative);
      assertInside(destination, [target]);
      if (item.type === '5') {
        await mkdir(destination, { recursive: true });
      } else if (item.type === '0') {
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, item.data);
      }
    }
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    throw error;
  }

  const file = join(target, 'SKILL.md');
  if (!(await exists(file))) {
    await rm(target, { recursive: true, force: true });
    throw new HttpError(422, 'downloaded skill has no SKILL.md');
  }
  const parsed = splitFrontmatter(await readFile(file, 'utf8'));
  if (!parsed.fields.name || !parsed.fields.description) {
    await rm(target, { recursive: true, force: true });
    throw new HttpError(422, 'downloaded skill has an invalid frontmatter');
  }
  return { id: entry.id, status: 'installed', path: target };
}

async function listCatalog(ctx, url, res) {
  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
  const snapshot = await readSnapshot(ctx, view);
  const installed = new Set(snapshot.skills.map((skill) => skill.name));
  sendJson(res, 200, {
    projectRoot: view.cwd,
    categories: catalog.categories,
    skills: catalog.skills.map((entry) => ({ ...entry, installed: installed.has(entry.name) })),
  });
}

async function installCatalogSkills(ctx, view, body, res) {
  const ids = Array.isArray(body.ids) ? body.ids : [];
  if (ids.length === 0) throw new HttpError(400, 'ids is required');
  const scope = body.scope === 'user' ? 'user' : 'project';
  const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
  const projectRoot = await findProjectRoot(view.cwd);
  const targetRoot = scope === 'user' ? join(dshHome(), 'skills') : join(projectRoot, '.dsh', 'skills');
  assertInside(targetRoot, allowedRoots(projectRoot));

  const report = [];
  for (const id of ids) {
    const entry = catalog.skills.find((candidate) => candidate.id === id);
    if (!entry) {
      report.push({ id, status: 'error', message: 'unknown catalog entry' });
      continue;
    }
    try {
      report.push(await installEntry(entry, targetRoot));
    } catch (error) {
      report.push({ id, status: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }
  sendJson(res, 200, {
    ok: true,
    scope,
    installed: report.filter((item) => item.status === 'installed').length,
    report,
  });
}

function safeLabel(label) {
  const value = String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  if (value === '') throw new HttpError(400, 'label is required (a-z, 0-9, dot, dash, underscore)');
  return value;
}

function versionsDir(projectRoot, skill) {
  return join(projectRoot, '.dsh', 'skill-versions', skill);
}

async function listVersions(ctx, url, res) {
  const skill = url.searchParams.get('skill');
  validateName(skill);
  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const projectRoot = await findProjectRoot(view.cwd);
  const dir = versionsDir(projectRoot, skill);
  const labels = await readdir(dir).catch(() => []);
  const versions = [];
  for (const label of labels) {
    try {
      const info = await stat(join(dir, label, 'SKILL.md'));
      if (!info.isFile()) continue;
      versions.push({ label, savedAt: info.mtime.toISOString(), bytes: info.size });
    } catch {
      // not a version directory
    }
  }
  versions.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  sendJson(res, 200, { skill, versions });
}

async function saveVersion(ctx, view, body, res) {
  const skill = body.skill;
  validateName(skill);
  const label = safeLabel(body.label);
  const snapshot = await readSnapshot(ctx, view);
  const found = await findWritable(snapshot, skill);
  const projectRoot = await findProjectRoot(view.cwd);
  const dir = join(versionsDir(projectRoot, skill), label);
  assertInside(dir, [join(projectRoot, '.dsh')]);
  const raw = await readFile(found.path, 'utf8');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'SKILL.md'), raw, 'utf8');
  sendJson(res, 201, { ok: true, skill, label, path: join(dir, 'SKILL.md') });
}

async function applyVersion(ctx, view, body, res) {
  const skill = body.skill;
  validateName(skill);
  const label = safeLabel(body.label);
  const snapshot = await readSnapshot(ctx, view);
  const found = await findWritable(snapshot, skill);
  const projectRoot = await findProjectRoot(view.cwd);
  const file = join(versionsDir(projectRoot, skill), label, 'SKILL.md');
  assertInside(file, [join(projectRoot, '.dsh')]);
  if (!(await exists(file))) throw new HttpError(404, `version "${label}" not found`);
  assertInside(found.path, allowedRoots(projectRoot));
  const raw = await readFile(file, 'utf8');
  const current = await readFile(found.path, 'utf8');

  // Never lose the state we are about to overwrite: snapshot it as an
  // automatic version so "apply" is always reversible.
  let backup = null;
  if (current !== raw) {
    backup = `auto-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
    const backupDir = join(versionsDir(projectRoot, skill), backup);
    assertInside(backupDir, [join(projectRoot, '.dsh')]);
    await mkdir(backupDir, { recursive: true });
    await writeFile(join(backupDir, 'SKILL.md'), current, 'utf8');
  }

  await writeFile(found.path, raw, 'utf8');
  sendJson(res, 200, { ok: true, skill, label, backup });
}

async function removeVersion(ctx, url, res) {
  const skill = url.searchParams.get('skill');
  validateName(skill);
  const label = safeLabel(url.searchParams.get('label'));
  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const projectRoot = await findProjectRoot(view.cwd);
  const dir = join(versionsDir(projectRoot, skill), label);
  assertInside(dir, [join(projectRoot, '.dsh')]);
  await rm(dir, { recursive: true, force: true });
  sendJson(res, 200, { ok: true });
}

async function readVariant(ctx, view, spec) {
  if (!spec || typeof spec.name !== 'string') throw new HttpError(400, 'skill name is required for each side');
  validateName(spec.name);
  if (spec.label) {
    const projectRoot = await findProjectRoot(view.cwd);
    const label = safeLabel(spec.label);
    const file = join(versionsDir(projectRoot, spec.name), label, 'SKILL.md');
    assertInside(file, [join(projectRoot, '.dsh')]);
    if (!(await exists(file))) throw new HttpError(404, `version "${label}" of "${spec.name}" not found`);
    const raw = await readFile(file, 'utf8');
    return { name: spec.name, label, raw, body: splitFrontmatter(raw).body };
  }
  const skills = ctx.get('skills');
  if (!skills) throw new HttpError(503, 'skills service is not available in this profile');
  const definition = await skills.get(spec.name, { cwd: view.cwd, scope: view.scope });
  if (!definition) throw new HttpError(404, `skill "${spec.name}" not found`);
  return { name: spec.name, label: null, raw: definition.content, body: splitFrontmatter(definition.content).body };
}

function buildComparePrompt(left, right, task) {
  const clip = (text) => (text.length > 9000 ? `${text.slice(0, 9000)}\n…(обрезано)` : text);
  const goal = task === '' ? 'общая пригодность скилла для работы с проектом' : task;
  return [
    'Ты оцениваешь два варианта скилла — инструкций, которые получает ИИ-агент.',
    `Задача, для которой сравниваем: ${goal}.`,
    '',
    `Скилл A (${left.name}${left.label ? ' / ' + left.label : ''}):`,
    clip(left.body),
    '',
    `Скилл B (${right.name}${right.label ? ' / ' + right.label : ''}):`,
    clip(right.body),
    '',
    'Сравни их по критериям: следование задаче, конкретность и полнота инструкций, риск ошибок, краткость.',
    'Ответь строго одним JSON-объектом без markdown и без пояснений:',
    '{"left":"2-4 предложения: что лучше и что хуже в A","right":"2-4 предложения: что лучше и что хуже в B","winner":"left|right|tie"}',
    'Пиши по-русски.',
  ].join('\n');
}

function parseVerdict(text) {
  const match = /\{[\s\S]*\}/.exec(text);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      return {
        left: typeof parsed.left === 'string' ? parsed.left : '',
        right: typeof parsed.right === 'string' ? parsed.right : '',
        winner: parsed.winner === 'left' || parsed.winner === 'right' ? parsed.winner : 'tie',
      };
    } catch {
      // fall through to the raw text
    }
  }
  return { left: text.trim(), right: '', winner: 'tie' };
}

async function streamModel(ctx, system, prompt, maxTokens = 3000) {
  const llm = ctx.get('llm');
  if (!llm) throw new HttpError(503, 'llm service is not available in this profile');
  const model = ctx.get('agentDefaultModel');
  const selection = model?.currentSelection?.();
  if (!selection || !selection.provider || !selection.model) {
    throw new HttpError(503, 'no default model is configured');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  let text = '';
  try {
    const stream = llm.stream({
      provider: selection.provider,
      model: selection.model,
      system,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      temperature: 0.2,
      maxTokens,
      signal: controller.signal,
    });
    for await (const chunk of stream) {
      if (chunk.type === 'text-delta') text += chunk.text;
      if (chunk.type === 'finish' && chunk.reason.kind !== 'stop' && chunk.reason.kind !== 'max-tokens') {
        if (chunk.reason.kind === 'error') {
          throw new HttpError(502, `model error: ${chunk.reason.failure?.message ?? 'unknown'}`);
        }
        if (chunk.reason.kind === 'aborted') throw new HttpError(504, 'model call was aborted');
        throw new HttpError(502, `model stopped with ${chunk.reason.kind}`);
      }
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (controller.signal.aborted) throw new HttpError(504, 'model call timed out');
    throw new HttpError(502, error instanceof Error ? error.message : String(error));
  } finally {
    clearTimeout(timer);
  }
  return text;
}

async function judgeVariants(ctx, prompt) {
  const text = await streamModel(
    ctx,
    'Ты — строгий и справедливый оценщик инструкций для ИИ-агентов. Отвечай только JSON, как просят.',
    prompt,
  );
  return parseVerdict(text);
}

async function compareVariants(ctx, view, body, res) {
  const left = await readVariant(ctx, view, body.left);
  const right = await readVariant(ctx, view, body.right);
  const task = typeof body.task === 'string' ? body.task.trim() : '';
  const verdict = await judgeVariants(ctx, buildComparePrompt(left, right, task));
  sendJson(res, 200, {
    left: { name: left.name, label: left.label, body: left.body },
    right: { name: right.name, label: right.label, body: right.body },
    verdict,
  });
}

function buildImprovePrompt(body, task) {
  const clip = body.length > 12_000 ? body.slice(0, 12_000) : body;
  const lines = [
    'Ты — опытный редактор инструкций для ИИ-агента (скилл в формате Markdown).',
    'Улучши инструкции: сделай шаги конкретнее, добавь недостающие проверки, убери воду, сохрани назначение и стиль.',
  ];
  if (task !== '') lines.push(`Цель, под которую улучшаем: ${task}.`);
  lines.push(
    'Верни ТОЛЬКО улучшенный Markdown без frontmatter, без пояснений и без обёртки ```.',
    '',
    'Текущие инструкции:',
    clip,
  );
  return lines.join('\n');
}

function stripFences(text) {
  const match = /^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i.exec(text.trim());
  return (match ? match[1] : text).trim();
}

async function improveSkill(ctx, view, body, res) {
  const original = await readVariant(ctx, view, { name: body.name, label: body.label });
  const parsed = splitFrontmatter(original.raw);
  const task = typeof body.task === 'string' ? body.task.trim() : '';
  const text = await streamModel(
    ctx,
    'Ты — опытный редактор инструкций для ИИ-агентов. Возвращай только Markdown.',
    buildImprovePrompt(parsed.body, task),
    4000,
  );
  const improvedBody = stripFences(text);
  if (improvedBody === '') throw new HttpError(502, 'model returned an empty improvement');

  const projectRoot = await findProjectRoot(view.cwd);
  const label = `ai-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
  const dir = join(versionsDir(projectRoot, original.name), label);
  assertInside(dir, [join(projectRoot, '.dsh')]);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'SKILL.md'), `---\n${parsed.frontmatter}\n---\n\n${improvedBody}\n`, 'utf8');

  sendJson(res, 200, {
    skill: original.name,
    label,
    body: improvedBody,
    original: { name: original.name, label: original.label, body: parsed.body },
  });
}

export function apply(ctx) {
  const routes = [
    {
      kind: 'exact',
      path: `${PREFIX}api/skills`,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          if (req.method === 'GET' || req.method === 'HEAD') {
            const name = url.searchParams.get('name');
            if (name) {
              await getSkill(ctx, view, name, res);
              return;
            }
            await listSkills(ctx, req, url, res);
            return;
          }
          if (req.method === 'POST') {
            await writeSkill(ctx, view, await readJsonBody(req), res);
            return;
          }
          if (req.method === 'PATCH') {
            await updateSkill(ctx, view, await readJsonBody(req), res);
            return;
          }
          if (req.method === 'DELETE') {
            await deleteSkill(ctx, view, url, res);
            return;
          }
          sendJson(res, 405, { error: 'method not allowed' });
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/catalog`,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          await listCatalog(ctx, url, res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/install`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          await installCatalogSkills(ctx, view, await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/versions`,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          if (req.method === 'GET') {
            await listVersions(ctx, url, res);
            return;
          }
          if (req.method === 'POST') {
            await saveVersion(ctx, view, await readJsonBody(req), res);
            return;
          }
          if (req.method === 'DELETE') {
            await removeVersion(ctx, url, res);
            return;
          }
          sendJson(res, 405, { error: 'method not allowed' });
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/versions/apply`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          await applyVersion(ctx, view, await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/compare`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          await compareVariants(ctx, view, await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/improve`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          await improveSkill(ctx, view, await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/stats`,
      handler: (req, res) => {
        sendJson(res, 200, stats);
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/client-event`,
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'method not allowed' });
          return;
        }
        try {
          const body = await readJsonBody(req);
          const event = typeof body.event === 'string' ? body.event : 'unknown';
          if (event === 'mounted') stats.mounted = true;
          stats.events.push({
            event,
            message: typeof body.message === 'string' ? body.message.slice(0, 500) : null,
            at: new Date().toISOString(),
          });
          if (stats.events.length > 20) stats.events.shift();
          sendJson(res, 200, { ok: true });
        } catch (error) {
          sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
        }
      },
    },
  ];

  ctx.effect(() => {
    const disposers = routes.map((route) => ctx.webServer.register(route));
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, 'create-skills: http api');
}
