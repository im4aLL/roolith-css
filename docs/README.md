# Documentation site

Maintainer notes for the roolith docs. This file is not part of the site.

## Contents

- `getting-started/`, `components/`, `blocks/`: hand-written static HTML pages, one per topic.
- `example.html`, `examples.css`: the examples hub linked from the header navigation. It is sidebar-less like `index.html`, and `examples.css` styles only this page.
- `examples/`: the standalone example demos. Each folder holds one `example-<name>.html`, `example-<name>.css`, and `example-<name>.js`, and loads the framework stylesheet directly, so a demo can be opened, copied, or shipped without the docs shell. The search index skips this folder.
- `partials/`: shared HTML fragments (`header.html`, `sidebar.html`, `footer.html`) pulled into each page at runtime. The header also owns the compact site navigation panel (`#doc-mobile-nav`). The inline header nav is hidden at 1023px and below: docs pages use the sidebar, which carries the Showcase -> Examples entry, while sidebar-less pages (`index.html`, `example.html`) show the header nav toggle. `doc.js` owns open, close, Escape, scrim, focus return, and resize behavior. The search input collapses into its toggle at 1199px and below so the top-level nav stays on one line.
- `include-fragment.js`: the local `include-fragment` custom element that fetches those partials.
- `doc.css`, `doc.js`, `doc-search.js`, `doc-surfaces.js`: styles plus shared page behavior, the search UI, and the transient modal, drawer, popover, and combo box controllers, split by responsibility. Pages must load `doc-search.js`, then `doc-surfaces.js`, then `doc.js`, in that order, and all three are required, because the later scripts call functions declared in the earlier ones, and `doc-surfaces.js` also calls the table gate from `doc.js` at runtime after all three scripts have loaded, which is the one reverse dependency. `doc.js` keeps the remaining demo controllers deliberately; extract another file when the next surface change lands.
- `search-index.json`: the search data consumed by `doc-search.js`. It is generated, not edited by hand.
- `playground-tokens.js`: the generated advanced token catalog consumed by the theme model, produced by `scripts/generate-playground-tokens.mjs` from the framework Sass. Do not edit it by hand; rerun `npm run tokens` after a framework token change.
- `playground.css`, `playground-theme.js`, `playground-controls.js`, `playground.js`: the theme playground, and only that page loads them. The stylesheet styles `.doc-playground` plus the page layout for `.doc-playground-page`, the theme model reads the framework defaults and renders the override CSS, the controls module owns the markup contract and the slider bounds, and the controller owns the state, storage, events, and status line. The playground is the docs page that drops the shared sidebar and uses the full width layout, so it drops `.layout-primary` and `playground.css` collapses `.doc-layout` to a single full width column; `index.html` is the other sidebar-less page, which is the precedent that makes this layout safe. The preview root carries an explicit `theme-light` or `theme-dark` class, so the framework re-declares that scope's whole palette and every token derived from it on the preview element; custom properties then resolve against the values declared on that element, which is why the preview needs no alias list and a component added to the preview markup needs no token audit. The scope switch picks both the palette the color controls edit and the scope the preview shows, so light and dark can be tuned independently without flipping the site theme. `--r-global-base-font-size` is the one structural token that cannot be scoped: `rem` resolves against the document root, so the controller applies that token on `<html>` while a non-default value is set and removes it again when the default wins.

The Advanced switch reveals one editor per token in `playground-tokens.js`, which is grouped in the panel and follows the scope switch for theme scoped tokens while shared tokens stay separate. An advanced override is written to both scope rules, re-declaring the unchanged scope's default, because a light declaration on `:root` also matches an explicit dark page and the framework does not redeclare every token in the dark block. Values are free form CSS, validated in the model before they can reach a declaration. The page must load `playground-theme.js`, then `playground-controls.js`, then `playground.js`, after the three shared docs scripts, because the controller consumes the namespaces the other two publish.
- `roolith-4.1.0.min.css`: the local framework build the pages load, so the docs always describe the shipped CSS.
- `datepicker-demo.js`: the datepicker page demo controller, and only that page loads it. It initializes the vendored js-datepicker library on the `.form-datepicker-js` field, guards on both the library global and the field so it stays inert elsewhere, and relies on the library appending its panel to the field wrapper the framework overrides target.
- `vendor/`: the local highlight.js and js-datepicker builds, the light and dark code themes, and the upstream license files.
- `images/`: every demo image, served from this folder, plus the provenance notes in the Images section below.
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

`favicon.ico` is a 16x16 icon, the one the deployed site at `https://roolith-css.habibhadi.com/` serves. It lives at the docs root, so the root page links it as `favicon.ico` and every subfolder page links it as `../favicon.ico`. Reference it as `type="image/x-icon"`. Do not add `sizes="any"`, because that keyword promises a scalable icon, and browsers can then skip the raster ICO and show no icon at all.

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

The script scans every page under `docs`, skipping `partials`, `examples`, and dot directories, and writes `docs/search-index.json`. Page groups come from the folder name, so a new top-level folder needs an entry in the script's `groupByFolder` map. Root-level pages other than the overview map to `Overview`.

## Runtime dependencies

The site serves every script and stylesheet itself, and its one network font dependency is Inter from the Google Fonts CDN:

- `include-fragment.js` is a small local custom element that fetches `partials/*.html` with `credentials: 'same-origin'`, swaps the response into the element, and leaves the fallback text in place when a request fails. A successful partial gets `is-loaded` and a failed one gets `is-error`, and `doc.js` uses both states. It replaces the previous CDN-loaded `@github/include-fragment-element` package.
- `vendor/highlight.min.js` provides syntax highlighting, and `vendor/highlight-github.min.css` with `vendor/highlight-github-dark.min.css` provide the light and dark code themes. `vendor/highlight.LICENSE` carries the upstream license.
- `vendor/datepicker.min.js` and `vendor/datepicker.min.css` are js-datepicker 5.18.4, the third-party library the datepicker page demos. Only that page loads them, and `vendor/datepicker.LICENSE` carries the upstream MIT notice. The page's code sample still points at the unpkg URLs, since a project consuming roolith picks its own copy of the library.

Nothing else the site depends on is fetched from the network, and no page hot-links a remote image, so every demo renders offline.

Framework users still pick their own icon and font assets. The Introduction page documents the CDN links for Iconoir and Inter, and those stay optional choices for a project using roolith rather than requirements of this docs site.

## Fonts

The pages render in Inter because the framework base font stack names it, and `doc.css` opens with an `@import` of the Google Fonts stylesheet for `family=Inter:ital,wght@0,400..700;1,400..700`, which covers every `font-weight` the stylesheets use in both styles, with `display=swap`. Every page already loads `doc.css`, so the import is the one place the font is requested and no page head repeats it. The italic axis is part of the request because the typography page demos `em`, and a browser only downloads the italic files when italic text actually renders. Without it a visitor who does not have Inter installed sees the system sans-serif fallback from the framework stack.

The `@import` must stay the first thing in the file, since CSS ignores an import that follows a rule. It also costs one extra round trip compared with a `link` in the page head: the browser discovers the font stylesheet only after it has fetched and parsed `doc.css`, so it cannot preconnect to `fonts.googleapis.com` or `fonts.gstatic.com` ahead of time. That is the deliberate trade for a single edit point; if the first-paint font swap ever needs to be tighter, move the request back into a head `link` with the two preconnects, which means touching every page.

The theme playground's family loader only injects the stylesheet for the Google family a visitor picks, with no connection hints of its own, so the playground never fetches a family before it is chosen.

The standalone examples under `examples/` do not load `doc.css`, so each one requests its own Google Fonts stylesheet: Inter everywhere, plus Instrument Serif for the company page, Space Grotesk for the multipurpose page, JetBrains Mono for the developer platform, Fraunces for the storefront, and Instrument Serif for the bistro. Each request has a local fallback stack, so a demo still renders with system fonts when the network is unavailable. Those requests belong to the demos, not to the docs shell.

The developer platform, storefront, and bistro examples are deliberately styled almost entirely through `--r-*` custom property overrides. Their stylesheets hold the light and dark token blocks plus a few dozen layout declarations, with no component restyling, so they double as a working reference for the theming guide.

## Images

Every demo image is a file in `images/`, referenced with a relative `../images/...` path, so the demos never wait on a remote host and never show a broken tile. The six oldest files (`1.jpg`, `2.jpeg`, `3.jpeg`, `4.png`, `5.jpeg`, `6.jpeg`) are the media demos on the utilities page and in the playground preview.

Avatars are AI-generated faces from [UIFaces](https://uifaces.co/), so no real person is depicted, and each named demo persona has one file that every page reuses, which keeps the same face on the avatar page, the comment thread, and the playground activity feed. They are fetched from `https://mockmind-api.uifaces.co/content/human/<id>.jpg` and resized to 240x240 at JPEG quality 82, which covers the 120px circle at 2x:

| File | UIFaces id | Persona |
| --- | --- | --- |
| `avatar-aiko-tanaka.jpg` | 107 | Aiko Tanaka |
| `avatar-ariana-cole.jpg` | 44 | Ariana Cole |
| `avatar-ben-osei.jpg` | 42 | Ben Osei |
| `avatar-dana-whitfield.jpg` | 105 | Dana Whitfield |
| `avatar-hidden-author.jpg` | 45 | Hidden author |
| `avatar-marcus-lee.jpg` | 73 | Marcus Lee |
| `avatar-mira-chen.jpg` | 78 | Mira Chen |
| `avatar-portrait.jpg` | 60 | The `.img.rounded-circle` demo |
| `avatar-priya-raman.jpg` | 9 | Priya Raman |
| `avatar-sofia-almeida.jpg` | 68 | Sofia Almeida |
| `avatar-tomas-ruiz.jpg` | 50 | Tomas Ruiz |

Photos come from [Pexels](https://www.pexels.com/license/), which allows free use without attribution. Each file is the photo cropped to the size the layout uses, including the 200x400 portrait tile in the collage, and the three audience rows in the playground reuse photo files because a customer segment is not a person:

| File | Source | Size |
| --- | --- | --- |
| `photo-abstract-curve.jpg` | 1103970 | 400x400 |
| `photo-architecture.jpg` | 1029606 | 400x400 |
| `photo-aurora.jpg` | 3617500 | 400x400 |
| `photo-waterfall.jpg` | 210186 | 400x400 |
| `photo-bungalows.jpg` | 1287460 | 200x200 |
| `photo-camera.jpg` | 274973 | 200x200 |
| `photo-city-night.jpg` | 373912 | 200x200 |
| `photo-color-swatches.jpg` | 276267 | 200x200 |
| `photo-flowers.jpg` | 4247596 | 200x200 |
| `photo-house.jpg` | 259588 | 200x200 |
| `photo-mountain-lake.jpg` | 358482 | 200x200 |
| `photo-mountains.jpg` | 1699030 | 200x200 |
| `photo-mountains-portrait.jpg` | 1699030 | 200x400 |
| `photo-skyline-clouds.jpg` | 325185 | 200x200 |
| `photo-city-aerial.jpg` | 409127 | 600x300 |
| `photo-open-book.jpg` | 1112048 | 600x300 |
| `photo-bistro-interior.jpg` | 67468 | 800x600 |
| `photo-bistro-chef.jpg` | 1267320 | 600x600 |
| `photo-bistro-plate.jpg` | 3659862 | 400x400 |
| `photo-bistro-wine.jpg` | 941861 | 400x400 |
| `photo-bistro-supper.jpg` | 3184183 | 400x400 |
| `photo-bistro-service.jpg` | 262978 | 400x400 |
| `photo-bistro-cheese.jpg` | 1126728 | 400x400 |
| `placeholder-800x300.png` | placehold.co | 800x300 |

To add or replace a photo, download it at the size the layout needs with `https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=<width>&h=<height>&fit=crop`, save it here, and reference it from the page. Keep the aspect ratio the markup expects, because the collage and card demos crop with `object-fit` rather than reserving a fixed box.

## Adding a page

1. Copy an existing page in the same folder and adjust the title, breadcrumb, content, and prev/next links.
2. Add the page to `docs/partials/sidebar.html` in the right group.
3. Update the prev/next pagination on the neighboring pages.
4. Regenerate the search index with the command above.
