(() => {
  'use strict';

  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const READ_KEY = 'rl:read';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- read state (this browser only) ---------- */

  const readSet = () => {
    try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); }
  };
  const saveRead = (set) => {
    try { localStorage.setItem(READ_KEY, JSON.stringify([...set])); } catch { /* storage blocked */ }
  };

  function applyRead() {
    const read = readSet();
    $$('.row[data-id], .sig[data-id], .rf[data-id]').forEach((el) => {
      const on = read.has(el.dataset.id);
      el.classList.toggle('is-read', on);
      const label = $('.row__state', el);
      if (label) label.textContent = on ? 'Read' : '';
    });
    $$('.book[data-papers]').forEach((el) => {
      const ids = el.dataset.papers.split(',').filter(Boolean);
      const n = ids.filter((id) => read.has(id)).length;
      const out = $('.book__read', el);
      if (out) out.textContent = n ? `${n} of ${ids.length} read` : '';
    });
  }
  applyRead();

  /* ---------- paper page: the spine sews as you read ---------- */

  const paper = $('.paper[data-id]');
  if (paper) {
    const id = paper.dataset.id;
    const heads = $$('.prose h2[id], .prose h3[id]');
    const tocItems = new Map($$('.toc__i a').map((a) => [a.getAttribute('href').slice(1), a.parentElement]));
    let ticking = false;
    let marked = readSet().has(id);

    const update = () => {
      ticking = false;
      const max = Math.max(1, doc.scrollHeight - innerHeight);
      const p = Math.min(1, Math.max(0, scrollY / max));
      doc.style.setProperty('--p', p.toFixed(4));

      let current = -1;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top <= innerHeight * 0.3) current = i; });
      const atEnd = scrollY + innerHeight >= doc.scrollHeight - 4;
      heads.forEach((h, i) => {
        const li = tocItems.get(h.id);
        if (!li) return;
        const done = i < current || (atEnd && i <= current);
        li.classList.toggle('is-done', done);
        li.classList.toggle('is-current', i === current && !atEnd);
      });
      const src = tocItems.get('sources');
      if (src) {
        const el = document.getElementById('sources');
        const top = el ? el.getBoundingClientRect().top : Infinity;
        src.classList.toggle('is-current', top <= innerHeight * 0.3 && !atEnd);
        src.classList.toggle('is-done', top <= innerHeight * 0.3 && atEnd);
      }

      if (!marked && p > 0.85) {
        marked = true;
        const set = readSet();
        set.add(id);
        saveRead(set);
      }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    update();

    /* contents: open on wide screens, collapsed on narrow ones */
    const details = $('.toc__d');
    if (details) {
      const wide = matchMedia('(min-width: 1000px)');
      const sync = () => { details.open = wide.matches; };
      sync();
      wide.addEventListener('change', sync);
    }

    /* sidenotes: tap to open when the margin is not wide enough */
    const marginMode = matchMedia('(min-width: 1380px)');
    $$('.sn__ref').forEach((ref) => {
      const note = document.getElementById(ref.getAttribute('href').slice(1));
      if (!note) return;
      ref.setAttribute('role', 'button');
      ref.setAttribute('aria-expanded', 'false');
      ref.addEventListener('click', (e) => {
        if (marginMode.matches) return;
        e.preventDefault();
        const open = note.classList.toggle('is-open');
        ref.setAttribute('aria-expanded', String(open));
      });
    });

    /* copy and print */
    const flash = (btn) => {
      btn.classList.add('is-done');
      setTimeout(() => btn.classList.remove('is-done'), 1400);
    };
    const copy = async (text, btn) => {
      try {
        await navigator.clipboard.writeText(text);
        flash(btn);
      } catch {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); flash(btn); } catch { /* nothing more to try */ }
        ta.remove();
      }
    };
    $$('[data-copy]').forEach((b) => b.addEventListener('click', () => {
      const text = b.dataset.copy.includes('http') ? b.dataset.copy : `${b.dataset.copy} ${location.href.split('#')[0]}`;
      copy(text, b);
    }));
    $$('[data-copy-link]').forEach((b) => b.addEventListener('click', () => copy(location.href.split('#')[0], b)));
    $$('[data-print]').forEach((b) => b.addEventListener('click', () => print()));
  }

  /* ---------- search ---------- */

  const form = $('.sform');
  if (!form) return;

  const input = $('input[name="q"]', form);
  const status = $('.s-status');
  const list = $('.results');
  const root = form.dataset.root || './';

  const foldChar = (ch) =>
    ch
      .normalize('NFKD')
      .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g, '')
      .toLowerCase()
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[\u02B9-\u02BF\u02C8'‘’ʼ`]/g, '')
      .replace(/[^\p{L}\p{N}]/gu, ' ');

  const fold = (s) => Array.from(s, foldChar).join('');
  const foldMap = (s) => {
    let out = '';
    const map = [];
    let i = 0;
    for (const ch of s) {
      const f = foldChar(ch);
      for (let k = 0; k < f.length; k++) map.push(i);
      out += f;
      i += ch.length;
    }
    return { out, map };
  };

  let docs = null;
  let failed = false;

  const setStatus = (msg, err = false) => {
    status.textContent = msg;
    status.classList.toggle('is-error', err);
  };

  const load = async () => {
    setStatus('Loading the index…');
    try {
      const res = await fetch(new URL(form.dataset.index, location.href));
      if (!res.ok) throw new Error(res.status);
      const raw = await res.json();
      docs = raw.map((d) => ({ ...d, ft: fold(d.t), fg: fold(d.g.join(' ')), fs: fold(d.s), fh: fold(d.h.join(' ')), fb: null }));
      run();
    } catch {
      failed = true;
      setStatus('The search index could not be loaded. Check your connection and reload the page.', true);
    }
  };

  const countOf = (hay, needle) => {
    let n = 0;
    let i = hay.indexOf(needle);
    while (i !== -1 && n < 8) { n++; i = hay.indexOf(needle, i + needle.length); }
    return n;
  };

  const highlight = (parent, text, ranges) => {
    let last = 0;
    ranges.forEach(([a, b]) => {
      if (a > last) parent.append(text.slice(last, a));
      const m = document.createElement('span');
      m.className = 'hit';
      m.textContent = text.slice(a, b);
      parent.append(m);
      last = b;
    });
    if (last < text.length) parent.append(text.slice(last));
  };

  const rangesFor = (text, tokens) => {
    const { out, map } = foldMap(text);
    const found = [];
    tokens.forEach((t) => {
      let i = out.indexOf(t);
      while (i !== -1) {
        found.push([map[i], map[i + t.length - 1] + 1]);
        i = out.indexOf(t, i + t.length);
      }
    });
    found.sort((a, b) => a[0] - b[0]);
    const merged = [];
    found.forEach((r) => {
      const prev = merged[merged.length - 1];
      if (prev && r[0] <= prev[1]) prev[1] = Math.max(prev[1], r[1]);
      else merged.push(r.slice());
    });
    return merged;
  };

  const run = () => {
    if (failed) return;
    const q = input.value.trim();
    list.textContent = '';
    if (!docs) return;
    if (!q) {
      setStatus(`Type to search ${docs.length} ${docs.length === 1 ? 'paper' : 'papers'}.`);
      return;
    }
    const tokens = fold(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) { setStatus('Type a word or a name to search.'); return; }

    const hits = [];
    docs.forEach((d) => {
      if (d.fb === null) d.fb = fold(d.b);
      let score = 0;
      for (const t of tokens) {
        let s = 0;
        if (d.ft.includes(t)) s += 6;
        if (d.fg.includes(t)) s += 4;
        if (d.fs.includes(t)) s += 3;
        if (d.fh.includes(t)) s += 3;
        s += Math.min(countOf(d.fb, t), 5);
        if (!s) return;
        score += s;
      }
      hits.push({ d, score });
    });
    hits.sort((a, b) => b.score - a.score);

    if (!hits.length) {
      setStatus(`Nothing matches “${q}”. Try fewer words, or a plain spelling such as “anfas” for “anfās”.`);
      return;
    }
    setStatus(`${hits.length} ${hits.length === 1 ? 'result' : 'results'} for “${q}”.`);

    hits.forEach(({ d }) => {
      const li = document.createElement('li');
      li.className = 'result';
      const a = document.createElement('a');
      a.className = 'result__title';
      a.href = root + d.u;
      highlight(a, d.t, rangesFor(d.t, tokens));
      const title = document.createElement('div');
      title.append(a);
      const meta = document.createElement('p');
      meta.className = 'result__meta';
      meta.textContent = d.c;
      const sum = document.createElement('p');
      sum.className = 'result__sum';
      highlight(sum, d.s, rangesFor(d.s, tokens));
      li.append(title, meta, sum);

      const inHeads = d.h.filter((h) => tokens.some((t) => fold(h).includes(t)));
      if (inHeads.length) {
        const p = document.createElement('p');
        p.className = 'result__in';
        p.textContent = `In sections: ${inHeads.slice(0, 3).join(' · ')}`;
        li.append(p);
      } else {
        const { out, map } = foldMap(d.b);
        const at = tokens.map((t) => out.indexOf(t)).filter((n) => n >= 0).sort((x, y) => x - y)[0];
        if (at !== undefined) {
          const from = Math.max(0, (map[at] ?? 0) - 70);
          const piece = d.b.slice(from, from + 190).trim();
          const p = document.createElement('p');
          p.className = 'result__in';
          p.append(from > 0 ? '… ' : '');
          highlight(p, piece, rangesFor(piece, tokens));
          p.append(' …');
          li.append(p);
        }
      }
      list.append(li);
    });
  };

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      run();
      const u = new URL(location.href);
      if (input.value.trim()) u.searchParams.set('q', input.value.trim());
      else u.searchParams.delete('q');
      history.replaceState(null, '', u);
    }, 120);
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });

  const initial = new URL(location.href).searchParams.get('q');
  if (initial) input.value = initial;
  load().then(() => { if (!initial && !reduce.matches) input.focus({ preventScroll: true }); });
})();
