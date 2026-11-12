# Documentation site

Maintainer notes for the roolith docs. This file is not part of the site.

## Contents

- `getting-started/`, `components/`, `blocks/`: hand-written static HTML pages, one per topic.
- `partials/`: shared HTML fragments (`header.html`, `sidebar.html`, `footer.html`) pulled into each page at runtime.
- `include-fragment.js`: the local `include-fragment` custom element that fetches those partials.
- `doc.css`, `doc.js`, `doc-search.js`, `doc-surfaces.js`: styles plus shared page behavior, the search UI, and the transient modal, drawer, popover, and combo box controllers, split by responsibility. Pages must load `doc-search.js`, then `doc-surfaces.js`, then `doc.js`, in that order, and all three are required, because the later scripts call functions declared in the earlier ones, and `doc-surfaces.js` also calls the table gate from `doc.js` at runtime after all three scripts have loaded, which is the one reverse dependency. `doc.js` keeps the remaining demo controllers deliberately; extract another file when the next surface change lands.
- `search-index.json`: the search data consumed by `doc-search.js`. It is generated, not edited by hand.
- `playground-tokens.js`: the generated advanced token catalog consumed by the theme model, produced by `scripts/generate-playground-tokens.mjs` from the framework Sass. Do not edit it by hand; rerun `npm run tokens` after a framework token change.
- `playground.css`, `playground-theme.js`, `playground-controls.js`, `playground.js`: the theme playground, and only that page loads them. The stylesheet styles `.doc-playground` plus the page layout for `.doc-playground-page`, the theme model reads the framework defaults and renders the override CSS, the controls module owns the markup contract and the slider bounds, and the controller owns the state, storage, events, and status line. The playground is the docs page that drops the shared sidebar and uses the full width layout, so it drops `.layout-primary` and `playground.css` collapses `.doc-layout` to a single full width column; `index.html` is the other sidebar-less page, which is the precedent that makes this layout safe. The preview root carries an explicit `theme-light` or `theme-dark` class, so the framework re-declares that scope's whole palette and every token derived from it on the preview element; custom properties then resolve against the values declared on that element, which is why the preview needs no alias list and a component added to the preview markup needs no token audit. The scope switch picks both the palette the color controls edit and the scope the preview shows, so light and dark can be tuned independently without flipping the site theme. `--r-global-base-font-size` is the one structural token that cannot be scoped: `rem` resolves against the document root, so the controller applies that token on `<html>` while a non-default value is set and removes it again when the default wins.

The Advanced switch reveals one editor per token in `playground-tokens.js`, which is grouped in the panel and follows the scope switch for theme scoped tokens while shared tokens stay separate. An advanced override is written to both scope rules, re-declaring the unchanged scope's default, because a light declaration on `:root` also matches an explicit dark page and the framework does not redeclare every token in the dark block. Values are free form CSS, validated in the model before they can reach a declaration. The page must load `playground-theme.js`, then `playground-controls.js`, then `playground.js`, after the three shared docs scripts, because the controller consumes the namespaces the other two publish.
- `roolith-4.0.0.min.css`: the local framework build the pages load, so the docs always describe the shipped CSS.
- `datepicker-demo.js`: the datepicker page demo controller, and only that page loads it. It initializes the vendored js-datepicker library on the `.form-datepicker-js` field, guards on both the library global and the field so it stays inert elsewhere, and relies on the library appending its panel to the field wrapper the framework overrides target.
- `vendor/`: the local highlight.js and js-datepicker builds, the light and dark code themes, and the upstream license files.
- `index.html`: the overview page. `favicon.ico` sits next to it.
- `generate-search-index.mjs`: the script that rebuilds `search-index.json`.
- `scripts/generate-playground-tokens.mjs`: the script that rebuilds `playground-tokens.js`. It compiles the theme scopes and the component token mixins, subtracts the component and private tokens, and writes the sorted catalog. `--check` compares the committed file with a fresh render.

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

## Favicon

`favicon.ico` is the same 16x16 icon the legacy site at `http://habibhadi.com/lab/roolith/` serves, and it lives at the docs root, so the root page links it as `favicon.ico` and every subfolder page links it as `../favicon.ico`. Reference it as `type="image/x-icon"`. Do not add `sizes="any"`, because that keyword promises a scalable icon, and browsers can then skip the raster ICO and show no icon at all.

## Build

The documentation is static HTML and is deployed as-is. There is no docs build script and no VitePress configuration. Editing the HTML directly is the workflow. Regenerate only the search index when headings or pages change.

## Checks

The theme playground model is dependency free, so its color normalization, clamping, range widening, per scope diffing, and CSS rendering can be re-checked under node without a browser:

```sh
node docs/check-playground-theme.mjs
```

The same script runs as `npm test`, and as the explicit alias `npm run check:playground`. It runs without a DOM or the stylesheet, so it pins the model against the fixtures in the check rather than the live CSS. The browser-level contract, meaning that the preview, the scope switch, the advanced panel, and the generated CSS resolve to framework values, is verified by loading the page, not by this script.

`npm test` also runs the catalog drift check:

```sh
node scripts/generate-playground-tokens.mjs --check
```

It fails when `playground-tokens.js` no longer matches the framework Sass, so a token layer change has to be followed by `npm run tokens`.

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
- `vendor/datepicker.min.js` and `vendor/datepicker.min.css` are js-datepicker 5.18.4, the third-party library the datepicker page demos. Only that page loads them, and `vendor/datepicker.LICENSE` carries the upstream MIT notice. The page's code sample still points at the unpkg URLs, since a project consuming roolith picks its own copy of the library.

Nothing else the site depends on is fetched from the network, but a few demo pages hot-link remote images from `picsum.photos` and `placehold.co`, so those demos show broken images without a network connection.

Framework users still pick their own icon and font assets. The Introduction page documents the CDN links for Iconoir and Inter, and those stay optional choices for a project using roolith rather than requirements of this docs site.

## Adding a page

1. Copy an existing page in the same folder and adjust the title, breadcrumb, content, and prev/next links.
2. Add the page to `docs/partials/sidebar.html` in the right group.
3. Update the prev/next pagination on the neighboring pages.
4. Regenerate the search index with the command above.
