import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { renderMarkdown } from './src/lib/markdown.mjs';
import { generatedCss, clothNames } from './src/lib/stitch.mjs';
import { homePage, collectionPage, paperPage, searchPage, notFoundPage } from './src/lib/templates.mjs';
import { slug as slugify } from './src/lib/visuals.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(HERE, 'content');
const SRC = path.join(HERE, 'src', 'assets');
const DIST = path.join(HERE, 'dist');

const STATUSES = ['draft', 'working', 'reviewed', 'final'];
const KINDS = ['primary', 'secondary', 'unverified'];
const warnings = [];

const fail = (msg) => {
  throw new Error(msg);
};
const rel = (p) => path.relative(HERE, p).replace(/\\/g, '/');

function isoDate(v, where, field) {
  if (v === undefined || v === null || v === '') return '';
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) fail(`${where}: "${field}" is not a date (${v}). Use YYYY-MM-DD.`);
  return d.toISOString().slice(0, 10);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`${rel(file)}: ${e.message}`);
  }
}

const site = { title: 'Research Library', tagline: '', intro: '', description: '', author: '', url: '', language: 'en', cloth: 'indigo', ...readJson(path.join(HERE, 'site.config.json')) };
if (!clothNames.includes(site.cloth)) fail(`site.config.json: unknown cloth "${site.cloth}". Use one of: ${clothNames.join(', ')}`);

/* ---------- read content ---------- */

const humanise = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
const collections = [];
const byId = new Map();

if (fs.existsSync(CONTENT)) {
  const dirs = fs
    .readdirSync(CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[._]/.test(d.name))
    .map((d) => d.name)
    .sort();

  dirs.forEach((dir, idx) => {
    const cfgFile = path.join(CONTENT, dir, '_collection.json');
    const cfg = fs.existsSync(cfgFile) ? readJson(cfgFile) : {};
    if (!fs.existsSync(cfgFile)) warnings.push(`content/${dir}: no _collection.json, using defaults`);
    const cloth = cfg.cloth ?? clothNames[idx % clothNames.length];
    if (!clothNames.includes(cloth)) fail(`content/${dir}/_collection.json: unknown cloth "${cloth}". Use one of: ${clothNames.join(', ')}`);
    const collection = {
      slug: dir,
      title: cfg.title ?? humanise(dir),
      summary: cfg.summary ?? '',
      cloth,
      order: cfg.order ?? 100 + idx,
      papers: [],
    };

    const files = fs.readdirSync(path.join(CONTENT, dir)).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort();
    for (const f of files) {
      const file = path.join(CONTENT, dir, f);
      const where = rel(file);
      const { data, content } = matter(fs.readFileSync(file, 'utf8'));
      if (!data.title) fail(`${where}: front matter needs a "title".`);
      if (!data.summary) fail(`${where}: front matter needs a "summary" (one or two sentences).`);
      const status = data.status ?? 'draft';
      if (!STATUSES.includes(status)) fail(`${where}: status "${status}" is not one of ${STATUSES.join(', ')}.`);
      const date = isoDate(data.date, where, 'date') || new Date().toISOString().slice(0, 10);
      const updated = isoDate(data.updated, where, 'updated') || date;
      const fileSlug = slugify(f.replace(/\.md$/, '')) || fail(`${where}: cannot make a URL from this file name.`);
      const sources = (data.sources ?? []).map((s, i) => {
        if (!s?.label) fail(`${where}: sources[${i}] needs a "label".`);
        const kind = s.kind ?? 'secondary';
        if (!KINDS.includes(kind)) fail(`${where}: sources[${i}].kind "${kind}" is not one of ${KINDS.join(', ')}.`);
        return { label: String(s.label), url: s.url ? String(s.url) : '', kind };
      });
      const paper = {
        id: `${dir}/${fileSlug}`,
        collection,
        slug: fileSlug,
        file: where,
        title: String(data.title),
        subtitle: data.subtitle ? String(data.subtitle) : '',
        summary: String(data.summary),
        date,
        updated,
        status,
        tags: (data.tags ?? []).map(String),
        afterRaw: [].concat(data.after ?? []).map(String),
        after: [],
        leadsOn: [],
        order: data.order ?? 1000,
        sources,
        content,
      };
      if (byId.has(paper.id)) fail(`${where}: duplicate paper id ${paper.id}.`);
      byId.set(paper.id, paper);
      collection.papers.push(paper);
    }
    collection.papers.sort((a, b) => a.order - b.order || a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
    collections.push(collection);
  });
}
collections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

/* ---------- resolve links between papers ---------- */

const resolveRef = (ref, from) => {
  const id = ref.includes('/') ? ref : `${from.collection.slug}/${ref}`;
  return byId.has(id) ? id : null;
};
for (const p of byId.values()) {
  for (const ref of p.afterRaw) {
    const id = resolveRef(ref, p);
    if (!id) fail(`${p.file}: "after" refers to "${ref}", which is not a paper. Use "collection/paper-name".`);
    if (id === p.id) fail(`${p.file}: a paper cannot come after itself.`);
    p.after.push(id);
    byId.get(id).leadsOn.push(p.id);
  }
}

/* ---------- render markdown ---------- */

for (const p of byId.values()) {
  const rewriteLink = (target, file) => {
    const [ref, hash] = target.split('#');
    const id = resolveRef(ref, p);
    if (!id) fail(`${file}: link "@${target}" does not match a paper.`);
    const [c, s] = id.split('/');
    return `../../${c}/${s}/${hash ? `#${hash}` : ''}`;
  };
  const out = renderMarkdown(p.content, { root: '../../', collection: p.collection.slug, file: p.file, rewriteLink });
  Object.assign(p, out);
  p.words = out.plain.split(/\s+/).filter(Boolean).length;
  p.readMin = Math.max(1, Math.round(p.words / 200));
  if (p.words < 120) warnings.push(`${p.file}: only ${p.words} words`);
  const seen = new Set();
  for (const h of p.headings) {
    if (seen.has(h.id)) warnings.push(`${p.file}: duplicate heading id ${h.id}`);
    seen.add(h.id);
  }
}

/* ---------- write site ---------- */

fs.rmSync(DIST, { recursive: true, force: true });
const write = (file, text) => {
  const full = path.join(DIST, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text);
};
const rootFor = (depth) => (depth === 0 ? './' : '../'.repeat(depth));

const allPapers = [...byId.values()];
const recent = [...allPapers].sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title)).slice(0, 6);

write('index.html', homePage({ site, root: rootFor(0), collections, recent }));
for (const c of collections) {
  write(`${c.slug}/index.html`, collectionPage({ site, root: rootFor(1), collection: c }));
  for (const p of c.papers) write(`${c.slug}/${p.slug}/index.html`, paperPage({ site, root: rootFor(2), paper: p, byId }));
}
write('search/index.html', searchPage({ site, root: rootFor(1) }));

let base = '/';
if (site.url) {
  try {
    base = new URL(site.url).pathname.replace(/\/?$/, '/');
  } catch {
    fail(`site.config.json: "url" is not a valid address (${site.url}).`);
  }
} else {
  warnings.push('site.config.json: "url" is empty, so 404.html assumes the site lives at the domain root. Set it before publishing to a project page.');
}
write('404.html', notFoundPage({ site, root: '', base }));

write(
  'search-index.json',
  JSON.stringify(
    allPapers.map((p) => ({
      u: `${p.collection.slug}/${p.slug}/`,
      t: p.title,
      c: p.collection.title,
      s: p.summary,
      g: p.tags,
      h: p.headings.map((h) => h.text),
      b: p.plain,
    }))
  )
);

const css = [
  fs.readFileSync(path.join(SRC, 'fonts.css'), 'utf8'),
  generatedCss(),
  fs.readFileSync(path.join(SRC, 'style.css'), 'utf8'),
].join('\n');
write('assets/site.css', css);
write('assets/app.js', fs.readFileSync(path.join(SRC, 'app.js'), 'utf8'));
fs.cpSync(path.join(SRC, 'fonts'), path.join(DIST, 'assets', 'fonts'), { recursive: true });
write('.nojekyll', '');

if (site.url) {
  const origin = site.url.replace(/\/$/, '');
  const urls = ['', 'search/', ...collections.flatMap((c) => [`${c.slug}/`, ...c.papers.map((p) => `${c.slug}/${p.slug}/`)])];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${origin}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
}

console.log(`Built ${collections.length} collections, ${allPapers.length} papers -> dist/`);
for (const w of warnings) console.warn(`warning: ${w}`);
