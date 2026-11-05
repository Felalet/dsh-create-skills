// Builds the three icon variants as SVG and writes variants.json, which the
// Python rasterizer turns into the preview sheet. One geometry source feeds
// both outputs, so the SVG and the PNG preview agree.
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('C:/Users/User/Documents/deepseek-harness/default-workspace/create-skills/icons');

const VARIANTS = [
  {
    id: 'a',
    title: 'A · Лист + искра',
    note: 'SKILL.md как документ, искра — создание',
    from: '#2f6fed',
    to: '#2456c7',
    accent: '#2f6fed',
    shapes: [
      { t: 'rrect', box: [15, 11, 41, 53], r: 4, fill: '#ffffff' },
      { t: 'rrect', box: [20, 20, 36, 23], r: 1.5, fill: 'accent' },
      { t: 'rrect', box: [20, 28, 34, 31], r: 1.5, fill: 'accent', alpha: 0.7 },
      { t: 'rrect', box: [20, 36, 35, 39], r: 1.5, fill: 'accent', alpha: 0.45 },
      { t: 'star', c: [50, 18], r: 7, fill: '#ffffff' },
      { t: 'star', c: [47, 45], r: 4, fill: '#ffffff', alpha: 0.7 },
    ],
  },
  {
    id: 'b',
    title: 'B · Стопка карточек',
    note: 'каталог навыков, верхняя — с искрой',
    from: '#12a89d',
    to: '#0c7d75',
    accent: '#12a89d',
    shapes: [
      { t: 'rrect', box: [16, 12, 44, 21], r: 4.5, fill: '#ffffff' },
      { t: 'rrect', box: [16, 25, 48, 34], r: 4.5, fill: '#ffffff', alpha: 0.88 },
      { t: 'rrect', box: [16, 38, 39, 47], r: 4.5, fill: '#ffffff', alpha: 0.72 },
      { t: 'star', c: [51, 15], r: 6, fill: '#ffffff' },
    ],
  },
  {
    id: 'c',
    title: 'C · Пазл + искра',
    note: 'плагин, встраивающийся в DSH',
    from: '#6d5efc',
    to: '#4f46e5',
    accent: '#6d5efc',
    shapes: [
      { t: 'rrect', box: [18, 18, 46, 46], r: 5, fill: '#ffffff' },
      { t: 'circle', c: [32, 18], r: 7, fill: '#ffffff' },
      { t: 'circle', c: [46, 32], r: 6.5, fill: 'bg' },
      { t: 'star', c: [52, 15], r: 5, fill: '#ffffff', alpha: 0.85 },
    ],
  },
];

const hex = (value) => value.replace('#', '');
const rgb = (value) => [0, 2, 4].map((i) => parseInt(hex(value).slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const at = (from, to, y) => mix(rgb(from), rgb(to), Math.min(1, Math.max(0, y / 64)));
const hexOf = (channels) => `#${channels.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

function starPoints([cx, cy], r) {
  const k = 0.24 * r;
  return [
    [cx, cy - r], [cx + k, cy - k], [cx + r, cy], [cx + k, cy + k],
    [cx, cy + r], [cx - k, cy + k], [cx - r, cy], [cx - k, cy - k],
  ];
}

function svgShape(shape, variant) {
  const fill = shape.fill === 'accent'
    ? variant.accent
    : shape.fill === 'bg'
      ? hexOf(at(variant.from, variant.to, shape.c[1]))
      : shape.fill;
  const opacity = shape.alpha === undefined ? '' : ` opacity="${shape.alpha}"`;
  if (shape.t === 'rrect') {
    const [x0, y0, x1, y1] = shape.box;
    return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="${shape.r}" fill="${fill}"${opacity}/>`;
  }
  if (shape.t === 'circle') {
    return `<circle cx="${shape.c[0]}" cy="${shape.c[1]}" r="${shape.r}" fill="${fill}"${opacity}/>`;
  }
  const points = starPoints(shape.c, shape.r).map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  return `<polygon points="${points}" fill="${fill}"${opacity}/>`;
}

function svgOf(variant) {
  const gradientId = `g${variant.id}`;
  const body = variant.shapes.map((shape) => `    ${svgShape(shape, variant)}`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Create Skills">
  <defs>
    <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${variant.from}"/>
      <stop offset="1" stop-color="${variant.to}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#${gradientId})"/>
  <g>
${body}
  </g>
</svg>
`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const variant of VARIANTS) {
  fs.writeFileSync(path.join(OUT, `option-${variant.id}.svg`), svgOf(variant));
  console.log('wrote', `option-${variant.id}.svg`);
}
fs.writeFileSync(path.join(OUT, 'variants.json'), JSON.stringify(VARIANTS, null, 2));
console.log('wrote variants.json');
