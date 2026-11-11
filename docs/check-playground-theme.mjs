/**
 * Verifies the theme playground model in docs/playground-theme.js.
 *
 * Usage (from the repository root):
 *   node docs/check-playground-theme.mjs
 *
 * The model is one classic script that publishes its pure functions on
 * `window.roolithPlaygroundTheme` and only touches the document inside
 * `readDefaults`, so it loads in a `node:vm` context that provides `window` with
 * a small advanced token catalog. No DOM and no browser are involved. The script
 * covers color normalization, advanced value validation, luminance based ink
 * selection, storage sanitizing, range widening, per scope diffing, and the exact
 * selector order and formatting of the generated and preview CSS, then exits
 * non-zero with the failing expectation when an invariant breaks.
 *
 * The preview needs no alias list because the preview root carries an explicit
 * theme class, so the framework re-declares every derived token on that element
 * itself. The assertions below pin that contract: the preview rule holds only
 * the shared declarations plus the declarations of the scope it is showing.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const docsDirectory = path.dirname(fileURLToPath(import.meta.url));
const modelFile = path.join(docsDirectory, 'playground-theme.js');

const CATALOG = [
    { name: '--r-color-primary-on', group: 'Palette', kind: 'color', shared: false },
    { name: '--r-color-primary-text', group: 'Palette', kind: 'color', shared: false },
    { name: '--r-color-secondary-on', group: 'Palette', kind: 'color', shared: false },
    { name: '--r-color-secondary-text', group: 'Palette', kind: 'color', shared: false },
    { name: '--r-surface-page', group: 'Surfaces', kind: 'color', shared: false },
    { name: '--r-text', group: 'Text', kind: 'color', shared: false },
    { name: '--r-accent', group: 'Roles', kind: 'color', shared: true },
    { name: '--r-global-width', group: 'Global', kind: 'value', shared: true },
    { name: '--r-code-background', group: 'Detail', kind: 'color', shared: true },
];

const context = vm.createContext({ window: { roolithPlaygroundTokens: CATALOG } });

vm.runInContext(fs.readFileSync(modelFile, 'utf8'), context, { filename: 'playground-theme.js' });

const model = context.window.roolithPlaygroundTheme;

const DEFAULTS = {
    colors: {
        primary: '#4a5cd0',
        secondary: '#7b6aa6',
        tertiary: '#4c7d8f',
        info: '#2c6196',
        success: '#38805f',
        warning: '#94702f',
        danger: '#bf4a50',
        link: '#5568de',
    },
    darkColors: {
        primary: '#4a5cd0',
        secondary: '#9c8fbc',
        tertiary: '#4c7d8f',
        info: '#6098d0',
        success: '#38805f',
        warning: '#c29440',
        danger: '#bf4a50',
        link: '#8895e8',
    },
    radius: 8,
    fontSize: 16,
    fontFamily: "'Inter', sans-serif",
    advanced: {
        shared: {
            '--r-accent': 'var(--r-color-primary)',
            '--r-global-width': '75rem',
            '--r-code-background': 'var(--r-surface-muted)',
        },
        light: {
            '--r-color-primary-on': '#ffffff',
            '--r-color-primary-text': 'var(--r-color-primary)',
            '--r-color-secondary-on': '#ffffff',
            '--r-color-secondary-text': 'color-mix(in srgb, var(--r-color-secondary), black 8%)',
            '--r-surface-page': 'var(--r-color-neutral)',
            '--r-text': 'var(--r-color-neutral-900)',
            '--r-accent': 'var(--r-color-primary)',
            '--r-global-width': '75rem',
            '--r-code-background': 'var(--r-surface-muted)',
        },
        dark: {
            '--r-color-primary-on': '#ffffff',
            '--r-color-primary-text': 'color-mix(in srgb, var(--r-color-primary), white 34%)',
            '--r-color-secondary-on': '#ffffff',
            '--r-color-secondary-text': 'color-mix(in srgb, var(--r-color-secondary), white 2%)',
            '--r-surface-page': 'var(--r-color-neutral)',
            '--r-text': 'var(--r-color-neutral-800)',
            '--r-accent': 'var(--r-color-primary)',
            '--r-global-width': '75rem',
            '--r-code-background': 'var(--r-surface-muted)',
        },
    },
};

const BOUNDS = {
    radius: { min: 0, max: 24 },
    fontSize: { min: 12, max: 20 },
    fonts: ['', 'Georgia, "Times New Roman", serif'],
};

const NAMESPACE_KEYS = [
    'buildDeclarations',
    'createState',
    'listTokens',
    'normalizeColor',
    'normalizeHex',
    'normalizeTokenValue',
    'readDefaults',
    'readableInk',
    'renderOverrideCss',
    'renderPreviewCss',
    'sanitizeState',
    'tokenDefault',
    'widenRange',
];

const BRAND_NAMES = ['--r-color-primary', '--r-color-primary-on', '--r-color-primary-text'];

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
        darkColors: { ...DEFAULTS.darkColors },
        advanced: {},
        darkAdvanced: {},
        sharedAdvanced: {},
        radius: DEFAULTS.radius,
        fontSize: DEFAULTS.fontSize,
        fontFamily: '',
    };
}

/**
 * Check the namespace the controller depends on and color normalization.
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
 * Check color normalization for the framework's computed `rgb()` fills.
 * @returns {void}
 */
function checkNormalizeColor() {
    check(model.normalizeColor('#4A5CD0'), '#4a5cd0', 'hex colors pass through');
    check(model.normalizeColor('abc'), '#aabbcc', 'shorthand passes through');
    check(model.normalizeColor('rgb(156, 143.25, 188.25)'), '#9c8fbc', 'fractional rgb channels round');
    check(model.normalizeColor('rgb(96.1855670103, 152.3, 208.4144329897)'), '#6098d0', 'long rgb channels round');
    check(model.normalizeColor('rgba(10, 20, 30, 0.5)'), '#0a141e', 'alpha is ignored for opaque fills');
    check(model.normalizeColor('rgb(100% 0% 50%)'), '#ff0080', 'percentage channels convert');
    check(model.normalizeColor('rgb(300, -4, 128)'), '#ff0080', 'channels clamp into range');
    check(model.normalizeColor('hsl(0 0% 0%)'), null, 'unsupported color syntax returns null');
    check(model.normalizeColor('rgb(1, 2)'), null, 'missing channels return null');
    check(model.normalizeColor(100000), null, 'a number is not a color');
    check(model.normalizeColor(''), null, 'empty input returns null');
}

/**
 * Check advanced value validation: anything that could break out of a declaration
 * or emit a half typed expression is rejected.
 * @returns {void}
 */
function checkNormalizeTokenValue() {
    check(model.normalizeTokenValue('#f59e0b'), '#f59e0b', 'a hex value is kept');
    check(
        model.normalizeTokenValue('  var(--r-color-neutral)  '),
        'var(--r-color-neutral)',
        'a var expression is trimmed',
    );
    check(
        model.normalizeTokenValue('color-mix(in srgb, var(--r-surface), white 10%)'),
        'color-mix(in srgb, var(--r-surface), white 10%)',
        'a color-mix expression is kept',
    );
    check(model.normalizeTokenValue('75rem'), '75rem', 'a length is kept');
    check(model.normalizeTokenValue(''), null, 'an empty value is rejected');
    check(model.normalizeTokenValue('   '), null, 'a whitespace value is rejected');
    check(model.normalizeTokenValue('red; color: blue'), null, 'a semicolon is rejected');
    check(model.normalizeTokenValue('red } body { display: none'), null, 'a brace is rejected');
    check(model.normalizeTokenValue('red /*'), null, 'a comment opener is rejected');
    check(model.normalizeTokenValue('var(--r-text'), null, 'an unbalanced expression is rejected');
    check(model.normalizeTokenValue('a'.repeat(161)), null, 'an over long value is rejected');
    check(model.normalizeTokenValue(100000), null, 'a number is rejected');
    check(model.normalizeTokenValue('a\nb'), null, 'a newline is rejected');
}

/**
 * Check the catalog accessors the advanced panel depends on.
 * @returns {void}
 */
function checkAdvancedTokens() {
    check(
        hostRealm(model.listTokens()),
        hostRealm(CATALOG),
        'the model exposes the generated catalog',
    );

    const sharedToken = CATALOG.find((token) => token.shared);
    const themeToken = CATALOG.find((token) => !token.shared);

    check(
        model.tokenDefault(sharedToken, DEFAULTS, 'light'),
        'var(--r-color-primary)',
        'a shared token has one default',
    );
    check(
        model.tokenDefault(sharedToken, DEFAULTS, 'dark'),
        'var(--r-color-primary)',
        'a shared default ignores the scope',
    );
    check(model.tokenDefault(themeToken, DEFAULTS, 'light'), '#ffffff', 'a theme token reads the light default');
    check(model.tokenDefault(themeToken, DEFAULTS, 'dark'), '#ffffff', 'a theme token reads the dark default');
    check(
        model.tokenDefault(themeToken, DEFAULTS, 'dark'),
        DEFAULTS.advanced.dark[themeToken.name],
        'the dark default comes from the dark map',
    );
    check(
        model.tokenDefault({ name: '--r-missing', shared: false }, DEFAULTS, 'light'),
        '',
        'an undeclared token has no default',
    );
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
        model.sanitizeState({ darkColors: { secondary: '#ABC' } }, DEFAULTS, BOUNDS).darkColors.secondary,
        '#aabbcc',
        'a stored dark fill is normalized',
    );

    check(
        model.sanitizeState({ colors: { primary: '#101010' } }, DEFAULTS, BOUNDS).darkColors.primary,
        DEFAULTS.darkColors.primary,
        'a missing dark palette falls back to the framework dark defaults',
    );

    const legacy = model.sanitizeState({ colors: { primary: '#101010' } }, DEFAULTS, BOUNDS);

    check(legacy.colors.primary, '#101010', 'a legacy payload keeps its light palette');
    check(
        hostRealm(legacy.darkColors),
        { ...DEFAULTS.darkColors },
        'a legacy payload gets the framework dark palette, not the light one',
    );

    check(
        hostRealm(model.sanitizeState('x', DEFAULTS, BOUNDS)),
        createDefaultState(),
        'a non-object payload falls back to the framework defaults',
    );

    const advanced = model.sanitizeState(
        {
            advanced: {
                '--r-surface-page': ' #101010 ',
                '--r-text': 'red; }',
                '--r-accent': 'red',
                '--r-unknown': 'red',
            },
            darkAdvanced: { '--r-text': 'var(--r-color-white)' },
            sharedAdvanced: { '--r-global-width': '90rem', '--r-surface-page': 'red' },
        },
        DEFAULTS,
        BOUNDS,
    );

    check(
        hostRealm(advanced.advanced),
        { '--r-surface-page': '#101010' },
        'only safe, theme scoped advanced values are kept',
    );
    check(
        hostRealm(advanced.darkAdvanced),
        { '--r-text': 'var(--r-color-white)' },
        'dark advanced values are sanitized',
    );
    check(hostRealm(advanced.sharedAdvanced), { '--r-global-width': '90rem' }, 'only shared advanced tokens survive');
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
    lightOnlyState.colors.primary = '#123456';

    const lightBlocks = model.buildDeclarations(lightOnlyState, DEFAULTS);

    check(lightBlocks.light.length, 3, 'a light only change emits the fill triple');
    check(lightBlocks.dark.length, 3, 'a light only change re-asserts the dark defaults');
    check(lightBlocks.dark[0].value, DEFAULTS.darkColors.primary, 'the dark scope keeps its own fill');
    check(
        lightBlocks.dark[2].value,
        DEFAULTS.advanced.dark['--r-color-primary-text'],
        'the dark scope keeps its declared text tint',
    );
    check(hostRealm(lightBlocks.changed), { light: true, dark: false }, 'only the light scope is marked changed');

    const darkOnlyState = createDefaultState();
    darkOnlyState.darkColors.primary = '#123456';

    const darkBlocks = model.buildDeclarations(darkOnlyState, DEFAULTS);

    check(darkBlocks.light.length, 3, 'a dark only change re-asserts the light defaults');
    check(darkBlocks.dark.length, 3, 'a dark only change emits the dark fill triple');
    check(darkBlocks.light[0].value, DEFAULTS.colors.primary, 'the light scope keeps its own fill');
    check(hostRealm(darkBlocks.changed), { light: false, dark: true }, 'only the dark scope is marked changed');

    const untouchedSecondary = createDefaultState();
    untouchedSecondary.darkColors.secondary = '#200030';

    const untouchedBlocks = model.buildDeclarations(untouchedSecondary, DEFAULTS);

    check(
        untouchedBlocks.light[1].value,
        '#ffffff',
        'an untouched scope keeps the framework on-color instead of re-deriving it',
    );
    check(
        untouchedBlocks.light[2].value,
        DEFAULTS.advanced.light['--r-color-secondary-text'],
        'an untouched scope keeps the framework text tint',
    );

    const bothState = createDefaultState();
    bothState.colors.primary = '#123456';
    bothState.darkColors.primary = '#654321';

    const both = model.buildDeclarations(bothState, DEFAULTS);

    check([...both.light.map((declaration) => declaration.name)], BRAND_NAMES, 'the light block lists the fill triple');

    check([...both.dark.map((declaration) => declaration.name)], BRAND_NAMES, 'the dark block lists the fill triple');

    check(both.light[0].value, '#123456', 'the light rule carries the chosen light fill');
    check(both.dark[0].value, '#654321', 'the dark rule carries the chosen dark fill');
    check(both.light[1].value, '#ffffff', 'the on-color is readable ink for the chosen fill');
    check(both.light[2].value, 'var(--r-color-primary)', 'a zero light mix reuses the fill');
    check(
        both.dark[2].value,
        'color-mix(in srgb, var(--r-color-primary), white 34%)',
        'the dark text tint mixes toward white',
    );

    check(both.count, 3, 'a brand change counts three token names');

    const tertiaryState = createDefaultState();
    tertiaryState.colors.tertiary = '#204060';
    tertiaryState.darkColors.tertiary = '#204060';

    const tertiary = model.buildDeclarations(tertiaryState, DEFAULTS);

    check(tertiary.light[2].value, 'color-mix(in srgb, var(--r-color-tertiary), black 10%)', 'the tertiary light tint');
    check(tertiary.dark[2].value, 'color-mix(in srgb, var(--r-color-tertiary), white 26%)', 'the tertiary dark tint');

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

    const sharedToken = createDefaultState();
    sharedToken.sharedAdvanced['--r-global-width'] = '90rem';

    const sharedAdvanced = model.buildDeclarations(sharedToken, DEFAULTS);

    check(
        hostRealm(sharedAdvanced.shared),
        [{ name: '--r-global-width', value: '90rem' }],
        'a shared advanced override goes to the shared block',
    );
    check(sharedAdvanced.light.length + sharedAdvanced.dark.length, 0, 'a shared override emits no scope declarations');
    check(hostRealm(sharedAdvanced.changed), { light: false, dark: false }, 'a shared override marks no scope changed');
    check(sharedAdvanced.count, 1, 'a shared override counts one token');

    const lightOverride = createDefaultState();
    lightOverride.advanced['--r-surface-page'] = '#101010';

    const lightAdvanced = model.buildDeclarations(lightOverride, DEFAULTS);

    check(
        hostRealm(lightAdvanced.light),
        [{ name: '--r-surface-page', value: '#101010' }],
        'a light override carries the chosen value',
    );
    check(
        hostRealm(lightAdvanced.dark),
        [{ name: '--r-surface-page', value: 'var(--r-color-neutral)' }],
        'a light only override re-declares the dark default, so the palettes stay independent',
    );
    check(hostRealm(lightAdvanced.changed), { light: true, dark: false }, 'only the light scope is marked changed');
    check(lightAdvanced.count, 1, 'a scope override counts one token');

    const darkOverride = createDefaultState();
    darkOverride.darkAdvanced['--r-text'] = '#e5e5e5';

    const darkAdvanced = model.buildDeclarations(darkOverride, DEFAULTS);

    check(
        hostRealm(darkAdvanced.dark),
        [{ name: '--r-text', value: '#e5e5e5' }],
        'a dark override carries the chosen value',
    );
    check(
        hostRealm(darkAdvanced.light),
        [{ name: '--r-text', value: 'var(--r-color-neutral-900)' }],
        'a dark only override re-declares the light default',
    );
    check(hostRealm(darkAdvanced.changed), { light: false, dark: true }, 'only the dark scope is marked changed');

    const sameValue = createDefaultState();
    sameValue.advanced['--r-surface-page'] = DEFAULTS.advanced.light['--r-surface-page'];

    check(
        hostRealm(model.buildDeclarations(sameValue, DEFAULTS)),
        hostRealm({ shared: [], light: [], dark: [], changed: { light: false, dark: false }, count: 0 }),
        'an advanced value equal to the default emits nothing',
    );

    const derived = createDefaultState();
    derived.colors.primary = '#123456';
    derived.advanced['--r-color-primary-on'] = '#00ff00';

    const derivedBlocks = model.buildDeclarations(derived, DEFAULTS);
    const derivedNames = derivedBlocks.light.map((declaration) => declaration.name);

    check(
        derivedNames.lastIndexOf('--r-color-primary-on'),
        derivedNames.length - 1,
        'a manual advanced override is emitted after the derived brand triple, so it wins',
    );
    check(
        derivedBlocks.light[derivedBlocks.light.length - 1].value,
        '#00ff00',
        'the manual on-color value is the last declaration',
    );
    check(derivedBlocks.count, 3, 'a derived triple plus one manual override still counts three token names');
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
 * Check the scoped preview stylesheet: empty output, the selector passed in,
 * shared declarations first, and only the active scope's declarations.
 * @returns {void}
 */
function checkRenderPreviewCss() {
    const empty = model.renderPreviewCss({ shared: [], light: [], dark: [], count: 0 }, 'light', '.preview-light');

    check(empty, '', 'an empty diff renders an empty preview stylesheet');

    const blocks = {
        shared: [{ name: '--r-global-border-radius', value: '12px' }],
        light: [
            { name: '--r-color-primary', value: '#123456' },
            { name: '--r-color-primary-on', value: '#ffffff' },
            { name: '--r-color-primary-text', value: 'var(--r-color-primary)' },
        ],
        dark: [
            { name: '--r-color-secondary', value: '#654321' },
            { name: '--r-color-secondary-on', value: '#000000' },
            { name: '--r-color-secondary-text', value: 'color-mix(in srgb, var(--r-color-secondary), white 2%)' },
        ],
        count: 6,
    };

    const light = model.renderPreviewCss(blocks, 'light', '.preview.theme-light');

    check(light.startsWith('.preview.theme-light {'), true, 'the preview rule uses the selector it was given');
    check(
        declarationNames(light),
        ['--r-global-border-radius', ...BRAND_NAMES],
        'the light preview renders shared declarations, then the light palette',
    );
    check(light.includes('--r-color-secondary'), false, 'the light preview never renders dark declarations');
    check(light.includes('--r-accent'), false, 'the preview does not repeat framework aliases');
    check(light.includes('--r-button-radius'), false, 'the preview does not repeat derived component tokens');
    check(light.includes(':root'), false, 'the preview never emits a root scoped rule');
    check(light.includes('@media'), false, 'the preview never emits a media query');

    const dark = model.renderPreviewCss(blocks, 'dark', '.preview.theme-dark');

    check(dark.startsWith('.preview.theme-dark {'), true, 'the dark preview uses the dark selector it was given');
    check(
        declarationNames(dark),
        ['--r-global-border-radius', '--r-color-secondary', '--r-color-secondary-on', '--r-color-secondary-text'],
        'the dark preview renders shared declarations, then the dark palette',
    );
    check(dark.includes('--r-color-primary:'), false, 'the dark preview never renders light declarations');
    check(dark.includes('--r-comment-highlight-color'), false, 'the dark scope reads the framework comment recipe');

    const lightOnlyForDark = model.renderPreviewCss(
        { shared: [], light: [{ name: '--r-color-primary', value: '#123456' }], dark: [], count: 3 },
        'dark',
        '.preview.theme-dark',
    );

    check(lightOnlyForDark, '', 'a light only diff renders nothing for a dark preview');

    const sharedOnly = model.renderPreviewCss(
        { shared: [{ name: '--r-global-border-radius', value: '12px' }], light: [], dark: [], count: 1 },
        'dark',
        '.preview.theme-dark',
    );

    check(
        declarationNames(sharedOnly),
        ['--r-global-border-radius'],
        'a shared only change still reaches whichever scope the preview shows',
    );
}

/**
 * Run every check group and report a single pass line.
 * @returns {void}
 */
function main() {
    checkNormalizeHex();
    checkNormalizeColor();
    checkNormalizeTokenValue();
    checkAdvancedTokens();
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
