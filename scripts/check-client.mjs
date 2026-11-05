#!/usr/bin/env node
// Client-side checks that need no browser: the module must register and the
// ru/en/zh dictionaries must carry the same key set.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, 'client.js');
const source = fs.readFileSync(file, 'utf8');

let entry = null;
globalThis.window = {
  __ModuleLoader__: { load: (value) => { entry = value; } },
  addEventListener() {},
  removeEventListener() {},
  location: { href: '' },
};
globalThis.document = { documentElement: { lang: 'ru' } };
Object.defineProperty(globalThis, 'navigator', {
  value: { language: 'ru-RU' },
  configurable: true,
  writable: true,
});

class Component {
  constructor(props) { this.props = props; this.state = {}; }
  setState() {}
  forceUpdate() {}
}
const React = {
  Component,
  createElement: () => null,
  useState: (value) => [typeof value === 'function' ? value() : value, () => {}],
  useEffect: () => {},
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  useRef: () => ({ current: null }),
  memo: (component) => component,
  Fragment: 'fragment',
};

const failures = [];

// Import through the same CommonJS path the plugin loader uses.
await import(`file:///${file.replace(/\\/g, '/')}`);
if (!entry) failures.push('module did not call window.__ModuleLoader__.load');
else {
  try {
    const exported = entry.factory((id) => (id === 'react' ? React : {}));
    if (!exported || typeof exported.apply !== 'function') failures.push('module did not export apply');
    else console.log(`module ok: ${entry.id} (${Object.keys(exported).join(', ')})`);
  } catch (error) {
    failures.push(`module init threw: ${error.message}`);
  }
}

const block = (name) => {
  const start = source.indexOf(`const ${name} = {`);
  if (start === -1) return '';
  return source.slice(start, source.indexOf('\n    };', start));
};
const keys = (text) => [...text.matchAll(/^ {6}([A-Za-z0-9_]+):/gm)].map((match) => match[1]);

const ru = keys(block('RU'));
const en = keys(block('EN'));
const zh = keys(block('ZH'));
if (ru.length === 0 || en.length === 0 || zh.length === 0) {
  failures.push('a dictionary block is missing or empty');
} else {
  for (const [label, other] of [['en', en], ['zh', zh]]) {
    const missing = ru.filter((key) => !other.includes(key));
    const extra = other.filter((key) => !ru.includes(key));
    if (missing.length) failures.push(`${label} is missing: ${missing.join(', ')}`);
    if (extra.length) failures.push(`${label} has extra: ${extra.join(', ')}`);
  }
  console.log(`dictionaries: ru ${ru.length}, en ${en.length}, zh ${zh.length}`);

  // Every t('key') / tr('key') must exist in the dictionary, otherwise the UI
  // would render the raw key name.
  const used = new Set([
    ...[...source.matchAll(/\bt\(\s*'([^']+)'\s*\)/g)].map((match) => match[1]),
    ...[...source.matchAll(/\btr\(\s*'([^']+)'\s*\)/g)].map((match) => match[1]),
  ]);
  const missingKeys = [...used].filter((key) => !ru.includes(key));
  if (missingKeys.length) failures.push(`t() keys missing in ru: ${missingKeys.join(', ')}`);

  // Hardcoded Russian outside the RU dictionary means an untranslated string.
  const ruStart = source.indexOf('const RU = {');
  const ruEnd = source.indexOf('\n    };', ruStart);
  const outsideRu = source.slice(0, ruStart) + source.slice(ruEnd);
  const hardcoded = outsideRu
    .split(/\r?\n/)
    .filter((line) => /[А-Яа-яЁё]/.test(line) && !/^\s*\/\//.test(line));
  if (hardcoded.length > 0) {
    failures.push(`hardcoded Cyrillic outside the RU dictionary (${hardcoded.length} lines)`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`error: ${failure}`);
  process.exit(1);
}
console.log('client checks OK');
