#!/usr/bin/env node
// Validates catalog/catalog.json: structure, unique ids/names, kebab-case, category refs.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const file = join(root, 'catalog', 'catalog.json');
const catalog = JSON.parse(readFileSync(file, 'utf8'));

const errors = [];
const warnings = [];
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (catalog.version !== 1) errors.push(`version: expected 1, got ${catalog.version}`);
if (!Array.isArray(catalog.categories) || catalog.categories.length === 0) errors.push('categories: must be a non-empty array');
if (!Array.isArray(catalog.skills) || catalog.skills.length === 0) errors.push('skills: must be a non-empty array');

const categories = new Set();
for (const category of catalog.categories ?? []) {
  if (!category.id) errors.push('category without id');
  if (categories.has(category.id)) errors.push(`duplicate category id: ${category.id}`);
  categories.add(category.id);
  if (!category.title) warnings.push(`category ${category.id}: missing title`);
}

const ids = new Set();
const names = new Set();
for (const skill of catalog.skills ?? []) {
  const at = skill.id ?? skill.name ?? '<unknown>';
  for (const field of ['id', 'name', 'title', 'description', 'category', 'source']) {
    if (!skill[field]) errors.push(`${at}: missing ${field}`);
  }
  if (skill.name && !KEBAB.test(skill.name)) errors.push(`${at}: name is not kebab-case`);
  if (ids.has(skill.id)) errors.push(`duplicate id: ${skill.id}`);
  if (names.has(skill.name)) errors.push(`duplicate skill name: ${skill.name}`);
  ids.add(skill.id);
  names.add(skill.name);
  if (skill.category && !categories.has(skill.category)) errors.push(`${at}: unknown category ${skill.category}`);
  if (skill.source) {
    if (skill.source.type !== 'github') errors.push(`${at}: unsupported source.type ${skill.source.type}`);
    for (const field of ['repo', 'path', 'ref']) {
      if (!skill.source[field]) errors.push(`${at}: source.${field} missing`);
    }
  }
  if (!skill.license) warnings.push(`${at}: missing license`);
}

const byCategory = new Map();
for (const skill of catalog.skills ?? []) {
  byCategory.set(skill.category, (byCategory.get(skill.category) ?? 0) + 1);
}

console.log(`categories: ${categories.size}, skills: ${catalog.skills?.length ?? 0}`);
for (const [id, count] of byCategory) console.log(`  ${id}: ${count}`);
for (const warning of warnings) console.warn(`warn: ${warning}`);
if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}
console.log('catalog OK');
