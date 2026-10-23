---
title: "Adding papers and collections"
subtitle: "Everything the library can do, shown once"
summary: "Drop a Markdown file in a folder and rebuild. This guide shows the front matter and every component, with synthetic demo data."
date: 2026-10-18
status: final
tags: [guide, markdown, components]
order: 1
---

## Add a paper

A paper is one Markdown file inside a collection folder. Save it as `content/<collection>/<name>.md`, then run `npm run build`. The file name becomes the address, so `my-first-paper.md` is published at `my-first-paper/`.

```yaml
---
title: "A clear title"
summary: "One or two sentences that appear on the shelf and in search."
subtitle: "Optional"
date: 2026-10-18
updated: 2026-11-02
status: working        # draft, working, reviewed or final
tags: [topic, another topic]
after: [other-collection/other-paper]
order: 3
sources:
  - label: "Author, Title (Year)"
    url: "https://example.org"
    kind: primary      # primary, secondary or unverified
---
```

Only `title` and `summary` are required. A paper with no `status` is a draft. Leave `updated` out and it takes the value of `date`.

## Add a collection

A collection is a folder under `content/` with a file called `_collection.json`.

```json
{
  "title": "Collection title",
  "summary": "A short line for the shelf.",
  "cloth": "madder",
  "order": 4
}
```

The `cloth` sets the colour of the book and its spine. The choices are indigo, madder, bottle, saffron, aubergine and slate. Files that start with an underscore are skipped.

## Link between papers

Inside a paper, link with `@` and the paper's id: `[text](@collection/paper)`. Within the same collection, the bare name works: `[text](@paper)`. Add `#heading-id` to point at a section. A bad link stops the build and names the file, so a broken reference cannot be published by mistake.

The `after` field in front matter says "read these first". The library then shows the reverse link, "leads on to", on the earlier paper.

For an example that uses most of the components below, see [What the studies on dhikr breathing show](@health-evidence/dhikr-breathing-evidence).

## Marks for how sure you are

Three inline marks record the state of a claim, and each one is readable without colour.

```text
==verified==   ??unverified??   ~~discarded~~
```

Rendered: the date ==was confirmed in two sources==, the figure ??could not be traced to its origin??, and the claim ~~was invented~~.

## Footnotes become side notes

Write `[^name]` in the text and `[^name]: the note` anywhere below.

A footnote sits in the margin on wide screens and opens on tap on small ones.[^demo]

## Arabic, Persian and Urdu

Inline text uses `{ar:…}`, `{fa:…}` or `{ur:…}`, which set the direction and the font. For example {ar:بسم الله}, {fa:هوش در دم} and {ur:پاس انفاس}.

A block with a citation line uses a container named `ar`, `fa`, `ur` or `rtl`.

```text
::: ar Optional citation line
لا إله إلا الله
:::
```

::: ar The kalima
لا إله إلا الله
:::

## Notes and slips

Five kinds of slip carry a title and a body: `note`, `verified`, `unverified`, `discarded` and `caution`.

::: note A plain note
Use this for context that is not a claim.
:::

::: verified Checked
Use this when you read the source and it says so.
:::

::: unverified Not yet checked
Use this for a claim you saw but could not trace.
:::

::: discarded Rejected
Use this for something you looked into and set aside, so nobody repeats it.
:::

::: caution Take care
Use this for safety and for anything that could mislead.
:::

## Diagrams from plain text

All of the data below is ==synthetic demo data== and says nothing about the real world.

### Breath

```text
::: breath Title of the diagram
Row label | in:first | out:second
Another row | in:one | hold:two | out:three
:::
```

::: breath Synthetic breath pattern
Demo A | in:one | out:two
Demo B | in:one | hold:two | out:three
:::

### Chain

```text
::: chain Title
Name | note | status
:::
```

The status is optional: verified, unverified, disputed or discarded.

::: chain Synthetic chain of transmission
First link | Placeholder | verified
Second link | Placeholder | unverified
Third link | Placeholder | disputed
:::

### Timeline

```text
::: timeline Title
1900 | What happened | Optional note
:::
```

::: timeline Synthetic timeline
1900 | The first event | A note on the first event
1950 | The second event |
2000 | The third event | A note on the third event
:::

### Bars

```text
::: bars Title
Label | 12 | Optional note
unit: person/people
max: 20
:::
```

The unit can be a single word, or a `singular/plural` pair, which is chosen by the value.

::: bars Synthetic bars
Group A | 12 | A note
Group B | 7 |
Group C | 3 | Smallest
unit: people
:::

### Register of claims

```text
::: register Title
The claim | verified | Where it was checked
:::
```

The status must be `verified`, `unverified`, `disputed` or `discarded`. The build stops on anything else.

::: register Synthetic register
A claim that holds | verified | Two sources agree
A claim with one source | unverified | Only one site makes it
A claim the sources split on | disputed | Authors disagree
A claim that was rejected | discarded | The source does not say it
:::

### Matrix

A table whose cells start with `yes`, `no`, `partial` or `disputed` becomes a matrix. Text after a colon is a note.

```text
::: matrix Title
| Item | Feature |
|---|---|
| One | yes: the note |
:::
```

::: matrix Synthetic matrix
| Item | Has the first feature | Has the second feature |
|---|---|---|
| Item one | yes | no |
| Item two | partial: only in part | yes |
| Item three | disputed: sources differ | no |
:::

## Figures

A `figure` container holds an image with a caption. Put the image in `content/<collection>/assets/` and refer to it with `assets/name.png`.

```text
::: figure Caption for the figure
![Alt text that describes the image](assets/name.png)
:::
```

## Search, reading progress and printing

Search runs in the browser over every paper, ignores diacritics and Arabic vowel marks, and needs no server. The spine on each paper fills as you read. A paper you have finished reading is remembered on this device only. Printing a paper hides the navigation and keeps the sources.

## Publish

Pushing to GitHub rebuilds and publishes the site through the workflow in `.github/workflows/pages.yml`. Set `url` in `site.config.json` to the published address first, so the not-found page can find its way back.

[^demo]: This is a side note. It carries no claim.
