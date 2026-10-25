// Checks the theme before any upload:
//   1. every {% for %}, {% if %}, {% require_head %}, {% require_css %}, {% scope_css %} and {% dnd_* %} tag is closed, in order
//   2. every module.<path> the module.html reads exists in its fields.json
//   3. every fields.json, meta.json and theme.json parses, and every template extends the base and names real modules
//   node check-theme.mjs [theme folder]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const THEME = path.resolve(
  process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), 'theme', 'litora')
);
const problems = [];
const PAIRS = {
  for: 'endfor',
  if: 'endif',
  require_head: 'end_require_head',
  require_css: 'end_require_css',
  scope_css: 'end_scope_css',
  dnd_area: 'end_dnd_area',
  dnd_section: 'end_dnd_section',
  dnd_module: 'end_dnd_module',
  block: 'endblock',
};
const CLOSERS = new Map(Object.entries(PAIRS).map(([a, b]) => [b, a]));

function checkTags(file, text) {
  // an expression opened inside another one ("{{ /path/{{ x }}") is refused by HubSpot on upload
  for (const m of text.matchAll(/\{\{(?:(?!\}\}).)*?\{\{/gs))
    problems.push(`${file}: "{{" inside "{{": ${m[0].slice(0, 60)}`);
  const stack = [];
  for (const m of text.matchAll(/\{%-?\s*(\w+)/g)) {
    const tag = m[1];
    if (tag in PAIRS) stack.push(tag);
    else if (CLOSERS.has(tag)) {
      const open = stack.pop();
      if (open !== CLOSERS.get(tag)) problems.push(`${file}: ${tag} closes ${open || 'nothing'}`);
    }
  }
  if (stack.length) problems.push(`${file}: not closed: ${stack.join(', ')}`);
}

// the dotted paths a fields.json offers (groups and repeaters are walked; a repeater is read through its loop variable)
function fieldPaths(fields, prefix = '') {
  const out = new Set();
  for (const f of fields) {
    const p = prefix + f.name;
    out.add(p);
    if (f.type === 'image') ['src', 'alt', 'width', 'height', 'loading'].forEach((k) => out.add(`${p}.${k}`));
    // a logo field gives the logo of the brand settings, or its own, with the same keys as an image
    if (f.type === 'logo')
      ['src', 'alt', 'width', 'height', 'loading', 'override_inherited_src'].forEach((k) => out.add(`${p}.${k}`));
    // the style fields give their parts and the css HubSpot writes from them
    const parts = {
      color: ['color', 'opacity'],
      font: ['font', 'font_set', 'fallback', 'color', 'variant', 'css'],
      spacing: ['css', 'padding', 'margin'],
      border: ['css'],
    }[f.type];
    if (parts) parts.forEach((k) => out.add(`${p}.${k}`));
    if (f.children) for (const c of fieldPaths(f.children, `${p}.`)) out.add(c);
  }
  return out;
}

const modules = fs.readdirSync(path.join(THEME, 'modules'));
for (const dir of modules) {
  const base = path.join(THEME, 'modules', dir);
  const html = fs.readFileSync(path.join(base, 'module.html'), 'utf8');
  checkTags(`${dir}/module.html`, html);
  let fields;
  try {
    fields = JSON.parse(fs.readFileSync(path.join(base, 'fields.json'), 'utf8'));
    JSON.parse(fs.readFileSync(path.join(base, 'meta.json'), 'utf8'));
  } catch (e) {
    problems.push(`${dir}: ${e.message}`);
    continue;
  }
  const paths = fieldPaths(fields);
  // loop variables: "for x in module.a.b" makes x.c read module.a.b.c
  const loops = new Map();
  for (const m of html.matchAll(/\{%\s*for (\w+) in ([\w.]+)\s*%\}/g)) loops.set(m[1], m[2]);
  const expand = (ref) => {
    const [head, ...rest] = ref.split('.');
    if (head === 'module') return rest.join('.');
    if (loops.has(head)) {
      const parent = expand(loops.get(head));
      return parent === null ? null : [parent, ...rest].filter(Boolean).join('.');
    }
    return null;
  };
  for (const m of html.matchAll(/\b((?:module|[a-z_]+)\.[\w.]+)/g)) {
    const ref = m[1].replace(/\.$/, '');
    const head = ref.split('.')[0];
    if (head !== 'module' && !loops.has(head)) continue;
    const p = expand(ref);
    if (p && !paths.has(p)) problems.push(`${dir}/module.html reads ${ref} (${p}), not in fields.json`);
  }
}
for (const f of ['theme.json', 'fields.json']) {
  try {
    JSON.parse(fs.readFileSync(path.join(THEME, f), 'utf8'));
  } catch (e) {
    problems.push(`${f}: ${e.message}`);
  }
}
const names = new Set(modules.map((d) => d.replace(/\.module$/, '')));
for (const t of fs.readdirSync(path.join(THEME, 'templates')).filter((f) => f.endsWith('.html'))) {
  const text = fs.readFileSync(path.join(THEME, 'templates', t), 'utf8');
  checkTags(`templates/${t}`, text);
  if (!text.includes('{% extends "./layouts/base.html" %}')) problems.push(`templates/${t}: does not extend the base`);
  for (const m of text.matchAll(/path="\.\.\/modules\/([\w-]+)"/g))
    if (!names.has(m[1])) problems.push(`templates/${t}: no module ${m[1]}`);
}
checkTags(
  'templates/layouts/base.html',
  fs.readFileSync(path.join(THEME, 'templates', 'layouts', 'base.html'), 'utf8')
);

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problems`);
  process.exit(1);
}
console.log(
  `${path.basename(THEME)}: ${modules.length} modules and their templates pass (tags closed, every field read exists)`
);
