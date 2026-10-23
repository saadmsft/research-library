// Bookcloth palettes and the generated thread/texture assets.
// Tile colours are hex because they live inside data-URI SVGs.

export const CLOTHS = {
  indigo: {
    label: 'Indigo',
    cloth: 'oklch(31% 0.09 268)', hi: 'oklch(37% 0.1 268)', lo: 'oklch(23% 0.07 268)',
    ink: '#efe9d6', accent: 'oklch(41% 0.15 268)',
    thread: '#efe9d6', shade: '#8f87a8', hole: '#0e1024', deep: '#343c86',
  },
  madder: {
    label: 'Madder',
    cloth: 'oklch(36% 0.125 18)', hi: 'oklch(42% 0.135 18)', lo: 'oklch(27% 0.1 18)',
    ink: '#f3e8d6', accent: 'oklch(43% 0.16 18)',
    thread: '#f3e8d6', shade: '#a58978', hole: '#240b0f', deep: '#8a2433',
  },
  bottle: {
    label: 'Bottle green',
    cloth: 'oklch(32% 0.065 168)', hi: 'oklch(38% 0.07 168)', lo: 'oklch(24% 0.05 168)',
    ink: '#ece9d4', accent: 'oklch(40% 0.085 168)',
    thread: '#ece9d4', shade: '#86917a', hole: '#08201a', deep: '#1f5a45',
  },
  saffron: {
    label: 'Saffron',
    cloth: 'oklch(77% 0.135 82)', hi: 'oklch(82% 0.13 84)', lo: 'oklch(68% 0.125 78)',
    ink: '#2b200c', accent: 'oklch(46% 0.115 70)',
    thread: '#3a2b0f', shade: '#b58a2c', hole: '#2b200c', deep: '#7a5516',
  },
  aubergine: {
    label: 'Aubergine',
    cloth: 'oklch(30% 0.09 335)', hi: 'oklch(36% 0.1 335)', lo: 'oklch(22% 0.07 335)',
    ink: '#f1e6e8', accent: 'oklch(41% 0.15 335)',
    thread: '#f1e6e8', shade: '#a2859f', hole: '#1d0a1d', deep: '#6b2a63',
  },
  slate: {
    label: 'Slate',
    cloth: 'oklch(40% 0.03 245)', hi: 'oklch(46% 0.035 245)', lo: 'oklch(31% 0.025 245)',
    ink: '#eef0ee', accent: 'oklch(41% 0.05 245)',
    thread: '#eef0ee', shade: '#8d98a2', hole: '#0f1820', deep: '#3b4f66',
  },
};

const LOBE = 'M12 0C4 5.5 4 18.5 12 24C20 18.5 20 5.5 12 0Z';

const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export function threadTile({ thread, shade }) {
  return uri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">` +
      `<path d="${LOBE}" fill="none" stroke="${shade}" stroke-width="4.4" stroke-linejoin="round"/>` +
      `<path d="M12 0H24M12 24H24" stroke="${shade}" stroke-width="3.6"/>` +
      `<path d="${LOBE}" fill="none" stroke="${thread}" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<path d="M12 0H24M12 24H24" stroke="${thread}" stroke-width="1.8"/>` +
      `</svg>`
  );
}

export function holesTile({ hole }) {
  return uri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">` +
      `<circle cx="12" cy="0" r="3.4" fill="${hole}" stroke="rgba(255,255,255,.22)" stroke-width="1"/>` +
      `<circle cx="12" cy="24" r="3.4" fill="${hole}" stroke="rgba(255,255,255,.22)" stroke-width="1"/>` +
      `</svg>`
  );
}

// Linen thread on paper: the shade is the cloth's deep colour so it holds contrast on a light page.
export function paperChainTile(c) {
  return threadTile({ thread: '#f6f1e2', shade: c.deep });
}

const weaveA = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".95 .055" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 -.12"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
const weaveB = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .9" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .34 -.1"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
const grain = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .2  0 0 0 0 .1  0 0 0 .07 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;

export function generatedCss() {
  const rules = [];
  rules.push(
    `:root{--weave-dark:${uri(weaveA)};--weave-light:${uri(weaveB)};--grain:${uri(grain)}}`
  );
  for (const [name, c] of Object.entries(CLOTHS)) {
    rules.push(
      `.cloth-${name}{--cloth:${c.cloth};--cloth-hi:${c.hi};--cloth-lo:${c.lo};--cover-ink:${c.ink};--accent:${c.accent};` +
        `--chain-thread:${threadTile(c)};--chain-holes:${holesTile(c)};--chain-paper:${paperChainTile(c)};--deep:${c.deep}}`
    );
  }
  return rules.join('\n') + '\n';
}

export function faviconHref(clothName = 'indigo') {
  const c = CLOTHS[clothName] ?? CLOTHS.indigo;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1b1d2a"/>` +
    `<path d="M16 5C8 11 8 21 16 27C24 21 24 11 16 5Z" fill="none" stroke="${c.shade}" stroke-width="4.6" stroke-linejoin="round"/>` +
    `<path d="M16 5C8 11 8 21 16 27C24 21 24 11 16 5Z" fill="none" stroke="#efe9d6" stroke-width="2.8" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const clothNames = Object.keys(CLOTHS);
