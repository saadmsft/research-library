import { Marked } from 'marked';
import { esc, slug, breath, chain, timeline, bars, register, matrixCells } from './visuals.mjs';

const NOTE_KINDS = {
  note: { label: 'Note', cls: 'note' },
  verified: { label: 'Verified in the source', cls: 'ok' },
  unverified: { label: 'Unverified', cls: 'q' },
  discarded: { label: 'Discarded', cls: 'x' },
  caution: { label: 'Caution', cls: 'caution' },
};

const DATA_KINDS = { breath, chain, timeline, bars, register };

const MARK_GLYPH = {
  ok: '<svg viewBox="0 0 28 10" aria-hidden="true"><path d="M1 5h6M11 5h6M21 5h6"/></svg>',
  q: '<svg viewBox="0 0 28 10" aria-hidden="true"><path d="M1 5c3-4 5 4 8 0s5 4 8 0 5 4 8 0"/></svg>',
  x: '<svg viewBox="0 0 28 10" aria-hidden="true"><path d="M3 2l5 6M8 2L3 8M12 2l5 6M17 2l-5 6M21 2l5 6M26 2l-5 6"/></svg>',
  caution: '<svg viewBox="0 0 28 10" aria-hidden="true"><path d="M2 5h24"/><path d="M14 1v8"/></svg>',
  note: '<svg viewBox="0 0 28 10" aria-hidden="true"><circle cx="14" cy="5" r="3"/></svg>',
};

export function renderMarkdown(source, ctx) {
  const { root = '', collection = '', file = 'document', rewriteLink } = ctx;
  const headings = [];
  const usedIds = new Map();
  const used = { ok: false, q: false, x: false };
  let noteCount = 0;

  /* footnotes: collect definitions, leave a token where each reference sits */
  const defs = new Map();
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const kept = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i])) inFence = !inFence;
    const m = !inFence && /^\[\^([^\]]+)\]:\s*(.*)$/.exec(lines[i]);
    if (m) {
      let text = m[2];
      while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1])) text += ' ' + lines[++i].trim();
      defs.set(m[1], text);
    } else kept.push(lines[i]);
  }
  const order = [];
  const marked = new Marked({ gfm: true, breaks: false });
  const parseInline = (s) => marked.parseInline(s);

  marked.use({
    extensions: [
      {
        name: 'verified',
        level: 'inline',
        start: (src) => src.indexOf('=='),
        tokenizer(src) {
          const m = /^==(?!\s)([^=\n]+?)(?<!\s)==/.exec(src);
          if (m) return { type: 'verified', raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
        },
        renderer(t) {
          used.ok = true;
          return `<mark class="mk mk-ok">${this.parser.parseInline(t.tokens)}<span class="sr-only"> (verified in a primary source)</span></mark>`;
        },
      },
      {
        name: 'unverified',
        level: 'inline',
        start: (src) => src.indexOf('??'),
        tokenizer(src) {
          const m = /^\?\?(?!\s)([^?\n]+?)(?<!\s)\?\?/.exec(src);
          if (m) return { type: 'unverified', raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
        },
        renderer(t) {
          used.q = true;
          return `<span class="mk mk-q">${this.parser.parseInline(t.tokens)}<span class="sr-only"> (unverified)</span></span>`;
        },
      },
      {
        name: 'rtl',
        level: 'inline',
        start: (src) => src.indexOf('{'),
        tokenizer(src) {
          const m = /^\{(ar|fa|ur):([^}\n]+)\}/.exec(src);
          if (m) return { type: 'rtl', raw: m[0], lang: m[1], text: m[2].trim() };
        },
        renderer(t) {
          return `<span class="rtl rtl-${t.lang}" lang="${t.lang}" dir="rtl">${esc(t.text)}</span>`;
        },
      },
    ],
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]+>/g, '');
        const level = Math.max(depth, 2);
        let id = slug(plain) || 'section';
        const n = usedIds.get(id) ?? 0;
        usedIds.set(id, n + 1);
        if (n) id = `${id}-${n + 1}`;
        if (level <= 3) headings.push({ id, text: plain, level });
        return `<h${level} id="${id}"><a class="h-anchor" href="#${id}"><span class="sr-only">Link to section: ${esc(plain)}</span></a>${text}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        let url = href;
        if (url.startsWith('@')) url = rewriteLink ? rewriteLink(url.slice(1), file) : url;
        const external = /^https?:\/\//i.test(url);
        const t = title ? ` title="${esc(title)}"` : '';
        return `<a href="${esc(url)}"${t}${external ? ' class="ext" rel="noopener"' : ''}>${text}</a>`;
      },
      image({ href, title, text }) {
        let src = href;
        if (src.startsWith('assets/')) src = `${root}${collection}/${src}`;
        const t = title ? ` title="${esc(title)}"` : '';
        return `<img src="${esc(src)}" alt="${esc(text)}"${t} loading="lazy" decoding="async">`;
      },
      del({ tokens }) {
        used.x = true;
        return `<del class="mk mk-x">${this.parser.parseInline(tokens)}<span class="sr-only"> (discarded)</span></del>`;
      },
    },
  });

  const container = (type, title, body, line) => {
    if (NOTE_KINDS[type]) {
      const k = NOTE_KINDS[type];
      if (k.cls === 'ok') used.ok = true;
      if (k.cls === 'q') used.q = true;
      if (k.cls === 'x') used.x = true;
      return (
        `<aside class="slip slip--${k.cls}"><p class="slip__head"><span class="slip__mark">${MARK_GLYPH[k.cls]}</span>` +
        `<span class="slip__label">${esc(title || k.label)}</span></p>` +
        `<div class="slip__body">${marked.parse(body)}</div></aside>\n`
      );
    }
    if (type === 'matrix') {
      const html = matrixCells(marked.parse(body));
      return `<figure class="fig fig--matrix">${title ? `<figcaption class="fig__cap">${esc(title)}</figcaption>` : ''}${html.replace('<table>', '<div class="table-wrap"><table class="matrix">').replace('</table>', '</table></div>')}</figure>\n`;
    }
    if (type === 'figure') {
      return `<figure class="fig fig--plain">${marked.parse(body)}${title ? `<figcaption class="fig__cap fig__cap--below">${esc(title)}</figcaption>` : ''}</figure>\n`;
    }
    if (type === 'rtl' || type === 'ar' || type === 'fa' || type === 'ur') {
      const lang = type === 'rtl' ? 'ar' : type;
      const inner = body
        .split(/\n{2,}/)
        .map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
        .join('');
      return `<div class="rtl-block rtl-${lang}" lang="${lang}" dir="rtl">${inner}</div>${title ? `<p class="rtl-cite">${parseInline(title)}</p>` : ''}\n`;
    }
    const gen = DATA_KINDS[type];
    if (!gen) throw new Error(`${file}:${line}: unknown container ":::${type}"`);
    try {
      return gen(title, body, parseInline) + '\n';
    } catch (e) {
      throw new Error(`${file}:${line}: ${e.message}`);
    }
  };

  /* split into markdown chunks and containers, ignoring fenced code */
  const chunks = [];
  let md = [];
  let fence = false;
  for (let i = 0; i < kept.length; i++) {
    const ln = kept[i];
    if (/^```/.test(ln)) fence = !fence;
    const open = !fence && /^:::\s*([a-z]+)(?:\s+(.*))?$/.exec(ln);
    if (open) {
      if (md.length) { chunks.push({ md: md.join('\n') }); md = []; }
      const body = [];
      let j = i + 1;
      while (j < kept.length && !/^:::\s*$/.test(kept[j])) body.push(kept[j++]);
      if (j >= kept.length) throw new Error(`${file}:${i + 1}: container ":::${open[1]}" is never closed`);
      chunks.push({ type: open[1], title: (open[2] || '').trim(), body: body.join('\n'), line: i + 1 });
      i = j;
    } else md.push(ln);
  }
  if (md.length) chunks.push({ md: md.join('\n') });

  const withFootnotes = (s) =>
    s
      .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
      .map((part, i) =>
        i % 2
          ? part
          : part.replace(/\[\^([^\]]+)\]/g, (_m, id) => {
              if (!defs.has(id)) throw new Error(`${file}: footnote [^${id}] has no definition`);
              if (!order.includes(id)) order.push(id);
              return `@@FN:${id}@@`;
            })
      )
      .join('');

  let html = chunks
    .map((c) => (c.md !== undefined ? marked.parse(withFootnotes(c.md)) : container(c.type, c.title, withFootnotes(c.body), c.line)))
    .join('\n');

  html = html.replace(/@@FN:([^@]+)@@/g, (_m, id) => {
    const n = order.indexOf(id) + 1;
    noteCount = Math.max(noteCount, n);
    const body = parseInline(defs.get(id));
    return (
      `<span class="sn"><a class="sn__ref" href="#sn-${n}" id="snref-${n}" aria-describedby="sn-${n}">${n}</a>` +
      `<span class="sn__note" id="sn-${n}" role="note"><span class="sn__num" aria-hidden="true">${n}</span>${body}</span></span>`
    );
  });

  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<div class="table-wrap"><div class="table-wrap">/g, '<div class="table-wrap">').replace(/<\/table><\/div><\/div>/g, '</table></div>');

  const plain = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  return { html, headings, plain, used, noteCount };
}
