#!/usr/bin/env node
// Exercises the real archive functions against a throwaway project, with the
// skills snapshot and the home directory stubbed.
import fs from 'node:fs';
import os from 'node:os';
import { join, dirname, basename, resolve, sep, isAbsolute, relative } from 'node:path';
import * as fsp from 'node:fs/promises';

const source = fs.readFileSync(
  'C:/Users/User/Documents/deepseek-harness/default-workspace/create-skills/index.js',
  'utf8',
);

const grab = (name) => {
  const marker = source.indexOf(`function ${name}(`);
  const asyncMarker = source.indexOf(`async function ${name}(`);
  const start = [marker, asyncMarker].filter((index) => index >= 0).sort((a, b) => a - b)[0];
  if (start === undefined) throw new Error(`missing ${name}`);
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`unbalanced ${name}`);
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const root = await fsp.mkdtemp(join(os.tmpdir(), 'cs-archive-'));
const home = join(root, 'dsh');
const agents = join(root, 'agents');
const project = join(root, 'proj');
const skillDir = join(project, '.dsh', 'skills', 'demo');
const skillFile = join(skillDir, 'SKILL.md');
await fsp.mkdir(skillDir, { recursive: true });
await fsp.writeFile(
  skillFile,
  '---\nname: demo\ndescription: "Demo skill"\nmetadata:\n  category: "development"\n---\n\n# Demo\n',
  'utf8',
);

const snapshot = { skills: [{ name: 'demo', source: 'project-dsh', path: skillFile }] };
let sent = null;
const sendJson = (res, status, value) => {
  sent = { status, value };
};

const names = [
  'comparablePath', 'isInsidePath', 'assertInside', 'allowedRoots', 'isSkillRootPath',
  'archiveRoot', 'archiveEntryId', 'movePath', 'exists',
  'archiveSkill', 'listArchive', 'restoreArchive', 'deleteArchived', 'emptyArchive',
];
const body = names.map(grab).join('\n\n');

// parseCategory/splitFrontmatter contain braces inside regexes, so the naive
// brace scanner cannot extract them; the test supplies faithful stand-ins.
const splitFrontmatter = (text) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  return match ? { frontmatter: match[1], body: text.slice(match[0].length) } : { frontmatter: '', body: text };
};
const parseCategory = (frontmatter) => {
  const match = /^\s+category:\s*(.*)$/m.exec(frontmatter);
  return match ? match[1].replace(/["']/g, '').trim() : '';
};

const run = new Function(
  'readFile', 'readdir', 'rm', 'mkdir', 'rename', 'cp', 'writeFile', 'stat',
  'join', 'dirname', 'basename', 'resolve', 'sep', 'isAbsolute', 'relative',
  'dshHome', 'agentsHome', 'readSnapshot', 'findWritable', 'findProjectRoot', 'sendJson', 'HttpError',
  'splitFrontmatter', 'parseCategory',
  `${body}\nreturn { archiveSkill, listArchive, restoreArchive, deleteArchived, emptyArchive, archiveRoot };`,
)(
  fsp.readFile, fsp.readdir, fsp.rm, fsp.mkdir, fsp.rename, fsp.cp, fsp.writeFile, fsp.stat,
  join, dirname, basename, resolve, sep, isAbsolute, relative,
  () => home,
  () => agents,
  async () => snapshot,
  async (snap, name) => snap.skills.find((skill) => skill.name === name),
  async () => project,
  sendJson,
  HttpError,
  splitFrontmatter,
  parseCategory,
);

const view = { cwd: project };
const check = (label, condition) => console.log(`${condition ? 'ok  ' : 'FAIL'} ${label}`);

await run.archiveSkill({}, view, { name: 'demo' }, {});
check('archive returned 200', sent && sent.status === 200);
check('skill directory moved out', !fs.existsSync(skillDir));
check('archive entry created', fs.existsSync(join(run.archiveRoot(), sent.value.id, 'meta.json')));

await run.listArchive({});
check('list has one entry', sent.value.entries.length === 1);
check('category preserved', sent.value.entries[0].category === 'development');
const id = sent.value.entries[0].id;

await run.restoreArchive(view, { id }, {});
check('restore returned 200', sent && sent.status === 200);
check('skill restored to origin', fs.existsSync(skillFile));

await run.archiveSkill({}, view, { name: 'demo' }, {});
const second = sent.value.id;
await run.deleteArchived({ id: second }, {});
check('permanent delete works', sent && sent.status === 200);
await run.listArchive({});
check('archive is empty', sent.value.entries.length === 0);

const recreate = async () => {
  await fsp.mkdir(skillDir, { recursive: true });
  await fsp.writeFile(skillFile, '---\nname: demo\ndescription: "Demo skill"\n---\n\n# Demo\n', 'utf8');
};

await recreate();
await run.archiveSkill({}, view, { name: 'demo' }, {});
await recreate();
await run.archiveSkill({}, view, { name: 'demo' }, {});
await run.emptyArchive({});
check('empty archive removed entries', sent.value.removed >= 1);
await run.listArchive({});
check('archive empty after empty()', sent.value.entries.length === 0);

await fsp.rm(root, { recursive: true, force: true });
