# Research Library

A static library of research papers. Each paper is a Markdown file in a collection folder. A small build script turns the folders into a bound-book website: a shelf of collections, paper pages with sidenotes and diagrams, and search. There is no framework and no database.

## Add a paper

1. Put a `.md` file in a collection folder, for example `content/sufi-practice/my-paper.md`.
2. Start it with front matter. `title` and `summary` are required.

   ```yaml
   ---
   title: "A clear title"
   summary: "One or two sentences for the shelf and for search."
   status: working        # draft, working, reviewed or final
   tags: [dhikr, breath]
   sources:
     - label: "Author, Title, Journal (2009)"
       url: "https://example.org/paper"
       kind: primary      # primary, secondary or unverified
   ---
   ```

3. Run `npm run build`. The file name becomes the address: `my-paper.md` is published at `/sufi-practice/my-paper/`.

The paper called *Adding papers and collections* (in the Library guide collection) shows every component with a live example: marks for verified, unverified and discarded claims, footnotes that become sidenotes, right-to-left Arabic, Persian and Urdu, and the diagrams (matrix, breath, chain, timeline, bars, register). Its demo data is synthetic.

## Add a collection

Create a folder under `content/` and put a `_collection.json` in it:

```json
{ "title": "Sufi practice", "summary": "What the shelf is about.", "cloth": "indigo", "order": 1 }
```

`cloth` is the binding colour: `indigo`, `madder`, `bottle`, `saffron`, `aubergine` or `slate`.

## Run it locally

```
npm install
npm run dev
```

That builds into `dist/` and serves it at http://localhost:4173. After editing a paper, run `npm run build` and refresh.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository on the `main` branch.
2. In the repository, open Settings, then Pages, and set the source to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/pages.yml`, which builds and deploys the site.

Set `url` in `site.config.json` to the published address, for example `https://yourname.github.io/research-library/`. Only the "page not found" screen needs it, and it also enables the sitemap. Set `author` too if you want your name in the footer and in the copied citation.

## Notes

- A broken link, a missing required field or an unknown component stops the build and names the file.
- Footnote and `:::` syntax inside fenced code blocks is left alone, so you can document the syntax.
- The `dist/` folder is generated. Do not edit it.
