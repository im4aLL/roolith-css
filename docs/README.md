# Documentation site

Maintainer notes for the roolith docs. This file is not part of the site.

## Contents

- `getting-started/`, `components/`, `blocks/`: hand-written static HTML pages, one per topic.
- `partials/`: shared HTML fragments (`header.html`, `sidebar.html`, `footer.html`) pulled into each page at runtime.
- `include-fragment.js`: the local `include-fragment` custom element that fetches those partials.
- `doc.css`, `doc.js`, `doc-search.js`, `doc-surfaces.js`: styles plus shared page behavior, the search UI, and the transient modal, drawer, popover, and combo box controllers, split by responsibility. Pages must load `doc-search.js`, then `doc-surfaces.js`, then `doc.js`, in that order, and all three are required, because the later scripts call functions declared in the earlier ones, and `doc-surfaces.js` also calls the table gate from `doc.js` at runtime after all three scripts have loaded, which is the one reverse dependency. `doc.js` keeps the remaining demo controllers deliberately; extract another file when the next surface change lands.
- `search-index.json`: the search data consumed by `doc-search.js`. It is generated, not edited by hand.
- `playground.css`, `playground-theme.js`, `playground-controls.js`, `playground.js`: the theme playground, and only that page loads them. The stylesheet styles `.doc-playground` plus the page layout for `.doc-playground-page`, the theme model reads the framework defaults and renders the override CSS, the controls module owns the markup contract and the slider bounds, and the controller owns the state, storage, events, and status line. The playground is the docs page that drops the shared sidebar and uses the full width layout, so it drops `.layout-primary` and `playground.css` collapses `.doc-layout` to a single full width column; `index.html` is the other sidebar-less page, which is the precedent that makes this layout safe. The preview re-declares the theme-scope alias tokens the framework derives from a tuned token, and cannot pick up such a token unless it is listed there, so a component added to the preview needs the same audit. The page must load `playground-theme.js`, then `playground-controls.js`, then `playground.js`, after the three shared docs scripts, because the controller consumes the namespaces the other two publish.
- `roolith-4.0.0.min.css`: the local framework build the pages load, so the docs always describe the shipped CSS.
- `vendor/`: the local highlight.js build, the light and dark code themes, and the upstream license file.
- `index.html`: the overview page. `favicon.ico` sits next to it.
- `generate-search-index.mjs`: the script that rebuilds `search-index.json`.

## Preview locally

Serve the `docs` folder itself as the web root:

```sh
cd docs
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

Do not open the pages with `file://`. The partial loader fetches `/partials/*.html`, which fails from the filesystem, so the header, sidebar, and footer will be missing.

## Deployment

All navigation, partials, and the search index use root-absolute URLs, so the `docs` folder must be served at the site root, not under a subpath. This is the intended deployment model for this site. Putting it under something like `/docs/` breaks the header, sidebar, search, and internal links.

## Build

The documentation is static HTML and is deployed as-is. There is no docs build script and no VitePress configuration. Editing the HTML directly is the workflow. Regenerate only the search index when headings or pages change.

## Checks

The theme playground model is dependency free, so its normalization, clamping, range widening, diffing, and CSS rendering can be re-checked under node without a browser:

```sh
node docs/check-playground-theme.mjs
```

The same script runs as `npm test`, and as the explicit alias `npm run check:playground`. Its exact alias pin is a drift alarm between the model and the hand maintained list in the check, not proof that the preview markup consumes every alias: the check runs without a DOM or the stylesheet, so adding a component to the preview still needs a manual alias audit.

## Search

After changing page headings or adding a page, regenerate the index from the repository root:

```sh
node docs/generate-search-index.mjs
```

The script scans every page under `docs`, skipping `partials` and dot directories, and writes `docs/search-index.json`. Page groups come from the folder name, so a new top-level folder needs an entry in the script's `groupByFolder` map.

## Runtime dependencies

The site has no required CDN runtime dependencies. Every script, stylesheet, and font the pages load is served from this folder:

- `include-fragment.js` is a small local custom element that fetches `partials/*.html` with `credentials: 'same-origin'`, swaps the response into the element, and leaves the fallback text in place when a request fails. A successful partial gets `is-loaded` and a failed one gets `is-error`, and `doc.js` uses both states. It replaces the previous CDN-loaded `@github/include-fragment-element` package.
- `vendor/highlight.min.js` provides syntax highlighting, and `vendor/highlight-github.min.css` with `vendor/highlight-github-dark.min.css` provide the light and dark code themes. `vendor/highlight.LICENSE` carries the upstream license.

Nothing else the site depends on is fetched from the network, but a few demo pages hot-link remote images from `picsum.photos` and `placehold.co`, so those demos show broken images without a network connection.

Framework users still pick their own icon and font assets. The Introduction page documents the CDN links for Iconoir and Inter, and those stay optional choices for a project using roolith rather than requirements of this docs site.

## Adding a page

1. Copy an existing page in the same folder and adjust the title, breadcrumb, content, and prev/next links.
2. Add the page to `docs/partials/sidebar.html` in the right group.
3. Update the prev/next pagination on the neighboring pages.
4. Regenerate the search index with the command above.
