// Host half of the Create Skills plugin.
//
// Serves a small same-origin JSON API for the Skills page: list the catalog,
// create a skill, edit its frontmatter/body, and enable/disable or delete it.
// The catalog is read with the scope of a live root agent, so preset-scoped
// providers (the project filesystem provider among them) contribute just as
// they do for the model.
import process from 'node:process';
import { homedir } from 'node:os';
import { chmod, cp, mkdir, readFile, readdir, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
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

// The shared agents root: `$DSH_AGENTS_HOME/skills`, `~/.agents/skills` by default.
// It is a sibling of the DSH home, not a subdirectory of it.
function agentsHome() {
  const configured = process.env.DSH_AGENTS_HOME;
  return configured && configured !== '' ? configured : join(homedir(), '.agents');
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
    join(agentsHome(), 'skills'),
  ];
}

// Windows and default macOS filesystems compare paths case-insensitively;
// path.relative already folds case on win32, so only darwin needs the help.
function comparablePath(path) {
  return process.platform === 'darwin' ? path.toLowerCase() : path;
}

// True when `path` is `root` itself or lives below it. A string prefix check
// breaks on the filesystem root and on case-insensitive filesystems, so the
// containment test goes through path.relative, which also rejects other drives.
function isInsidePath(path, root) {
  const step = relative(comparablePath(resolve(root)), comparablePath(resolve(path)));
  if (step === '') return true;
  if (isAbsolute(step)) return false;
  return step !== '..' && !step.startsWith(`..${sep}`);
}

function assertInside(path, roots) {
  if (!roots.some((root) => isInsidePath(path, root))) {
    throw new HttpError(403, 'path is outside the writable skill roots');
  }
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

function slugifyCategory(text) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return String(text)
    .toLowerCase()
    .split('')
    .map((char) => (char in map ? map[char] : char))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function categoriesPath(projectRoot) {
  return join(projectRoot, '.dsh', 'skill-categories.json');
}

async function readCustomCategories(projectRoot) {
  try {
    const parsed = JSON.parse(await readFile(categoriesPath(projectRoot), 'utf8'));
    return Array.isArray(parsed.categories)
      ? parsed.categories.filter((item) => item && typeof item.id === 'string' && typeof item.title === 'string')
      : [];
  } catch {
    return [];
  }
}

async function writeCustomCategories(projectRoot, categories) {
  const file = categoriesPath(projectRoot);
  assertInside(file, [join(projectRoot, '.dsh')]);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify({ categories }, null, 2)}\n`, 'utf8');
}

async function mergedCategories(projectRoot) {
  let catalog = { categories: [], skills: [] };
  try {
    catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
  } catch {
    // a missing catalog only removes its categories
  }
  const custom = await readCustomCategories(projectRoot);
  const merged = [];
  const seen = new Set();
  for (const category of [
    ...catalog.categories,
    ...custom,
    { id: 'builtin', title: 'Встроенные' },
    { id: 'mine', title: 'Мои скиллы' },
  ]) {
    if (!category || seen.has(category.id)) continue;
    seen.add(category.id);
    merged.push({ id: category.id, title: category.title });
  }
  return { categories: merged, catalog };
}

async function listSkills(ctx, req, url, res) {
  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const snapshot = await readSnapshot(ctx, view);

  const projectRoot = await findProjectRoot(view.cwd);
  const { categories, catalog } = await mergedCategories(projectRoot);
  const categoryOf = new Map(catalog.skills.map((entry) => [entry.name, entry.category]));

  const rows = [];
  for (const skill of snapshot.skills) {
    const row = toRow(skill);
    let own = '';
    if (typeof row.path === 'string') {
      try {
        own = parseCategory(splitFrontmatter(await readFile(row.path, 'utf8')).frontmatter);
      } catch {
        // unreadable file: fall back to the catalog mapping
      }
    }
    row.category = own || categoryOf.get(row.name) || (row.source === 'bundled' ? 'builtin' : 'mine');
    rows.push(row);
  }

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

  let category = '';
  if (typeof definition.path === 'string') {
    try {
      category = parseCategory(splitFrontmatter(await readFile(definition.path, 'utf8')).frontmatter);
    } catch {
      // a provider-supplied definition may have no readable file
    }
  }
  // A skill without explicit frontmatter metadata still has an effective
  // category in the list (catalog mapping, or "mine"/"builtin" by source), so
  // the editor must open with that value instead of "No category".
  if (category === '') {
    const projectRoot = await findProjectRoot(view.cwd);
    const { catalog } = await mergedCategories(projectRoot);
    const mapped = catalog.skills.find((entry) => entry.name === definition.name);
    category = mapped ? mapped.category : definition.source === 'bundled' ? 'builtin' : 'mine';
  }
  sendJson(res, 200, { ...toRow(definition), category, content: definition.content });
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

function parseCategory(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  const top = lines.find((line) => /^category:\s*/.test(line));
  if (top) return top.replace(/^category:\s*/, '').replace(/^["']|["']$/g, '').trim();

  const index = lines.findIndex((line) => /^metadata:\s*/.test(line));
  if (index === -1) return '';
  const flow = /\{(.*)\}/.exec(lines[index]);
  if (flow) {
    const match = /category:\s*["']?([^"',}]+)/.exec(flow[1]);
    return match ? match[1].trim() : '';
  }
  for (let cursor = index + 1; cursor < lines.length && /^\s+/.test(lines[cursor]); cursor += 1) {
    const match = /^\s+category:\s*(.*)$/.exec(lines[cursor]);
    if (match) return match[1].replace(/^["']|["']$/g, '').trim();
  }
  return '';
}

function setMetadataCategory(frontmatter, category) {
  const lines = frontmatter === '' ? [] : frontmatter.split(/\r?\n/);
  const flow = lines.findIndex((line) => /^metadata:\s*\{.*\}\s*$/.test(line));
  if (flow !== -1) lines.splice(flow, 1);

  const start = lines.findIndex((line) => /^metadata:\s*$/.test(line));
  const value = String(category ?? '').trim();

  if (start === -1) {
    if (value !== '') lines.push('metadata:', `  category: ${JSON.stringify(value)}`);
    return lines.join('\n');
  }

  let end = start + 1;
  while (end < lines.length && /^\s+/.test(lines[end])) end += 1;
  const block = lines.slice(start + 1, end).filter((line) => !/^\s+category:/.test(line));
  if (value !== '') block.push(`  category: ${JSON.stringify(value)}`);
  if (block.length === 0) {
    lines.splice(start, end - start);
  } else {
    lines.splice(start, end - start, 'metadata:', ...block);
  }
  return lines.join('\n');
}

function buildSkillFile({ name, description, whenToUse, content, category }) {
  const lines = ['---', `name: ${name}`, `description: ${quote(description)}`];
  if (whenToUse) lines.push(`whenToUse: ${quote(whenToUse)}`);
  if (category) lines.push('metadata:', `  category: ${JSON.stringify(category)}`);
  lines.push('---', '');
  return `${lines.join('\n')}${content.trim()}\n`;
}

async function writeSkill(ctx, view, body, res) {
  const scope = body.scope === 'user' ? 'user' : 'project';
  validateName(body.name);
  const description = validateDescription(body.description);
  const whenToUse = validateWhenToUse(body.whenToUse);
  const category = typeof body.category === 'string' ? body.category.trim().slice(0, 40) : '';
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
  await writeFile(file, buildSkillFile({ name: body.name, description, whenToUse, content: body.content, category }), 'utf8');

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
  if (body.category !== undefined) {
    frontmatter = setMetadataCategory(
      frontmatter,
      typeof body.category === 'string' ? body.category.trim().slice(0, 40) : '',
    );
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

// --- archive (trash) ------------------------------------------------------
// Deleted skills move to `<dshHome>/skill-archive/<id>/` with a meta.json, so
// they can be restored to the exact root they came from or deleted for good.
function archiveRoot() {
  return join(dshHome(), 'skill-archive');
}

function archiveEntryId(name) {
  const slug = String(name).replace(/[^a-z0-9-]+/gi, '-').slice(0, 40);
  return `${Date.now().toString(36)}-${slug}`;
}

async function movePath(from, to) {
  await mkdir(dirname(to), { recursive: true });
  try {
    await rename(from, to);
  } catch (error) {
    // The archive may live on another volume than the project.
    if (!error || error.code !== 'EXDEV') throw error;
    await cp(from, to, { recursive: true });
    await rm(from, { recursive: true, force: true });
  }
}

async function archiveSkill(ctx, view, body, res) {
  const name = typeof body.name === 'string' ? body.name : '';
  if (name === '') throw new HttpError(400, 'name is required');
  const snapshot = await readSnapshot(ctx, view);
  const skill = await findWritable(snapshot, name);
  const projectRoot = await findProjectRoot(view.cwd);
  assertInside(skill.path, allowedRoots(projectRoot));

  const skillFile = basename(skill.path) === 'SKILL.md' ? skill.path : join(skill.path, 'SKILL.md');
  let category = '';
  try {
    category = parseCategory(splitFrontmatter(await readFile(skillFile, 'utf8')).frontmatter);
  } catch {
    // an unreadable definition still archives, just without a category
  }

  const target = basename(skill.path) === 'SKILL.md' ? dirname(skill.path) : skill.path;
  const id = archiveEntryId(name);
  const entryDir = join(archiveRoot(), id);
  await mkdir(entryDir, { recursive: true });
  const meta = {
    id,
    name,
    source: skill.source,
    category,
    archivedAt: new Date().toISOString(),
    origin: target,
  };
  await writeFile(join(entryDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  try {
    await movePath(target, join(entryDir, 'skill'));
  } catch (error) {
    await rm(entryDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
  sendJson(res, 200, { ok: true, id, name, origin: target });
}

async function listArchive(res) {
  const root = archiveRoot();
  const ids = await readdir(root).catch(() => []);
  const entries = [];
  for (const id of ids) {
    try {
      const meta = JSON.parse(await readFile(join(root, id, 'meta.json'), 'utf8'));
      if (!meta || typeof meta.name !== 'string') continue;
      entries.push({
        id,
        name: meta.name,
        category: typeof meta.category === 'string' ? meta.category : '',
        source: typeof meta.source === 'string' ? meta.source : '',
        archivedAt: meta.archivedAt ?? null,
        origin: meta.origin ?? null,
      });
    } catch {
      // a half-written entry is ignored rather than breaking the list
    }
  }
  entries.sort((a, b) => String(b.archivedAt ?? '').localeCompare(String(a.archivedAt ?? '')));
  sendJson(res, 200, { entries });
}

// Restoring may target a project other than the one currently open, so the
// check is "looks like a skill root", not "inside this project's roots".
function isSkillRootPath(path) {
  const normalized = resolve(path);
  if (isInsidePath(normalized, join(dshHome(), 'skills'))) return true;
  if (isInsidePath(normalized, join(agentsHome(), 'skills'))) return true;
  return /[\\/]\.(dsh|agents)[\\/]skills[\\/]/.test(normalized);
}

async function restoreArchive(view, body, res) {
  const id = typeof body.id === 'string' ? body.id : '';
  if (!/^[a-z0-9-]+$/i.test(id)) throw new HttpError(400, 'id is required');
  const entryDir = join(archiveRoot(), id);
  const meta = JSON.parse(await readFile(join(entryDir, 'meta.json'), 'utf8'));
  if (!meta || typeof meta.origin !== 'string') throw new HttpError(422, 'archive entry is broken');
  if (!isSkillRootPath(meta.origin)) throw new HttpError(403, 'archive entry points outside a skill root');
  if (await exists(meta.origin)) {
    throw new HttpError(409, `cannot restore: ${meta.origin} already exists`);
  }
  await movePath(join(entryDir, 'skill'), meta.origin);
  await rm(entryDir, { recursive: true, force: true });
  sendJson(res, 200, { ok: true, name: meta.name, origin: meta.origin });
}

async function deleteArchived(body, res) {
  const id = typeof body.id === 'string' ? body.id : '';
  if (!/^[a-z0-9-]+$/i.test(id)) throw new HttpError(400, 'id is required');
  const entryDir = join(archiveRoot(), id);
  if (!(await exists(entryDir))) throw new HttpError(404, 'archive entry not found');
  await rm(entryDir, { recursive: true, force: true });
  sendJson(res, 200, { ok: true });
}

async function emptyArchive(res) {
  const root = archiveRoot();
  const ids = await readdir(root).catch(() => []);
  for (const id of ids) {
    await rm(join(root, id), { recursive: true, force: true }).catch(() => {});
  }
  sendJson(res, 200, { ok: true, removed: ids.length });
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
    const mode = Number.parseInt(readTarString(header, 100, 8).trim() || '0', 8);
    const type = String.fromCharCode(header[156] || 48);
    const linkName = readTarString(header, 157, 100);
    const start = offset + 512;
    entries.push({
      name: prefix ? `${prefix}/${name}` : name,
      type,
      mode,
      linkName,
      data: buffer.subarray(start, start + size),
    });
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
      const bare = item.name.slice(prefix.length);
      if (bare === '') continue;
      const destination = join(target, bare);
      if (!isInsidePath(destination, target)) continue;
      if (item.type === '5') {
        await mkdir(destination, { recursive: true });
      } else if (item.type === '2') {
        // Bundled symlinks are common on Linux and macOS checkouts. Keep the
        // link only when it stays inside the installed skill.
        if (!item.linkName) continue;
        if (!isInsidePath(resolve(dirname(destination), item.linkName), target)) continue;
        await mkdir(dirname(destination), { recursive: true });
        try {
          await symlink(item.linkName, destination);
        } catch {
          // Windows without symlink rights: the bundle still installs, minus the link.
        }
      } else if (item.type === '0') {
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, item.data);
        // Tar modes matter on POSIX: a shipped script must stay executable.
        if (process.platform !== 'win32' && (item.mode & 0o111) !== 0) {
          await chmod(destination, (item.mode & 0o777) | 0o600).catch(() => {});
        }
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

const previewCache = new Map();
const MAX_PREVIEW_BYTES = 512 * 1024;

// A catalog entry points at a skill directory inside a repository, so both the
// preview and the comparison fetch just SKILL.md over HTTPS, then cache it.
async function fetchCatalogEntry(id) {
  if (typeof id !== 'string' || id === '') throw new HttpError(400, 'id is required');
  const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
  const entry = catalog.skills.find((candidate) => candidate.id === id);
  if (!entry) throw new HttpError(404, `catalog entry "${id}" not found`);

  let cached = previewCache.get(entry.id);
  if (!cached) {
    const dir = String(entry.source.path).replace(/^\/+|\/+$/g, '');
    const raw = `https://raw.githubusercontent.com/${entry.source.repo}/${entry.source.ref}/${dir}/SKILL.md`;
    const response = await fetch(raw, { headers: { 'user-agent': 'create-skills/0.1' } });
    if (!response.ok) {
      throw new HttpError(502, `preview failed: HTTP ${response.status} for ${entry.source.repo}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_PREVIEW_BYTES) throw new HttpError(413, 'preview is too large');
    cached = { raw, content: buffer.toString('utf8') };
    previewCache.set(entry.id, cached);
  }
  return { entry, raw: cached.raw, content: cached.content };
}

async function previewCatalogEntry(url, res) {
  const { entry, raw, content } = await fetchCatalogEntry(url.searchParams.get('id'));
  sendJson(res, 200, {
    id: entry.id,
    name: entry.name,
    title: entry.title,
    titleEn: entry.titleEn ?? null,
    description: entry.description,
    descriptionEn: entry.descriptionEn ?? null,
    category: entry.category,
    license: entry.license ?? null,
    source: entry.source,
    rawUrl: raw,
    content,
  });
}

async function listWorkspaces(res) {
  // The app keeps its workspace registry in the DSH storage unit; the plugin
  // only reads it to offer an explicit target workspace.
  const file = join(dshHome(), 'storages', 'workspace.json');
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    const table = parsed && parsed.tables && parsed.tables.workspaces ? parsed.tables.workspaces : {};
    const workspaces = Object.values(table)
      .filter((entry) => entry && typeof entry.path === 'string')
      .map((entry) => ({ path: entry.path, title: entry.title ?? entry.path }))
      .sort((a, b) => a.title.localeCompare(b.title));
    sendJson(res, 200, { workspaces });
  } catch {
    sendJson(res, 200, { workspaces: [] });
  }
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
  // A version without name/description would make the registry drop the skill
  // as soon as it is applied, so reject it before anything is overwritten.
  const parsedVersion = splitFrontmatter(raw);
  if (!parsedVersion.fields.name || !parsedVersion.fields.description) {
    throw new HttpError(422, `version "${label}" has no name/description in its frontmatter`);
  }
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
  if (!spec || (typeof spec.name !== 'string' && typeof spec.catalogId !== 'string')) {
    throw new HttpError(400, 'skill name is required for each side');
  }
  // A saved version wins over the base body: an AI-improved version of a
  // catalog skill is stored in the project and compared by its label.
  if (spec.label) {
    if (typeof spec.name !== 'string') throw new HttpError(400, 'skill name is required for a version');
    validateName(spec.name);
    const projectRoot = await findProjectRoot(view.cwd);
    const label = safeLabel(spec.label);
    const file = join(versionsDir(projectRoot, spec.name), label, 'SKILL.md');
    assertInside(file, [join(projectRoot, '.dsh')]);
    if (!(await exists(file))) throw new HttpError(404, `version "${label}" of "${spec.name}" not found`);
    const raw = await readFile(file, 'utf8');
    return { name: spec.name, label, raw, body: splitFrontmatter(raw).body };
  }
  // A catalog side is compared from its repository copy, so a skill can be
  // compared before it is installed.
  if (typeof spec.catalogId === 'string' && spec.catalogId !== '') {
    const { entry, content } = await fetchCatalogEntry(spec.catalogId);
    return { name: entry.name, label: null, raw: content, body: splitFrontmatter(content).body };
  }
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
  // The registry may hand back the body only; the file keeps the frontmatter,
  // and an improved version must be written with a complete one.
  let raw = typeof definition.content === 'string' ? definition.content : '';
  if (typeof definition.path === 'string') {
    try {
      raw = await readFile(definition.path, 'utf8');
    } catch {
      // keep the registry copy when the file is unreadable
    }
  }
  return {
    name: spec.name,
    label: null,
    raw,
    body: splitFrontmatter(raw).body,
    description: typeof definition.description === 'string' ? definition.description : '',
  };
}

// The UI sends the active locale id; the model needs a language name.
function promptLanguage(lang) {
  if (lang === 'ru') return 'Russian';
  if (lang === 'zh') return 'Chinese';
  return 'English';
}

function buildComparePrompt(left, right, task, language) {
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
    `Пиши на языке: ${language}.`,
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
  const language = promptLanguage(body.lang);
  const verdict = await judgeVariants(ctx, buildComparePrompt(left, right, task, language));
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
  const original = await readVariant(ctx, view, {
    name: body.name,
    label: body.label,
    catalogId: body.catalogId,
  });
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
  // Keep the version loadable: when the source copy carried no frontmatter
  // fields, restore name/description from the registry definition.
  let frontmatter = parsed.frontmatter;
  if (!/^\s*name\s*:/m.test(frontmatter)) frontmatter = `name: ${original.name}\n${frontmatter}`;
  if (!/^\s*description\s*:/m.test(frontmatter)) {
    const fallback = (original.description || original.name).slice(0, 200);
    frontmatter = `${frontmatter}\ndescription: ${JSON.stringify(fallback)}`;
  }
  const dir = join(versionsDir(projectRoot, original.name), label);
  assertInside(dir, [join(projectRoot, '.dsh')]);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'SKILL.md'), `---\n${frontmatter}\n---\n\n${improvedBody}\n`, 'utf8');

  sendJson(res, 200, {
    skill: original.name,
    label,
    body: improvedBody,
    original: { name: original.name, label: original.label, body: parsed.body },
  });
}

function parseJsonObject(text) {
  const match = /\{[\s\S]*\}/.exec(text);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function listCategories(ctx, url, res) {
  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const projectRoot = await findProjectRoot(view.cwd);
  const { categories } = await mergedCategories(projectRoot);
  sendJson(res, 200, { projectRoot, categories });
}

async function createCategory(ctx, view, body, res) {
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 40) : '';
  if (title === '') throw new HttpError(400, 'title is required');
  const projectRoot = await findProjectRoot(view.cwd);
  const { categories } = await mergedCategories(projectRoot);
  const existing = categories.find((category) => category.title.toLowerCase() === title.toLowerCase());
  if (existing) {
    sendJson(res, 200, { id: existing.id, title: existing.title, categories });
    return;
  }
  const id = slugifyCategory(title) || `cat-${Date.now()}`;
  if (categories.some((category) => category.id === id)) throw new HttpError(409, 'category id already exists');
  const custom = await readCustomCategories(projectRoot);
  custom.push({ id, title });
  await writeCustomCategories(projectRoot, custom);
  const merged = await mergedCategories(projectRoot);
  res.statusCode = 201;
  sendJson(res, 201, { id, title, categories: merged.categories });
}

async function deleteCategory(ctx, url, res) {
  const id = url.searchParams.get('id');
  if (!id) throw new HttpError(400, 'id is required');
  const view = await resolveView(ctx, url.searchParams.get('cwd'));
  const projectRoot = await findProjectRoot(view.cwd);
  const custom = (await readCustomCategories(projectRoot)).filter((category) => category.id !== id);
  await writeCustomCategories(projectRoot, custom);
  const merged = await mergedCategories(projectRoot);
  sendJson(res, 200, { ok: true, categories: merged.categories });
}

async function suggestCategory(ctx, view, body, res) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  if (name === '' && description === '') throw new HttpError(400, 'name or description is required');
  const projectRoot = await findProjectRoot(view.cwd);
  const { categories } = await mergedCategories(projectRoot);
  const list = categories
    .filter((category) => category.id !== 'builtin' && category.id !== 'mine')
    .map((category) => `${category.id} — ${category.title}`)
    .join('\n');
  const content = typeof body.content === 'string' ? body.content.slice(0, 3000) : '';
  const language = promptLanguage(body.lang);
  const prompt = [
    'Выбери категорию для скилла или предложи новую короткую категорию.',
    'Существующие категории (id — название):',
    list,
    '',
    `Скилл: ${name}`,
    `Описание: ${description}`,
    content ? `Инструкции:\n${content}` : '',
    '',
    `Название новой категории — на языке: ${language}.`,
    'Верни строго JSON: {"id":"существующий id"} или {"title":"Название новой категории"}.',
  ].join('\n');
  const text = await streamModel(ctx, 'Ты — аккуратный классификатор скиллов. Отвечай только JSON.', prompt, 300);
  const parsed = parseJsonObject(text);
  let categoryId = null;
  let newTitle = null;
  if (parsed && typeof parsed.id === 'string' && categories.some((category) => category.id === parsed.id)) {
    categoryId = parsed.id;
  } else if (parsed && typeof parsed.title === 'string' && parsed.title.trim() !== '') {
    newTitle = parsed.title.trim().slice(0, 40);
  }
  sendJson(res, 200, { categoryId, newTitle, categories });
}

async function groupByTask(ctx, view, body, res) {
  const task = typeof body.task === 'string' ? body.task.trim() : '';
  if (task === '') throw new HttpError(400, 'task is required');
  const snapshot = await readSnapshot(ctx, view);
  const skills = snapshot.skills.map((skill) => ({
    name: skill.name,
    description: skill.description,
  }));
  if (skills.length === 0) {
    sendJson(res, 200, { groups: [] });
    return;
  }
  const list = skills.map((skill) => `- ${skill.name}: ${skill.description}`).join('\n');
  const language = promptLanguage(body.lang);
  const prompt = [
    `Задача: ${task}`,
    'Ниже список скиллов. Сгруппируй их под эту задачу в 3–6 групп так, чтобы было понятно, что применять на каждом шаге.',
    'Не меняй сами категории скиллов — только назови группы и распредели имена.',
    `Названия групп — на языке: ${language}.`,
    '',
    list,
    '',
    'Верни строго JSON: {"groups":[{"title":"...","skills":["name1","name2"]}]}',
  ].join('\n');
  const text = await streamModel(ctx, 'Ты — методист, раскладывающий инструменты под задачу. Отвечай только JSON.', prompt, 1200);
  const parsed = parseJsonObject(text);
  const known = new Set(skills.map((skill) => skill.name));
  const groups = Array.isArray(parsed && parsed.groups)
    ? parsed.groups
        .filter((group) => group && typeof group.title === 'string' && Array.isArray(group.skills))
        .map((group) => ({
          title: group.title.trim().slice(0, 60),
          skills: group.skills.filter((name) => known.has(name)),
        }))
        .filter((group) => group.title !== '' && group.skills.length > 0)
    : [];
  sendJson(res, 200, { groups });
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
      path: `${PREFIX}api/preview`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          await previewCatalogEntry(url, res);
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
      path: `${PREFIX}api/categories`,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          if (req.method === 'GET') {
            await listCategories(ctx, url, res);
            return;
          }
          if (req.method === 'POST') {
            await createCategory(ctx, view, await readJsonBody(req), res);
            return;
          }
          if (req.method === 'DELETE') {
            await deleteCategory(ctx, url, res);
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
      path: `${PREFIX}api/suggest-category`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          await suggestCategory(ctx, view, await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/group`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          await groupByTask(ctx, view, await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/workspaces`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          await listWorkspaces(res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/archive`,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost');
          if (req.method === 'GET') {
            await listArchive(res);
            return;
          }
          if (req.method === 'POST') {
            const view = await resolveView(ctx, url.searchParams.get('cwd'));
            await archiveSkill(ctx, view, await readJsonBody(req), res);
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
      path: `${PREFIX}api/archive/restore`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          const url = new URL(req.url ?? '/', 'http://localhost');
          const view = await resolveView(ctx, url.searchParams.get('cwd'));
          await restoreArchive(view, await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/archive/delete`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          await deleteArchived(await readJsonBody(req), res);
        } catch (error) {
          errorResponse(res, error);
        }
      },
    },
    {
      kind: 'exact',
      path: `${PREFIX}api/archive/empty`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' });
            return;
          }
          await emptyArchive(res);
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
