---
name: Research Library
description: A library of research papers bound like a Coptic exposed-spine book, where one stitched chain is both the spine and the way you move.
colors:
  paper: "oklch(97.6% 0.007 95)"
  paper-slip: "oklch(94.6% 0.01 95)"
  paper-shade: "oklch(91% 0.013 95)"
  ink: "oklch(23% 0.02 265)"
  ink-soft: "oklch(43% 0.02 265)"
  line: "oklch(86% 0.013 95)"
  line-strong: "oklch(70% 0.015 95)"
  verified-teal: "oklch(40% 0.09 190)"
  unverified-madder: "oklch(47% 0.19 25)"
  caution-umber: "oklch(46% 0.11 65)"
  cloth-indigo: "oklch(31% 0.09 268)"
  cloth-madder: "oklch(36% 0.125 18)"
  cloth-bottle: "oklch(32% 0.065 168)"
  cloth-saffron: "oklch(77% 0.135 82)"
  cloth-aubergine: "oklch(30% 0.09 335)"
  cloth-slate: "oklch(40% 0.03 245)"
typography:
  display:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "clamp(2.5rem, 6.4vw, 5.2rem)"
    fontWeight: 540
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  cover-title:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "clamp(2.1rem, 4.8vw, 4rem)"
    fontWeight: 650
    lineHeight: 1.07
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "1.95rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.016em"
  title:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "1.32rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.008em"
  body:
    fontFamily: "Literata Variable, Literata, Georgia, serif"
    fontSize: "1.1563rem"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
rounded:
  stitch: "2px"
  slip: "3px"
  button: "4px"
  volume: "8px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 3.5rem)"
  rail: "56px"
  stitch-pitch: "24px"
components:
  button-primary:
    backgroundColor: "{colors.cloth-indigo}"
    textColor: "#efe9d6"
    rounded: "{rounded.button}"
    padding: "0.7rem 1.35rem"
    height: "2.9rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0.7rem 1.35rem"
    height: "2.9rem"
  slip:
    backgroundColor: "{colors.paper-slip}"
    textColor: "{colors.ink}"
    rounded: "{rounded.slip}"
    padding: "0.95rem 1.15rem 0.35rem"
---

# Design System: Research Library

## Overview

**Creative North Star: "The Exposed Spine"**

A research library read as a book whose binding is left showing. Collections are cloth-bound volumes, papers are signatures sewn into them, and one linen chain-stitch runs down the left edge of every page. That chain is the spine, the reading-progress indicator and the table of contents at once. The reader is meant to feel the structure of the work (what was checked, what was not) the way an exposed binding shows how a book is held together.

The page itself is quiet rag paper with dark ink, set in a book serif for reading and a grotesque for labels. All colour and texture belong to the cloth: the rail, the covers, the volumes on the shelf and the buttons. Paper never carries gloss. The only authored motion is the chain sewing itself shut when a page opens, and it is switched off under reduced motion.

The system rejects the generic documentation look (a white page, a grey sidebar, card grids) and the "skeuomorphic bookshelf" look (wood grain, page curls). Texture is limited to thread and weave, and every texture stands for a real part of a binding.

**Key Characteristics:**
- One chain-stitch spine at the left edge, doubling as progress and navigation.
- Flat rag-paper reading surface; depth lives on cloth.
- A bookcloth colour per collection, so a paper inherits the volume it sits in.
- Claims carry a mark that never relies on colour alone.
- Dashed "stitch" lines stand in for borders around anything tipped in.

## Colors

A warm near-white paper and a blue-black ink, with a single cloth colour per page supplying the only saturation. Status colours are reserved for claim marks.

### Primary
- **Cloth (per collection)** (indigo `oklch(31% 0.09 268)`, madder `oklch(36% 0.125 18)`, bottle `oklch(32% 0.065 168)`, saffron `oklch(77% 0.135 82)`, aubergine `oklch(30% 0.09 335)`, slate `oklch(40% 0.03 245)`): the rail, the paper-header band, volume covers and primary buttons. Each cloth ships with a lighter and darker variant for the weave, a cover-ink colour that passes contrast on it, and a thread colour for the chain. Saffron is the one light cloth and takes dark ink.

### Neutral
- **Rag Paper** (`oklch(97.6% 0.007 95)`): page background.
- **Slip Paper** (`oklch(94.6% 0.01 95)`) and **Paper Shade** (`oklch(91% 0.013 95)`): tipped-in slips, code, table bands.
- **Blue-Black Ink** (`oklch(23% 0.02 265)`): text. **Soft Ink** (`oklch(43% 0.02 265)`): secondary text, passes 4.5:1 on paper.
- **Thread Line** (`oklch(86% 0.013 95)`) and **Strong Thread** (`oklch(70% 0.015 95)`): rules and dashed stitch lines.

### Status
- **Verified Teal** (`oklch(40% 0.09 190)`), **Unverified Madder** (`oklch(47% 0.19 25)`), **Caution Umber** (`oklch(46% 0.11 65)`). Discarded uses Soft Ink, because a rejected claim should recede.

### Named Rules
**The One Cloth Rule.** A page shows one cloth. A paper takes its collection's cloth; no page mixes two.

**The Colour-Is-Never-Alone Rule.** Every status has a second cue: verified is a dotted underline, unverified is a wavy underline with a "?", discarded is a light cross-stitch. Status chips repeat it with border style (solid, dashed, double).

## Typography

**Display and Reading Font:** Literata Variable (optical size on), with Georgia fallback.
**Label and Interface Font:** Archivo Variable, with system sans fallback.
**Arabic, Persian, Urdu:** Amiri for Arabic and Persian, Noto Nastaliq Urdu for Urdu, loaded as separate subsets and set right-to-left inline or as a block.

**Character:** A bookish serif that holds up at both 5rem and 1.1rem, paired with a compact grotesque for anything that is apparatus rather than argument.

### Hierarchy
- **Display** (540, `clamp(2.5rem, 6.4vw, 5.2rem)`, 1.02): the home headline, search and not-found headings, on paper. Kept light because paper is where the comp's engraved lettering lives.
- **Cover title** (650, `clamp(2.1rem, 4.8vw, 4rem)`, 1.07): the paper title on cloth. Heavier so it holds against the weave, with a debossed shadow.
- **Headline** (700, 1.95rem, 1.15): section headings in a paper.
- **Title** (650, 1.32rem, 1.25): subsection headings; collection and paper titles in lists are 600 at 1.4–1.7rem.
- **Body** (400, 1.1563rem, 1.62, old-style figures): paper text, held to about 65–72ch by the column.
- **Label** (Archivo 600–700, 0.84–0.95rem): navigation, buttons, chips, slip headings, diagram text.

### Named Rules
**The Apparatus Rule.** Argument is serif; apparatus (nav, chips, labels, diagram text, slip headings) is Archivo. Never set a paragraph in the sans.

## Layout

A 56px fixed rail on the left carries the chain; everything else sits to its right. Content gutters are fluid (`clamp(1.25rem, 4vw, 3.5rem)`). The home page and collection pages use a wide left-aligned column with the shelf and the signature list; paper pages use a single reading column with a contents panel at 1000px and up and margin sidenotes at 1380px and up. Below those widths the contents folds into a disclosure and sidenotes become inline notes.

The stitch pitch is 24px. The chain, its read-state knots and the signature list share it, so everything stitched lines up on one rhythm. Spacing between sections is generous (headings carry 2.3–3.4rem above); paragraphs use a 1.1em gap.

Diagrams scroll sideways inside their own figure on narrow screens rather than shrinking their labels. Tables do the same.

## Elevation & Depth

Paper is flat. Depth is carried by cloth only: volumes and buttons use a small inset highlight and a soft drop shadow, and the rail casts a shadow across the paper at its edge. Nothing on paper (slips, figures, tables, code) has a shadow; those are marked by dashed stitch lines instead.

### Shadow Vocabulary
- **Button at rest** (`0 1px 0 rgb(255 255 255 / 0.12) inset, 0 3px 8px -3px rgb(0 0 0 / 0.45)`): cloth buttons.
- **Button hover** (`0 1px 0 rgb(255 255 255 / 0.14) inset, 0 6px 12px -4px rgb(0 0 0 / 0.45)`) with a 1px lift.
- **Rail edge** (`1px 0 0 var(--cloth-lo), 8px 0 18px -8px rgb(0 0 0 / 0.4)`): the spine over the paper.
- **Debossed title** (`0 1px 0 rgb(255 255 255 / 0.1), 0 -1px 0 rgb(0 0 0 / 0.45)`; lighter on saffron): titles on cloth.

### Named Rules
**The Flat Paper Rule.** A shadow means "this is cloth". Never put a drop shadow on anything that is paper.

## Shapes

Corners are small and tailored: 2px inside a stitched border, 3px on slips and code, 4px on buttons, 8px on the shelf volumes. Nothing is pill-shaped or fully round, except the chain stations. Borders are dashed 1.5px stitch lines for things tipped in, and 1.5px solid ink for the ghost button. The recurring silhouette is the lobe (a pointed oval) used for the logo mark, chain knots and read state.

## Components

### Buttons
- **Shape:** 4px radius, 2.9rem minimum height, with an inset dashed stitch line (4px in) in the cover-ink colour.
- **Primary:** the page's cloth with weave texture, cover-ink text, Archivo 600 at 0.95rem, padding `0.7rem 1.35rem`.
- **Hover / Focus:** hover lightens to the cloth highlight and lifts 1px; active returns and presses in. Focus is a 2px outline in cover ink with a 5px paper halo.
- **Ghost:** transparent with a 1.5px solid ink border and a faint stitch line; hover fills with Slip Paper.
- **Disabled:** 50% opacity, no lift. The copy-citation button swaps to a "Copied" state.

### Volumes (shelf)
Each collection is a cloth-covered book standing on a ledge, as tall as its paper count, with a sewn chain down its spine, a debossed title and a count. Hover lifts it 6px; keyboard focus draws an ink outline with a paper halo. The caption sits below on paper.

### Signature list
A collection page lists papers along a stitched chain. Each paper has a knot: open and dashed when unread, filled when read (kept in local storage).

### Slips
Tipped-in paper notes for verified, unverified, discarded and caution passages. Slip Paper background, 1.5px dashed border in the status colour, a small stitched icon, 3px radius. Never nested.

### Marks and chips
Inline `verified`, `unverified` and `discarded` marks (see the Colour-Is-Never-Alone Rule), and matching status chips with solid, dashed and double borders.

### Diagrams
Matrix, breath, chain, timeline, bars and register, all drawn in thread: ink lines, a Thread Line axis, dashed ticks, cloth-accent shading. Breath is an SVG that keeps a 36rem minimum width and scrolls. Bars are stitched segments with the value and unit right-aligned.

### Navigation
A top bar with the lobe mark, the site name and two links (Library, Search). Links are underlined with a dashed stitch, solid when current or hovered. On a cloth cover the bar sits on the cloth in cover ink.

### Rail progress and contents
The chain fills as you read. On wide screens a contents panel tracks the current section; below 1000px it is a disclosure.

## Do's and Don'ts

### Do:
- **Do** let cloth carry colour and depth, and keep paper flat.
- **Do** pair every status colour with a second cue (underline style, border style or an icon).
- **Do** use dashed 1.5px lines for anything tipped in, and the 24px pitch for anything stitched.
- **Do** keep one authored motion: the chain sewing in. Respect `prefers-reduced-motion`.
- **Do** let wide figures and tables scroll in their own container instead of shrinking text.
- **Do** label demonstration data as synthetic.

### Don't:
- **Don't** add shadows, gradients or textures to paper.
- **Don't** mix two cloths on one page, or tint paper with the cloth colour.
- **Don't** set body text or paragraphs in the sans.
- **Don't** use colour alone to say a claim is verified, unverified or discarded.
- **Don't** nest slips, or wrap content in generic cards.
- **Don't** add decorative wood grain, page curls or other skeuomorphic props; every texture must be thread or weave.
