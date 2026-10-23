// Diagram and component generators for custom Markdown containers.
// Every generator returns plain HTML or inline SVG, drawn only from the data it is given.

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const cells = (line) => line.split('|').map((c) => c.trim());
const dataLines = (body) =>
  body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

export const STATUS = {
  verified: { cls: 'ok', label: 'Verified', hint: 'Checked in a primary source' },
  unverified: { cls: 'q', label: 'Unverified', hint: 'Not checked, or only seen in a secondary source' },
  disputed: { cls: 'q', label: 'Disputed', hint: 'Sources disagree, or authenticity is contested' },
  discarded: { cls: 'x', label: 'Discarded', hint: 'Checked and found unsupported' },
};

const statusOf = (raw = '') => STATUS[raw.toLowerCase()] ?? null;

function figure(kind, title, inner, { wide = false } = {}) {
  const cap = title ? `<figcaption class="fig__cap">${esc(title)}</figcaption>` : '';
  return `<figure class="fig fig--${kind}${wide ? ' fig--wide' : ''}">${cap}${inner}</figure>`;
}

/* ---------- breath: in / hold / out waveform drawn as thread ---------- */

function wrapLabel(label, max = 14) {
  if (label.length <= max) return [label];
  const cut = label.lastIndexOf(' ', max);
  if (cut < 4) return [label];
  return [label.slice(0, cut), label.slice(cut + 1)];
}

// Fits a segment word into its slice of the waveform: wraps to two lines, else squeezes to the slice width.
function wordText(text, w, mid, y, cls) {
  const max = Math.max(4, Math.floor((w - 8) / 7.2));
  let lines = [text];
  if (text.length > max) {
    lines = [];
    let cur = '';
    for (const word of text.split(' ')) {
      if (cur && `${cur} ${word}`.length > max) {
        lines.push(cur);
        cur = word;
      } else cur = cur ? `${cur} ${word}` : word;
    }
    if (cur) lines.push(cur);
  }
  const squeeze = lines.length > 2 || lines.some((l) => l.length > max);
  if (squeeze) lines = [text];
  return lines
    .map((ln, k) => {
      const ly = y - (lines.length - 1 - k) * 17;
      const fit = squeeze ? ` textLength="${(w - 8).toFixed(1)}" lengthAdjust="spacingAndGlyphs"` : '';
      return `<text class="${cls}" x="${mid.toFixed(1)}" y="${ly}" text-anchor="middle"${fit}>${esc(ln)}</text>`;
    })
    .join('');
}

export function breath(title, body) {
  const rows = dataLines(body).map((line) => {
    const [label, ...segs] = cells(line);
    const parsed = segs
      .map((s) => {
        const i = s.indexOf(':');
        if (i < 0) return null;
        const kind = s.slice(0, i).trim().toLowerCase();
        if (!['in', 'hold', 'out'].includes(kind)) return null;
        return { kind, text: s.slice(i + 1).trim() };
      })
      .filter(Boolean);
    return { label, segs: parsed };
  });
  if (!rows.length) throw new Error('breath: no rows');

  const W = 640, labelW = 112, padR = 10, rowH = 124;
  const plotX = labelW + 6, plotW = W - plotX - padR, cycles = 2, cw = plotW / cycles;
  const H = rows.length * rowH + 6;
  let svg = `<svg class="bz" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="bz-t-${esc(slug(title || 'breath'))}">`;
  const desc = rows
    .map((r) => `${r.label}: ${r.segs.map((s) => `${s.kind}${s.text ? ` (${s.text})` : ''}`).join(', then ')}`)
    .join('. ');
  svg += `<title id="bz-t-${esc(slug(title || 'breath'))}">${esc(title || 'Breath pattern')}. ${esc(desc)}.</title>`;

  rows.forEach((row, i) => {
    const yBase = i * rowH + 76;
    const yLow = yBase + 24, yHigh = yBase - 24;
    const weights = row.segs.map((s) => (s.kind === 'hold' ? 0.9 : s.kind === 'out' ? 1.05 : 1));
    const sum = weights.reduce((a, b) => a + b, 0);
    const lines = wrapLabel(row.label);
    lines.forEach((ln, k) => {
      svg += `<text class="bz-label" x="0" y="${yBase + 4 + (k - (lines.length - 1) / 2) * 17}">${esc(ln)}</text>`;
    });
    let d = `M${plotX.toFixed(1)} ${yLow}`;
    let level = 'low';
    for (let c = 0; c < cycles; c++) {
      let x = plotX + c * cw;
      row.segs.forEach((seg, k) => {
        const w = (weights[k] / sum) * cw;
        if (seg.kind === 'in') {
          d += ` C${(x + w * 0.5).toFixed(1)} ${yLow} ${(x + w * 0.5).toFixed(1)} ${yHigh} ${(x + w).toFixed(1)} ${yHigh}`;
          level = 'high';
        } else if (seg.kind === 'out') {
          d += ` C${(x + w * 0.5).toFixed(1)} ${yHigh} ${(x + w * 0.5).toFixed(1)} ${yLow} ${(x + w).toFixed(1)} ${yLow}`;
          level = 'low';
        } else {
          const y = level === 'high' ? yHigh : yLow;
          d += ` L${(x + w).toFixed(1)} ${y}`;
        }
        const first = c === 0;
        const mid = x + w / 2;
        if (seg.text) {
          svg += wordText(seg.text, w, mid, yHigh - 18, first ? 'bz-word' : 'bz-word bz-repeat');
        }
        if (first) {
          svg += `<text class="bz-phase" x="${mid.toFixed(1)}" y="${yLow + 24}" text-anchor="middle">${seg.kind}</text>`;
        }
        svg += `<line class="bz-tick" x1="${(x + w).toFixed(1)}" y1="${yHigh - 8}" x2="${(x + w).toFixed(1)}" y2="${yLow + 8}"/>`;
        x += w;
      });
    }
    svg += `<line class="bz-axis" x1="${plotX}" y1="${yLow + 8}" x2="${W - padR}" y2="${yLow + 8}"/>`;
    svg += `<path class="bz-shade" d="${d}"/><path class="bz-thread" d="${d}"/>`;
  });
  svg += '</svg>';
  return figure('breath', title, `<div class="bz-scroll" tabindex="0" role="group" aria-label="Diagram; scrolls sideways on narrow screens">${svg}</div>`);
}

/* ---------- chain: lineage or levels, one station per link ---------- */

export function chain(title, body, inline) {
  const items = dataLines(body).map((line) => {
    const [name, note = '', status = ''] = cells(line);
    const st = statusOf(status);
    return (
      `<li class="chain__node${st ? ` is-${st.cls}` : ''}">` +
      `<span class="chain__station" aria-hidden="true"></span>` +
      `<div class="chain__body"><strong class="chain__name">${inline(name)}</strong>` +
      (st ? ` <span class="st st-${st.cls}">${st.label}</span>` : '') +
      (note ? `<span class="chain__note">${inline(note)}</span>` : '') +
      `</div></li>`
    );
  });
  return figure('chain', title, `<ol class="chain">${items.join('')}</ol>`);
}

/* ---------- timeline: dated stations ---------- */

export function timeline(title, body, inline) {
  const items = dataLines(body).map((line) => {
    const [date, text, note = ''] = cells(line);
    return (
      `<li class="tl__item"><span class="tl__station" aria-hidden="true"></span>` +
      `<time class="tl__date">${esc(date)}</time>` +
      `<div class="tl__body"><span class="tl__text">${inline(text)}</span>` +
      (note ? `<span class="tl__note">${inline(note)}</span>` : '') +
      `</div></li>`
    );
  });
  return figure('timeline', title, `<ol class="tl">${items.join('')}</ol>`);
}

/* ---------- bars: stitched bar chart ---------- */

export function bars(title, body, inline) {
  let unit = '';
  let max = null;
  const rows = [];
  for (const line of dataLines(body)) {
    if (/^unit\s*:/i.test(line)) { unit = line.replace(/^unit\s*:/i, '').trim(); continue; }
    if (/^max\s*:/i.test(line)) { max = parseFloat(line.replace(/^max\s*:/i, '')); continue; }
    const [label, value, note = ''] = cells(line);
    const v = parseFloat(value);
    if (Number.isNaN(v)) throw new Error(`bars: "${value}" is not a number`);
    rows.push({ label, v, note });
  }
  const top = max ?? Math.max(...rows.map((r) => r.v));
  // "unit: person/people" picks the singular form for a value of 1
  const unitFor = (v) => {
    const [one, many] = unit.split('/').map((s) => s.trim());
    return many === undefined ? one : v === 1 ? one : many;
  };
  const html = rows
    .map(
      (r) =>
        `<div class="bars__row"><div class="bars__label">${inline(r.label)}</div>` +
        `<div class="bars__track" role="img" aria-label="${esc(r.label)}: ${r.v}${unit ? ' ' + esc(unitFor(r.v)) : ''}"><span class="bars__fill" style="--w:${((r.v / top) * 100).toFixed(1)}%"></span></div>` +
        `<div class="bars__value">${r.v}${unit ? `<span class="bars__unit"> ${esc(unitFor(r.v))}</span>` : ''}</div>` +
        (r.note ? `<div class="bars__note">${inline(r.note)}</div>` : '') +
        `</div>`
    )
    .join('');
  return figure('bars', title, `<div class="bars">${html}</div>`);
}

/* ---------- register: claim, status, basis ---------- */

export function register(title, body, inline) {
  const rows = dataLines(body).map((line) => {
    const [claim, status, basis = ''] = cells(line);
    const st = statusOf(status);
    if (!st) throw new Error(`register: unknown status "${status}" (use verified, unverified, disputed or discarded)`);
    return (
      `<tr class="is-${st.cls}"><td class="reg__claim">${inline(claim)}</td>` +
      `<td class="reg__status"><span class="st st-${st.cls}" title="${esc(st.hint)}">${st.label}</span></td>` +
      `<td class="reg__basis">${inline(basis)}</td></tr>`
    );
  });
  const html =
    `<div class="table-wrap"><table class="register"><thead><tr><th scope="col">Claim</th><th scope="col">Status</th><th scope="col">Basis</th></tr></thead>` +
    `<tbody>${rows.join('')}</tbody></table></div>`;
  return figure('register', title, html);
}

/* ---------- matrix: a Markdown table whose cells become marks ---------- */

export function matrixCells(tableHtml) {
  return tableHtml.replace(
    /<td([^>]*)>\s*(yes|no|partial|disputed)\b\s*:?\s*([\s\S]*?)<\/td>/gi,
    (_m, attrs, token, rest) => {
      const t = token.toLowerCase();
      return `<td${attrs} class="mx mx-${t}"><span class="mx__mark" aria-hidden="true"></span><span class="mx__word">${t}</span>${rest ? `<span class="mx__note">${rest}</span>` : ''}</td>`;
    }
  );
}

export function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}
