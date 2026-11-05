// Adds English titles/descriptions to the catalog: Russian stays for `ru`,
// English serves every other UI language.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('../catalog/catalog.json', import.meta.url));
const catalog = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const CATEGORY_EN = {
  documents: { title: 'Documents', description: 'Word, Excel, PowerPoint and PDF: create, edit, extract data.' },
  development: { title: 'Development', description: 'MCP servers, web app testing, HTML artifact builds.' },
  design: { title: 'Design', description: 'Visual artifacts and brand guidelines.' },
  meta: { title: 'Meta', description: 'Creating and improving skills themselves.' },
};

const SKILL_EN = {
  docx: {
    title: 'Word documents',
    description: 'Create, read and edit .docx files: text, styles, tables, headers and footers; keeps the original formatting.',
  },
  pdf: {
    title: 'PDF',
    description: 'Extract text and tables, create, merge and split PDFs, and work with forms.',
  },
  pptx: {
    title: 'Presentations',
    description: 'Create and edit PowerPoint decks: slides, layouts, notes, export.',
  },
  xlsx: {
    title: 'Spreadsheets',
    description: 'Excel workbooks: formulas, formatting, data analysis, charts.',
  },
  'mcp-builder': {
    title: 'MCP servers',
    description: 'Step-by-step MCP server development: tools, resources, prompts, tests and debugging.',
  },
  'webapp-testing': {
    title: 'Web app testing',
    description: 'Test local web apps with Playwright: scenarios, screenshots, debugging.',
  },
  'web-artifacts-builder': {
    title: 'HTML artifacts',
    description: 'Build multi-part HTML artifacts with React, Tailwind and shadcn in a single file.',
  },
  'canvas-design': {
    title: 'Visual design',
    description: 'Posters and visual artifacts in PNG and PDF from a text prompt.',
  },
  'brand-guidelines': {
    title: 'Brand guidelines',
    description: 'Anthropic brand colors and typography for documents and artifacts.',
  },
  'skill-creator': {
    title: 'Skill creation',
    description: 'Meta-skill: helps design and write new skills to the Agent Skills standard.',
  },
};

const withEnglish = (entry, extra) => {
  const out = {};
  for (const [key, value] of Object.entries(entry)) {
    out[key] = value;
    if (key === 'title' && extra.title) out.titleEn = extra.title;
    if (key === 'description' && extra.description) out.descriptionEn = extra.description;
  }
  return out;
};

catalog.categories = catalog.categories.map((category) =>
  withEnglish(category, CATEGORY_EN[category.id] ?? {}),
);
catalog.skills = catalog.skills.map((skill) => withEnglish(skill, SKILL_EN[skill.id] ?? {}));

const format = (value, indent = 0) => {
  const pad = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === 'string') && value.join(', ').length < 80) {
      return `[${value.map((item) => JSON.stringify(item)).join(', ')}]`;
    }
    return `[\n${value.map((item) => `${' '.repeat(indent + 2)}${format(item, indent + 2)}`).join(',\n')}\n${pad}]`;
  }
  if (value && typeof value === 'object') {
    const lines = Object.entries(value).map(
      ([key, item]) => `${' '.repeat(indent + 2)}${JSON.stringify(key)}: ${format(item, indent + 2)}`,
    );
    return `{\n${lines.join(',\n')}\n${pad}}`;
  }
  return JSON.stringify(value);
};

fs.writeFileSync(FILE, `${format(catalog)}\n`);
console.log('catalog updated');
