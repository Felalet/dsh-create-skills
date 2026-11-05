// Exercises the real previewCatalogEntry source against GitHub, with stubbed
// host plumbing, so the URL shape and response contract are checked without
// booting DSH.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = fs.readFileSync(fileURLToPath(new URL('../index.js', import.meta.url)), 'utf8');

const grab = (name) => {
  const start = source.indexOf(`async function ${name}(`);
  if (start === -1) throw new Error(`missing ${name}`);
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

const CATALOG_PATH = fileURLToPath(new URL('../catalog/catalog.json', import.meta.url));
const previewCache = new Map();
const MAX_PREVIEW_BYTES = 512 * 1024;
const readFile = fs.promises.readFile;
let sent = null;
const sendJson = (res, status, value) => {
  sent = { status, value };
};

const code = [grab('fetchCatalogEntry'), grab('previewCatalogEntry')].join('\n\n');
const run = new Function(
  'readFile', 'fetch', 'HttpError', 'CATALOG_PATH', 'previewCache', 'MAX_PREVIEW_BYTES', 'sendJson',
  `${code}\nreturn previewCatalogEntry;`,
)(readFile, fetch, HttpError, CATALOG_PATH, previewCache, MAX_PREVIEW_BYTES, sendJson);

await run({ searchParams: new Map([['id', 'docx']]) }, {});
console.log('status:', sent.status);
console.log('fields:', Object.keys(sent.value).join(', '));
console.log('content bytes:', sent.value.content.length, '| starts:', JSON.stringify(sent.value.content.slice(0, 12)));
console.log('raw:', sent.value.rawUrl);
console.log('titleEn:', sent.value.titleEn, '| license:', sent.value.license);

// Second call must be served from the cache.
const first = sent.value.content;
sent = null;
await run({ searchParams: new Map([['id', 'docx']]) }, {});
console.log('cached call identical:', sent.value.content === first, '| cache size:', previewCache.size);

try {
  await run({ searchParams: new Map() }, {});
} catch (error) {
  console.log('missing id ->', error.status, error.message);
}
