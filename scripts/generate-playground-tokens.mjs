/**
 * Generates `docs/playground-tokens.js`, the theme tokens the playground exposes
 * in its advanced panel.
 *
 * Usage (from the repository root):
 *   node scripts/generate-playground-tokens.mjs
 *   node scripts/generate-playground-tokens.mjs --check
 *
 * The catalog is derived from the framework Sass so it cannot drift into a hand
 * maintained list. Compiling `css-var.css-variable()` gives every custom property
 * the framework declares in the theme scopes, and compiling the three
 * `component-var` mixins gives the component token names, whose difference is
 * exactly the palette, semantic, and structural layers the advanced panel shows.
 * Private `--_r-*` tokens and the tokens that already have a dedicated control in
 * the basic panel are excluded as well.
 *
 * `--check` compares the committed file with a fresh render and exits non-zero on
 * drift, so a framework token change fails the playground check until the file is
 * regenerated.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { compileString } from 'sass-embedded';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sassDir = path.join(projectRoot, 'src', 'sass');
const outFile = path.join(projectRoot, 'docs', 'playground-tokens.js');

const BASIC_TOKENS = new Set([
    '--r-color-primary',
    '--r-color-secondary',
    '--r-color-tertiary',
    '--r-color-info',
    '--r-color-success',
    '--r-color-warning',
    '--r-color-danger',
    '--r-color-link',
    '--r-global-border-radius',
    '--r-global-base-font-size',
    '--r-global-base-font',
]);

const GROUP_ORDER = ['Palette', 'Surfaces', 'Text', 'Borders', 'Roles', 'Global', 'Detail'];

/**
 * Compiles one Sass entry against the framework sources.
 * @param {string} source Sass source to compile.
 * @returns {string} The compiled CSS.
 */
function compileCss(source) {
    return compileString(source, { loadPaths: [sassDir], style: 'expanded' }).css;
}

/**
 * Normalize a selector so compiled rule variants compare equal.
 * @param {string} selector A rule selector.
 * @returns {string} The selector without whitespace.
 */
function normalizeSelector(selector) {
    return selector.replace(/\s+/g, '');
}

/**
 * Collect the custom property declarations of every rule in a stylesheet,
 * keyed by normalized selector. `@media` blocks are visited too.
 * @param {string} css Compiled stylesheet.
 * @returns {Map<string, string[]>} Declared token names per selector, in source order.
 */
function collectDeclarations(css) {
    const declarations = new Map();

    postcss.parse(css).walkRules((rule) => {
        const selector = normalizeSelector(rule.selector);
        const names = declarations.get(selector) || [];

        rule.walkDecls((declaration) => {
            if (declaration.prop.startsWith('--') && !names.includes(declaration.prop)) {
                names.push(declaration.prop);
            }
        });

        declarations.set(selector, names);
    });

    return declarations;
}

/**
 * Pick the group a token belongs to in the advanced panel.
 * @param {string} name Custom property name.
 * @returns {string} Group label.
 */
function groupOf(name) {
    if (name.startsWith('--r-color-')) return 'Palette';
    if (name === '--r-surface' || name.startsWith('--r-surface-')) return 'Surfaces';
    if (name.startsWith('--r-text') || name === '--r-link') return 'Text';
    if (name.startsWith('--r-border')) return 'Borders';
    if (/^--r-(accent|danger|success|info|warning)(-|$)/.test(name)) return 'Roles';

    return name.startsWith('--r-global-') || name === '--r-focus-ring-color' || name === '--r-block-padding'
        ? 'Global'
        : 'Detail';
}

/**
 * Decide whether a token holds a color, so the panel can show a chip next to it.
 * @param {string} name Custom property name.
 * @param {string} group Advanced panel group.
 * @returns {'color' | 'value'} The editor kind.
 */
function kindOf(name, group) {
    if (group !== 'Global' && group !== 'Detail') {
        return 'color';
    }

    return /^--r-(global-(background|font)-color|focus-ring-color|code-|loader-)/.test(name) ? 'color' : 'value';
}

/**
 * Render the catalog script.
 * @returns {string} The generated file contents.
 */
function renderCatalog() {
    const theme = compileCss("@use 'css-var';\n@include css-var.css-variable();\n");
    const components = compileCss(
        "@use 'component-var';\n.probe {\n" +
            '    @include component-var.component-tokens();\n' +
            '    @include component-var.component-tokens-light();\n' +
            '    @include component-var.component-tokens-dark();\n}\n',
    );

    const themeRules = collectDeclarations(theme);
    const shared = themeRules.get(':root,.theme-light,.theme-dark') || [];
    const light = themeRules.get(':root,.theme-light') || [];
    const dark = themeRules.get('.theme-dark') || [];
    const componentTokens = new Set([...collectDeclarations(components).values()].flat());

    const ordered = [...new Set([...shared, ...light, ...dark])];
    const entries = ordered
        .filter((name) => !componentTokens.has(name) && !name.startsWith('--_r-') && !BASIC_TOKENS.has(name))
        .map((name) => {
            const group = groupOf(name);

            return {
                name,
                group,
                kind: kindOf(name, group),
                shared: shared.includes(name),
            };
        })
        .sort((left, right) => {
            const groupDifference = GROUP_ORDER.indexOf(left.group) - GROUP_ORDER.indexOf(right.group);

            return groupDifference === 0 ? ordered.indexOf(left.name) - ordered.indexOf(right.name) : groupDifference;
        });

    const lines = entries.map(
        (entry) =>
            `    { name: '${entry.name}', group: '${entry.group}', kind: '${entry.kind}', shared: ${entry.shared} },`,
    );

    return [
        '/**',
        ' * Theme tokens the playground exposes in its advanced panel, grouped for the',
        ' * panel and marked with the scope that declares them. Generated by',
        ' * `scripts/generate-playground-tokens.mjs` from the framework Sass. Do not edit',
        ' * by hand; rerun the script whenever the framework token layers change.',
        ' *',
        ' * The list is every custom property the framework declares in its theme',
        ' * scopes except component tokens, private `--_r-*` tokens, and the tokens the',
        ' * basic panel already edits.',
        ' */',
        'window.roolithPlaygroundTokens = [',
        ...lines,
        '];',
        '',
    ].join('\n');
}

const checkOnly = process.argv.includes('--check');
const rendered = renderCatalog();
const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : '';

if (checkOnly) {
    if (current !== rendered) {
        console.error('generate-playground-tokens: docs/playground-tokens.js is out of date');
        process.exitCode = 1;
    } else {
        console.log('ok: docs/playground-tokens.js');
    }
} else {
    fs.writeFileSync(outFile, rendered);
    console.log(`wrote ${path.relative(projectRoot, outFile)} (${rendered.match(/name: /g).length} tokens)`);
}
