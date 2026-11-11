/**
 * Verifies the theme playground model in docs/playground-theme.js.
 *
 * Usage (from the repository root):
 *   node docs/check-playground-theme.mjs
 *
 * The model is one classic script that publishes its pure functions on
 * `window.roolithPlaygroundTheme` and only touches the document inside
 * `readDefaults`, so it loads in a `node:vm` context that provides `window`
 * alone. No DOM and no browser are involved. The script covers normalization,
 * luminance based ink selection, storage sanitizing, range widening, per scope
 * diffing, and the exact selector order and formatting of the generated and
 * preview CSS, then exits non-zero with the failing expectation when an
 * invariant breaks.
 *
 * The exact alias pin below is a drift alarm between the model and the hand
 * maintained copy in this file, not proof that the preview markup consumes every
 * alias. Nothing here reads the preview markup or the framework stylesheet, so a
 * component added to the preview without the alias it needs stays green.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const docsDirectory = path.dirname(fileURLToPath(import.meta.url));
const modelFile = path.join(docsDirectory, 'playground-theme.js');

const context = vm.createContext({ window: {} });

vm.runInContext(fs.readFileSync(modelFile, 'utf8'), context, { filename: 'playground-theme.js' });

const model = context.window.roolithPlaygroundTheme;

const DEFAULTS = {
    colors: {
        primary: '#4a5cd0',
        secondary: '#7b6aa6',
        info: '#2c6196',
        success: '#38805f',
        warning: '#94702f',
        danger: '#bf4a50',
        link: '#5568de',
    },
    darkColors: {
        primary: '#4a5cd0',
        secondary: '#7b6aa6',
        info: '#2c6196',
        success: '#38805f',
        warning: '#94702f',
        danger: '#bf4a50',
        link: '#5568de',
    },
    radius: 8,
    fontSize: 16,
    fontFamily: "'Inter', sans-serif",
};

const BOUNDS = {
    radius: { min: 0, max: 24 },
    fontSize: { min: 12, max: 20 },
    fonts: ['', 'Georgia, "Times New Roman", serif'],
};

const SEPARATE_DARK_DEFAULTS = {
    ...DEFAULTS,
    darkColors: { ...DEFAULTS.colors, primary: '#101010' },
};

const NAMESPACE_KEYS = [
    'buildDeclarations',
    'createState',
    'normalizeHex',
    'readDefaults',
    'readableInk',
    'renderOverrideCss',
    'renderPreviewCss',
    'sanitizeState',
    'widenRange',
];

const BRAND_NAMES = ['--r-color-primary', '--r-color-primary-on', '--r-color-primary-text'];

const PREVIEW_ALIAS_NAMES = [
    '--r-accent',
    '--r-accent-on',
    '--r-link',
    '--r-focus-ring-color',
    '--r-form-input-hover-border-color',
    '--r-form-input-focus-border-color',
    '--r-pagination-item-active-background-color',
    '--r-pagination-item-active-color',
    '--r-tab-active-color',
    '--r-comment-highlight-color',
    '--r-button-radius',
    '--r-card-radius',
    '--r-form-input-radius',
    '--r-img-radius',
    '--r-message-radius',
    '--r-pagination-item-border-radius',
];

const DARK_COMMENT_RESET_NAMES = ['--r-comment-highlight-color'];

const PREVIEW_BLOCKS = {
    shared: [{ name: '--r-global-border-radius', value: '12px' }],
    light: [
        { name: '--r-color-primary', value: '#123456' },
        { name: '--r-color-primary-on', value: '#ffffff' },
        { name: '--r-color-primary-text', value: 'var(--r-color-primary)' },
    ],
    dark: [],
    count: 4,
};

const PREVIEW_DECLARATION_NAMES = [
    ...PREVIEW_ALIAS_NAMES,
    '--r-global-border-radius',
    ...BRAND_NAMES,
    ...DARK_COMMENT_RESET_NAMES,
];

let assertionCount = 0;

/**
 * Assert one expectation, counting it so the pass line reports the coverage.
 * @param {unknown} actual - Observed value.
 * @param {unknown} expected - Expected value.
 * @param {string} message - Failure message naming the expectation.
 * @returns {void}
 */
function check(actual, expected, message) {
    assert.deepEqual(actual, expected, message);
    assertionCount += 1;
}

/**
 * Parse the custom property names out of a rendered stylesheet, in source order.
 * @param {string} css - Rendered CSS.
 * @returns {string[]} Declaration names in the order they appear.
 */
function declarationNames(css) {
    return [...css.matchAll(/^[ \t]+(--[\w-]+):/gm)].map((match) => match[1]);
}

/**
 * Count non-overlapping occurrences of a needle in a haystack.
 * @param {string} needle - Text to look for.
 * @param {string} haystack - Text to search.
 * @returns {number} Number of occurrences.
 */
function count(needle, haystack) {
    return haystack.split(needle).length - 1;
}

/**
 * Copy a model result into the host realm through JSON. The model is evaluated in
 * a `node:vm` context, so its objects carry that realm's prototypes and strict
 * deep equality, which compares `[[Prototype]]`, would reject two structurally
 * identical values from different realms. Only JSON-shaped results survive the
 * round trip, so `undefined`, `NaN`, `Infinity`, and `Date` values do not.
 * @param {unknown} value - A value returned by the model.
 * @returns {unknown} The same value as a host realm copy.
 */
function hostRealm(value) {
    return JSON.parse(JSON.stringify(value));
}

/**
 * Build a state that matches the framework defaults exactly.
 * @returns {object} A clean state.
 */
function createDefaultState() {
    return {
        colors: { ...DEFAULTS.colors },
        radius: DEFAULTS.radius,
        fontSize: DEFAULTS.fontSize,
        fontFamily: '',
    };
}

/**
 * Check the namespace the controller depends on and hex normalization.
 * @returns {void}
 */
function checkNormalizeHex() {
    check(
        [...Object.keys(model)].sort(),
        [...NAMESPACE_KEYS].sort(),
        'the namespace exposes exactly the model functions the controller uses',
    );

    check(model.normalizeHex('#4A5CD0'), '#4a5cd0', 'six digit hex folds to lowercase');
    check(model.normalizeHex('4A5CD0'), '#4a5cd0', 'the leading hash is optional');
    check(model.normalizeHex('#ABC'), '#aabbcc', 'three digit hex expands');
    check(model.normalizeHex(' abc '), '#aabbcc', 'shorthand expands after trimming');
    check(model.normalizeHex('#abcd'), null, 'four digits are not a hex color');
    check(model.normalizeHex('zzzzzz'), null, 'non hex input returns null');
    check(model.normalizeHex(''), null, 'empty input returns null');
    check(model.normalizeHex('   '), null, 'whitespace only input returns null');
}

/**
 * Check the luminance based on-color choice.
 * @returns {void}
 */
function checkReadableInk() {
    check(model.readableInk('#000000'), '#ffffff', 'a black fill takes white ink');
    check(model.readableInk('#ffffff'), '#000000', 'a white fill takes black ink');
    check(model.readableInk('#4a5cd0'), '#ffffff', 'a dark brand fill takes white ink');
}

/**
 * Check stored state validation: type gating, clamping, misspelled fonts, and
 * colors that are not hex values.
 * @returns {void}
 */
function checkSanitizeState() {
    const fallback = model.sanitizeState(null, DEFAULTS, BOUNDS);

    check(fallback.radius, DEFAULTS.radius, 'a null payload falls back to the default radius');
    check(fallback.fontSize, DEFAULTS.fontSize, 'a null payload falls back to the default font size');
    check(fallback.fontFamily, '', 'a null payload leaves the framework font alone');
    check(fallback.colors.primary, DEFAULTS.colors.primary, 'a null payload keeps the default fill');

    check(model.sanitizeState({ radius: 99 }, DEFAULTS, BOUNDS).radius, 24, 'radius clamps to the upper bound');
    check(model.sanitizeState({ radius: -5 }, DEFAULTS, BOUNDS).radius, 0, 'radius clamps to the lower bound');
    check(model.sanitizeState({ radius: 10.6 }, DEFAULTS, BOUNDS).radius, 11, 'radius rounds to a whole pixel');
    check(model.sanitizeState({ fontSize: 99 }, DEFAULTS, BOUNDS).fontSize, 20, 'font size clamps to the upper bound');
    check(model.sanitizeState({ fontSize: 1 }, DEFAULTS, BOUNDS).fontSize, 12, 'font size clamps to the lower bound');

    check(model.sanitizeState({ radius: null }, DEFAULTS, BOUNDS).radius, DEFAULTS.radius, 'null radius is not zero');
    check(model.sanitizeState({ radius: true }, DEFAULTS, BOUNDS).radius, DEFAULTS.radius, 'true radius is not one');

    check(
        model.sanitizeState({ fontSize: '' }, DEFAULTS, BOUNDS).fontSize,
        DEFAULTS.fontSize,
        'an empty font size falls back instead of collapsing to the minimum',
    );

    check(
        model.sanitizeState({ fontSize: '18' }, DEFAULTS, BOUNDS).fontSize,
        DEFAULTS.fontSize,
        'a numeric string falls back instead of coercing',
    );

    check(
        model.sanitizeState({ fontFamily: 'Georgia, "Times New Roman", serif' }, DEFAULTS, BOUNDS).fontFamily,
        'Georgia, "Times New Roman", serif',
        'a listed font stack is kept',
    );

    check(
        model.sanitizeState({ fontFamily: 'Unknown Sans' }, DEFAULTS, BOUNDS).fontFamily,
        '',
        'an unknown font stack falls back to the framework default',
    );

    check(
        model.sanitizeState({ colors: { primary: 'not-a-color' } }, DEFAULTS, BOUNDS).colors.primary,
        DEFAULTS.colors.primary,
        'a bad fill falls back to the default',
    );

    check(
        model.sanitizeState({ colors: { primary: '#ABC' } }, DEFAULTS, BOUNDS).colors.primary,
        '#aabbcc',
        'a stored shorthand fill is normalized',
    );

    check(
        model.sanitizeState({ colors: { primary: 100000 } }, DEFAULTS, BOUNDS).colors.primary,
        DEFAULTS.colors.primary,
        'a numeric stored fill falls back instead of stringifying into a hex color',
    );

    check(
        hostRealm(model.sanitizeState('x', DEFAULTS, BOUNDS)),
        createDefaultState(),
        'a non-object payload falls back to the framework defaults',
    );
}

/**
 * Check the pure range widening the controller applies before sanitizing: a
 * value inside the range changes nothing, a value outside widens the matching
 * side, and the given range is never mutated.
 * @returns {void}
 */
function checkWidenRange() {
    check(
        hostRealm(model.widenRange({ min: 0, max: 24 }, 8)),
        { min: 0, max: 24 },
        'a value inside the range leaves it alone',
    );
    check(
        hostRealm(model.widenRange({ min: 0, max: 24 }, 30)),
        { min: 0, max: 30 },
        'a value above the max widens the max',
    );
    check(
        hostRealm(model.widenRange({ min: 12, max: 20 }, 6)),
        { min: 6, max: 20 },
        'a value below the min widens the min',
    );

    const above = model.widenRange({ min: 12, max: 20 }, 26);
    const below = model.widenRange({ min: 12, max: 20 }, 2);

    check(above.min <= above.max, true, 'widening above the max never inverts the range');
    check(below.min <= below.max, true, 'widening below the min never inverts the range');

    const declared = { min: 0, max: 24 };
    const widened = model.widenRange(declared, 30);

    check(declared, { min: 0, max: 24 }, 'widening does not mutate the input range');
    check(widened === declared, false, 'widening returns a new range object');
}

/**
 * Check per scope diffing, the derived declaration triples, and the split
 * between shared and brand tokens.
 * @returns {void}
 */
function checkBuildDeclarations() {
    const clean = model.buildDeclarations(createDefaultState(), DEFAULTS);

    check(clean.shared.length, 0, 'a value equal to the default emits no shared declaration');
    check(clean.light.length, 0, 'a value equal to the default emits no light declaration');
    check(clean.dark.length, 0, 'a value equal to the default emits no dark declaration');
    check(clean.count, 0, 'a clean state reports no overridden tokens');

    const lightOnlyState = createDefaultState();
    lightOnlyState.colors.primary = SEPARATE_DARK_DEFAULTS.darkColors.primary;

    const lightBlocks = model.buildDeclarations(lightOnlyState, SEPARATE_DARK_DEFAULTS);

    check(lightBlocks.light.length, 3, 'a light only change emits the fill triple');
    check(lightBlocks.dark.length, 0, 'a light only change emits no dark block');

    const bothState = createDefaultState();
    bothState.colors.primary = '#123456';

    const both = model.buildDeclarations(bothState, DEFAULTS);

    check([...both.light.map((declaration) => declaration.name)], BRAND_NAMES, 'the light block lists the fill triple');

    check([...both.dark.map((declaration) => declaration.name)], BRAND_NAMES, 'the dark block lists the fill triple');

    check(both.light[0].value, '#123456', 'the light rule carries the chosen fill');
    check(both.light[1].value, '#ffffff', 'the on-color is readable ink for the chosen fill');
    check(both.light[2].value, 'var(--r-color-primary)', 'a zero light mix reuses the fill');
    check(
        both.dark[2].value,
        'color-mix(in srgb, var(--r-color-primary), white 34%)',
        'the dark text tint mixes toward white',
    );

    check(both.count, 3, 'a brand change counts three token names');

    const structuralState = createDefaultState();
    structuralState.radius = 12;
    structuralState.fontSize = 18;
    structuralState.fontFamily = 'Georgia, "Times New Roman", serif';

    const structural = model.buildDeclarations(structuralState, DEFAULTS);

    check(
        [...structural.shared.map((declaration) => declaration.name)],
        ['--r-global-border-radius', '--r-global-base-font-size', '--r-global-base-font'],
        'structural changes go to the shared block',
    );

    check(
        [...structural.shared.map((declaration) => declaration.value)],
        ['12px', '18px', 'Georgia, "Times New Roman", serif'],
        'structural values are emitted as pixels and the chosen stack',
    );

    check(structural.light.length + structural.dark.length, 0, 'structural changes emit no brand declarations');
    check(structural.count, 3, 'structural changes count three token names');
}

/**
 * Check the copied stylesheet: empty output, exact first rule, selector order,
 * the repeated dark rule, the trailing newline, and balanced braces.
 * @returns {void}
 */
function checkRenderOverrideCss() {
    check(
        model.renderOverrideCss({ shared: [], light: [], dark: [], count: 0 }),
        '',
        'an empty diff renders an empty stylesheet',
    );

    check(
        model.renderOverrideCss({
            shared: [{ name: '--r-global-border-radius', value: '12px' }],
            light: [],
            dark: [],
            count: 1,
        }),
        '/* roolith theme overrides */\n\n:root,\n.theme-light,\n.theme-dark {\n    --r-global-border-radius: 12px;\n}\n',
        'a shared only diff renders one rule with a trailing newline',
    );

    const lightOnly = model.renderOverrideCss({
        shared: [],
        light: [{ name: '--r-color-primary', value: '#4a5cd0' }],
        dark: [],
        count: 1,
    });

    check(lightOnly.includes('@media'), false, 'a light only diff emits no dark media query');
    check(lightOnly.includes(':root:not(.theme-light)'), false, 'a light only diff emits no automatic dark scope');
    check(
        lightOnly.startsWith('/* roolith theme overrides */\n\n:root,\n.theme-light {'),
        true,
        'the light scope follows the header comment',
    );

    const full = model.renderOverrideCss({
        shared: [{ name: '--r-global-border-radius', value: '12px' }],
        light: [{ name: '--r-color-primary', value: '#4a5cd0' }],
        dark: [{ name: '--r-color-primary', value: '#123456' }],
        count: 3,
    });

    const sharedIndex = full.indexOf(':root,\n.theme-light,\n.theme-dark {');
    const lightIndex = full.indexOf(':root,\n.theme-light {');
    const darkIndex = full.indexOf('.theme-dark {\n    --r-color-primary: #123456;');
    const mediaIndex = full.indexOf('@media (prefers-color-scheme: dark) {');

    check(
        full.slice(0, sharedIndex),
        '/* roolith theme overrides */\n\n',
        'the header comment precedes the shared rule',
    );

    check(sharedIndex < lightIndex && lightIndex < darkIndex, true, 'the order is shared, then light, then dark');
    check(darkIndex < mediaIndex, true, 'the automatic dark media query comes last');

    const mediaBlock = full.slice(mediaIndex);

    check(mediaBlock.includes(':root:not(.theme-light) {'), true, 'the media query targets the automatic dark scope');
    check(
        mediaBlock.includes('        --r-color-primary: #123456;'),
        true,
        'the dark declarations are indented inside the media query',
    );

    check(
        count('--r-color-primary: #123456;', full),
        2,
        'the dark declaration appears in the class and media scopes',
    );

    check(full.endsWith('\n'), true, 'the generated stylesheet ends with a newline');
    check(full.endsWith('\n\n'), false, 'the generated stylesheet ends with one newline');
    check(count('{', full), count('}', full), 'every opened brace is closed');
    check(count(';', full), 4, 'each declaration ends with exactly one semicolon');
}

/**
 * Check the scoped preview stylesheet: empty output, the selectors passed in,
 * the re-declared alias tokens the preview needs, and the dark comment reset
 * that always pairs with the base rule.
 * @returns {void}
 */
function checkRenderPreviewCss() {
    const empty = model.renderPreviewCss(
        { shared: [], light: [], dark: [], count: 0 },
        '.preview-light',
        '.preview-dark',
    );

    check(empty, '', 'an empty diff renders an empty preview stylesheet');

    check(
        declarationNames(model.renderPreviewCss(PREVIEW_BLOCKS, '.preview-light', '.preview-dark')),
        PREVIEW_DECLARATION_NAMES,
        'the preview re-declares every alias, then the shared and light declarations, then the paired dark reset',
    );

    const lightOnly = model.renderPreviewCss(
        {
            shared: [{ name: '--r-global-border-radius', value: '12px' }],
            light: [{ name: '--r-color-primary', value: '#4a5cd0' }],
            dark: [],
            count: 2,
        },
        '.preview-light',
        '.preview-dark',
    );

    check(lightOnly.startsWith('.preview-light {'), true, 'the preview rule uses the light selector it was given');
    check(lightOnly.includes('--r-accent: var(--r-color-primary);'), true, 'the accent alias is re-declared');

    check(
        lightOnly.includes('--r-button-radius: var(--r-global-border-radius);'),
        true,
        'derived radii are re-declared',
    );
    check(
        lightOnly.includes('--r-img-radius: var(--r-global-border-radius);'),
        true,
        'the avatar radius is re-declared',
    );
    check(lightOnly.includes('--r-global-border-radius: 12px;'), true, 'the shared declaration is applied');

    const lightOnlyDarkStart = lightOnly.indexOf('.preview-dark {');

    check(lightOnlyDarkStart > 0, true, 'a light only diff still emits a dark preview rule');
    check(
        declarationNames(lightOnly.slice(lightOnlyDarkStart)),
        DARK_COMMENT_RESET_NAMES,
        'the paired dark rule holds only the comment reset',
    );
    check(
        lightOnly.includes('--r-comment-highlight-color: var(--r-color-neutral-300);'),
        true,
        'the dark comment reset uses the framework neutral',
    );
    check(lightOnly.includes('.theme-dark'), false, 'the preview does not reuse the page dark selector');
    check(lightOnly.includes(':root'), false, 'the preview never emits a root scoped rule');

    const both = model.renderPreviewCss(
        {
            shared: [],
            light: [{ name: '--r-color-primary', value: '#4a5cd0' }],
            dark: [
                { name: '--r-color-primary', value: '#123456' },
                { name: '--r-color-primary-on', value: '#ffffff' },
                {
                    name: '--r-color-primary-text',
                    value: 'color-mix(in srgb, var(--r-color-primary), white 34%)',
                },
            ],
            count: 3,
        },
        '.preview-light',
        '.preview-dark',
    );

    check(both.includes('.preview-dark {'), true, 'the dark preview rule uses the dark selector it was given');
    check(both.indexOf('.preview-light {') < both.indexOf('.preview-dark {'), true, 'the light rule comes first');
    check(both.includes('.doc-playground'), false, 'the preview stylesheet only uses the selectors passed in');

    const bothDarkStart = both.indexOf('.preview-dark {');

    check(
        declarationNames(both.slice(bothDarkStart)),
        [...DARK_COMMENT_RESET_NAMES, ...BRAND_NAMES],
        'a dark diff puts the comment reset before its own declarations',
    );
}

/**
 * Run every check group and report a single pass line.
 * @returns {void}
 */
function main() {
    checkNormalizeHex();
    checkReadableInk();
    checkSanitizeState();
    checkWidenRange();
    checkBuildDeclarations();
    checkRenderOverrideCss();
    checkRenderPreviewCss();

    console.log(`ok: docs/playground-theme.js (${assertionCount} assertions)`);
}

try {
    main();
} catch (error) {
    console.error(`check-playground-theme: ${error.message}`);
    process.exitCode = 1;
}
