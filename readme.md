# roolith css framework

A simple, responsive CSS boilerplate with SCSS source, CSS custom property theming, and light/dark modes.

Documentation: [https://roolith-css.habibhadi.com/](https://roolith-css.habibhadi.com/)

## Install

```bash
npm i roolith-css
```

## Use

Link the prebuilt stylesheet:

```html
<link rel="stylesheet" href="roolith-4.0.0.min.css" />
```

Or import the SCSS entry point, which emits tokens, reset, base styles, modules, blocks, layout, and state rules:

```scss
@use 'roolith-css/src/sass/roolith.scss';
```

## Development

```bash
npm install
npm run dev     # demo pages with live SCSS recompilation
npm run build   # production build to dist/
npm test
```

## License

MIT
