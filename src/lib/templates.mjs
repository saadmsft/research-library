import { esc } from './visuals.mjs';
import { faviconHref } from './stitch.mjs';

export const CONTRACT = `<!--
THESIS: A research library is a bound book you read inside. Collections are volumes, papers are signatures, and one stitched chain is both the spine and the way you move.
OWN-WORLD: Coptic exposed-spine binding. Bookcloth boards, linen chain-stitch, rag paper, blind-tooled titles, tipped-in slips.
STORY: A reader picks a volume from the shelf, reads while the spine sews itself shut beside them, and sees which claims were checked.
FIRST VIEWPORT: The tagline, then volumes standing on a ledge, each as tall as its paper count, their spines already sewn.
FORM: list position 6 (re-roll 1); challenger craft-making-coptic-exposed-binding; staging prerequisite terrain (read-first chain plus local read state); seed 88962dc9.
-->`;

const LOBE =
  '<svg class="lobe" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1C4.5 6 4.5 18 12 23C19.5 18 19.5 6 12 1Z"/></svg>';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const fmtDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const STATUS_LABEL = { draft: 'Draft', working: 'Working', reviewed: 'Reviewed', final: 'Final' };
const KIND_LABEL = { primary: 'Primary', secondary: 'Secondary', unverified: 'Unverified' };

export function layout({ site, root, title, description, cloth, pageClass, cover = '', body, path = '', base = '', noindex = false, current = '' }) {
  const full = title === site.title ? site.title : `${title} · ${site.title}`;
  const canonical = site.url ? `${site.url.replace(/\/$/, '')}/${path}` : '';
  const hasCover = Boolean(cover);
  const cur = (k) => (current === k ? ' aria-current="page"' : '');
  return `<!doctype html>
<html lang="${esc(site.language)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${base ? `<base href="${esc(base)}">\n` : ''}<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#f5f2ea">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n` : ''}<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="icon" href="${faviconHref(cloth)}">
<link rel="preload" href="${root}assets/fonts/literata-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/site.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="cloth-${cloth} ${pageClass}" data-root="${root}">
${CONTRACT}
<a class="skip" href="#main">Skip to content</a>
<div class="rail" aria-hidden="true"><span class="chain-col"><i></i></span></div>
<div class="frame${hasCover ? ' frame--cover' : ''}">
<header class="top">
<a class="top__name" href="${root}">${LOBE}<span>${esc(site.title)}</span></a>
<nav class="top__nav" aria-label="Main"><a href="${root}"${cur('library')}>Library</a><a href="${root}search/"${cur('search')}>Search</a></nav>
</header>
<main id="main">
${cover}${body}
</main>
<footer class="foot">
<p class="foot__name">${esc(site.title)}</p>
<p class="foot__text">${esc(site.description)}</p>
<p class="foot__fine">${site.author ? `${esc(site.author)}. ` : ''}Built from Markdown files. <a href="${root}search/">Search the library</a></p>
</footer>
</div>
<script src="${root}assets/app.js" defer></script>
</body>
</html>
`;
}

/* ---------- legend ---------- */

export function legend() {
  return `<section class="legend" aria-labelledby="legend-h">
<h2 id="legend-h" class="legend__h">How claims are marked</h2>
<p class="legend__lead">Every paper separates what was checked from what was only repeated. The marks are thread, and each one also says its meaning in words.</p>
<dl class="legend__list">
<div><dt><mark class="mk mk-ok">Verified<span class="sr-only"> (verified in a primary source)</span></mark></dt><dd>Seen in a primary text or the original study. A running stitch.</dd></div>
<div><dt><span class="mk mk-q">Unverified<span class="sr-only"> (unverified)</span></span></dt><dd>Reported, not checked, or contested. A loose thread, with a question mark.</dd></div>
<div><dt><del class="mk mk-x">Discarded<span class="sr-only"> (discarded)</span></del></dt><dd>Checked and found unsupported. Crossed out, and kept so nobody repeats it.</dd></div>
</dl>
</section>`;
}

/* ---------- home ---------- */

const bookHeight = (n) => (3 * n + 8) * 24;

export function homePage({ site, root, collections, recent }) {
  const shelf = collections.length
    ? collections
        .map(
          (c) => `<li class="shelf__item">
<a class="book cloth-${c.cloth}" href="${root}${c.slug}/" style="--h:${bookHeight(c.papers.length)}px" data-papers="${c.papers.map((p) => p.id).join(',')}">
<span class="chain-col" aria-hidden="true"><i></i></span>
<span class="book__title">${esc(c.title)}</span>
<span class="book__count">${plural(c.papers.length, 'paper')}<span class="book__read"></span></span>
</a>
<span class="ledge" aria-hidden="true"></span>
<p class="book__cap">${esc(c.summary)}</p>
</li>`
        )
        .join('\n')
    : `<li class="shelf__empty"><p>The shelf is empty. Add a folder under <code>content/</code> with a <code>_collection.json</code> file, then run <code>npm run build</code>.</p></li>`;

  const rows = recent.length
    ? recent
        .map(
          (p) => `<li class="row" data-id="${p.id}">
<span class="knot" aria-hidden="true"></span>
<div class="row__main">
<a class="row__title" href="${root}${p.collection.slug}/${p.slug}/">${esc(p.title)}</a>
<p class="row__sum">${esc(p.summary)}</p>
<p class="row__meta"><span>${esc(p.collection.title)}</span><span aria-hidden="true">·</span><time datetime="${p.updated}">${fmtDate(p.updated)}</time><span aria-hidden="true">·</span><span>${p.readMin} min</span><span class="state state--${p.status}">${STATUS_LABEL[p.status]}</span><span class="row__state sr-only"></span></p>
</div>
</li>`
        )
        .join('\n')
    : `<li class="row row--empty"><p>No papers yet. Add a <code>.md</code> file to a collection folder and rebuild.</p></li>`;

  const body = `<section class="hero">
<h1 class="hero__title">${esc(site.tagline)}</h1>
<p class="hero__intro">${esc(site.intro)}</p>
<p class="hero__actions"><a class="btn" href="#shelf">Browse the shelf</a><a class="btn btn--ghost" href="${root}search/">Search</a></p>
</section>
<section class="shelf" id="shelf" aria-labelledby="shelf-h">
<h2 id="shelf-h" class="sec__h">The shelf</h2>
<ul class="shelf__list">
${shelf}
</ul>
</section>
<section class="recent" aria-labelledby="recent-h">
<h2 id="recent-h" class="sec__h">Recently sewn in</h2>
<ol class="rows">
${rows}
</ol>
</section>
${legend()}`;

  return layout({
    site, root, title: site.title, description: site.description, cloth: site.cloth, pageClass: 'page-home', body, current: 'library',
  });
}

/* ---------- collection ---------- */

export function collectionPage({ site, root, collection }) {
  const c = collection;
  const last = c.papers.reduce((a, p) => (p.updated > a ? p.updated : a), '');
  const cover = `<div class="cover">
<div class="cover__inner">
<nav class="crumb" aria-label="Breadcrumb"><a href="${root}">Library</a><span aria-hidden="true">/</span><span aria-current="page">${esc(c.title)}</span></nav>
<h1 class="cover__title">${esc(c.title)}</h1>
<p class="cover__sum">${esc(c.summary)}</p>
<p class="cover__count">${plural(c.papers.length, 'paper')}${last ? ` · last updated ${fmtDate(last)}` : ''}</p>
</div>
</div>`;

  const idTitle = new Map(c.papers.map((p) => [p.id, p.title]));
  const items = c.papers.length
    ? c.papers
        .map((p) => {
          const after = p.after.length
            ? `<p class="sig__after">Read first: ${p.after
                .map((id) => {
                  const t = idTitle.get(id);
                  return t ? `<a href="${root}${id}/">${esc(t)}</a>` : `<a href="${root}${id}/">${esc(id)}</a>`;
                })
                .join(', ')}</p>`
            : '';
          return `<li class="sig" data-id="${p.id}">
<span class="knot" aria-hidden="true"></span>
<div class="sig__main">
<h2 class="sig__title"><a href="${root}${p.collection.slug}/${p.slug}/">${esc(p.title)}</a></h2>
${p.subtitle ? `<p class="sig__sub">${esc(p.subtitle)}</p>` : ''}
<p class="sig__sum">${esc(p.summary)}</p>
${after}
<p class="sig__meta"><span class="state state--${p.status}">${STATUS_LABEL[p.status]}</span><time datetime="${p.updated}">Updated ${fmtDate(p.updated)}</time><span>${p.readMin} min read</span><span class="row__state sr-only"></span></p>
</div>
</li>`;
        })
        .join('\n')
    : `<li class="sig sig--empty"><p>No papers in this collection yet. Add a <code>.md</code> file to <code>content/${esc(c.slug)}/</code> and rebuild.</p></li>`;

  const body = `<section class="sigs-wrap" aria-label="Papers in ${esc(c.title)}">
<ol class="sigs">
${items}
</ol>
</section>`;

  return layout({
    site, root, title: c.title, description: c.summary, cloth: c.cloth, pageClass: 'page-collection', cover, body, path: `${c.slug}/`,
  });
}

/* ---------- paper ---------- */

export function paperPage({ site, root, paper, byId }) {
  const p = paper;
  const c = p.collection;
  const url = site.url ? `${site.url.replace(/\/$/, '')}/${c.slug}/${p.slug}/` : '';
  const cite = [site.author ? `${site.author}.` : '', `${p.title}.`, `${site.title}.`, `${fmtDate(p.updated)}.`, url].filter(Boolean).join(' ');

  const cover = `<div class="cover">
<div class="cover__inner">
<nav class="crumb" aria-label="Breadcrumb"><a href="${root}">Library</a><span aria-hidden="true">/</span><a href="${root}${c.slug}/">${esc(c.title)}</a></nav>
<h1 class="cover__title">${esc(p.title)}</h1>
${p.subtitle ? `<p class="cover__sub">${esc(p.subtitle)}</p>` : ''}
<p class="cover__sum">${esc(p.summary)}</p>
</div>
</div>`;

  const marks = [];
  if (p.used.ok) marks.push('<span class="key__i"><mark class="mk mk-ok">verified<span class="sr-only"> (verified in a primary source)</span></mark></span>');
  if (p.used.q) marks.push('<span class="key__i"><span class="mk mk-q">unverified<span class="sr-only"> (unverified)</span></span></span>');
  if (p.used.x) marks.push('<span class="key__i"><del class="mk mk-x">discarded<span class="sr-only"> (discarded)</span></del></span>');

  const meta = `<div class="meta">
<dl class="meta__list">
<div><dt>Status</dt><dd><span class="state state--${p.status}">${STATUS_LABEL[p.status]}</span></dd></div>
<div><dt>Updated</dt><dd><time datetime="${p.updated}">${fmtDate(p.updated)}</time></dd></div>
<div><dt>Reading</dt><dd>${p.readMin} min · ${p.words.toLocaleString('en-GB')} words</dd></div>
${p.tags.length ? `<div><dt>Tags</dt><dd><ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></dd></div>` : ''}
</dl>
<p class="meta__actions">
<button type="button" class="btn btn--ghost btn--sm" data-copy="${esc(cite)}">Copy citation</button>
<button type="button" class="btn btn--ghost btn--sm" data-copy-link>Copy link</button>
<button type="button" class="btn btn--ghost btn--sm" data-print>Print</button>
</p>
</div>
${marks.length ? `<p class="key"><span class="key__lead">Marks in this paper</span>${marks.join('')}</p>` : ''}`;

  const readFirst = p.after.length
    ? `<section class="readfirst" aria-labelledby="rf-h">
<h2 id="rf-h" class="readfirst__h">Read first</h2>
<p class="readfirst__lead">This paper builds on ${p.after.length === 1 ? 'one earlier paper' : 'these earlier papers'}.</p>
<ol class="readfirst__list">
${p.after
  .map((id) => {
    const t = byId.get(id);
    return `<li class="rf" data-id="${id}"><span class="knot" aria-hidden="true"></span><a href="${root}${id}/">${esc(t.title)}</a><span class="row__state"></span></li>`;
  })
  .join('\n')}
</ol>
</section>`
    : '';

  const tocItems = [...p.headings, ...(p.sources.length ? [{ id: 'sources', text: 'Sources', level: 2 }] : [])];
  const toc = tocItems.length
    ? `<nav class="toc" aria-label="Contents"><details class="toc__d" open><summary>Contents</summary><ol class="toc__list">
${tocItems.map((h) => `<li class="toc__i toc__i--${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`).join('\n')}
</ol></details></nav>`
    : '<nav class="toc" aria-hidden="true"></nav>';

  const sources = p.sources.length
    ? `<section class="sources" aria-labelledby="sources">
<h2 id="sources">Sources</h2>
<ol class="sources__list">
${p.sources
  .map(
    (s) =>
      `<li class="src src--${s.kind}"><span class="src__kind">${KIND_LABEL[s.kind]}</span>${
        s.url ? `<a class="ext" href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>` : `<span>${esc(s.label)}</span>`
      }</li>`
  )
  .join('\n')}
</ol>
</section>`
    : '';

  const leads = p.leadsOn.length
    ? `<section class="leads" aria-labelledby="leads-h">
<h2 id="leads-h" class="leads__h">Leads on to</h2>
<ul class="leads__list">
${p.leadsOn
  .map((id) => {
    const t = byId.get(id);
    return `<li><a href="${root}${id}/">${esc(t.title)}</a><span>${esc(t.summary)}</span></li>`;
  })
  .join('\n')}
</ul>
</section>`
    : '';

  const body = `<div class="paper" data-id="${p.id}">
${toc}
<div class="paper__top">
${meta}
${readFirst}
</div>
<article class="prose">
${p.html}
${sources}
${leads}
</article>
</div>`;

  return layout({
    site, root, title: p.title, description: p.summary, cloth: c.cloth, pageClass: 'page-paper', cover, body, path: `${c.slug}/${p.slug}/`,
  });
}

/* ---------- search and 404 ---------- */

export function searchPage({ site, root }) {
  const body = `<section class="searchhead">
<h1 class="searchhead__title">Search the library</h1>
<form class="sform" role="search" method="get" action="" data-index="${root}search-index.json" data-root="${root}">
<label class="sr-only" for="q">Search papers, headings and tags</label>
<input id="q" name="q" type="search" autocomplete="off" spellcheck="false" placeholder="Try “breath”, “anfas” or a name">
<button class="btn" type="submit">Search</button>
</form>
<p class="s-status" role="status" aria-live="polite"></p>
</section>
<ol class="results" aria-label="Results"></ol>
<noscript><p class="s-note">Search needs JavaScript. You can still browse every paper from <a href="${root}">the shelf</a>.</p></noscript>`;
  return layout({
    site, root, title: 'Search', description: `Search every paper in ${site.title}.`, cloth: site.cloth, pageClass: 'page-search', body, path: 'search/', current: 'search',
  });
}

export function notFoundPage({ site, root, base }) {
  const body = `<section class="lost">
<h1 class="lost__title">That page isn’t bound in.</h1>
<p class="lost__text">The address may have changed, or the paper was never filed here. Try the shelf or search for it.</p>
<p class="hero__actions"><a class="btn" href="${root}">Back to the shelf</a><a class="btn btn--ghost" href="${root}search/">Search</a></p>
</section>`;
  return layout({
    site, root, title: 'Page not found', description: 'This page could not be found.', cloth: site.cloth, pageClass: 'page-lost', body, base, noindex: true,
  });
}
