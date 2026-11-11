/**
 * Theme model for the docs theme playground: reads the framework token defaults
 * from the loaded stylesheet, validates control state, and renders both the CSS
 * offered for copying and the stylesheet applied to the preview subtree.
 * Light and dark are independent palettes, because the framework ships different
 * brand fills per scope and the copyable CSS has to preserve that split.
 *
 * This is a classic script loaded with `defer` after `/playground-tokens.js` and
 * before `/playground-controls.js` and `/playground.js`. It publishes one
 * namespace, `window.roolithPlaygroundTheme`, because the page controller is a
 * separate classic script and both share the global scope. The model holds no
 * state and touches the document only to measure token defaults.
 *
 * `/playground-tokens.js` is generated from the framework Sass and lists every
 * theme token the advanced panel exposes, which is every custom property the
 * framework declares in its theme scopes except component tokens, private
 * `--_r-*` tokens, and the tokens the basic panel already edits.
 */
(function () {
    'use strict';

    const BRAND_TOKENS = [
        { name: 'primary', lightMix: 0, darkMix: 34 },
        { name: 'secondary', lightMix: 8, darkMix: 2 },
        { name: 'tertiary', lightMix: 10, darkMix: 26 },
        { name: 'info', lightMix: 10, darkMix: 0 },
        { name: 'success', lightMix: 6, darkMix: 28 },
        { name: 'warning', lightMix: 10, darkMix: 0 },
        { name: 'danger', lightMix: 6, darkMix: 32 },
        { name: 'link', lightMix: 8, darkMix: 0 },
    ];

    const TOKEN_FALLBACKS = {
        '--r-color-primary': '#4a5cd0',
        '--r-color-secondary': '#7b6aa6',
        '--r-color-tertiary': '#4c7d8f',
        '--r-color-info': '#2c6196',
        '--r-color-success': '#38805f',
        '--r-color-warning': '#94702f',
        '--r-color-danger': '#bf4a50',
        '--r-color-link': '#5568de',
        '--r-global-border-radius': '0.5rem',
        '--r-global-base-font-size': '100%',
        '--r-global-base-font': "'Inter', sans-serif",
    };

    /**
     * One advanced editor row.
     * @typedef {object} AdvancedToken
     * @property {string} name - Custom property name.
     * @property {string} group - Panel group, such as `Palette` or `Surfaces`.
     * @property {'color' | 'value'} kind - Editor kind, deciding whether a color chip is shown.
     * @property {boolean} shared - True when the framework declares the token in every scope.
     */

    /**
     * Advanced tokens from the generated catalog. A missing or malformed catalog
     * leaves the advanced panel empty instead of breaking the basic controls.
     * @type {AdvancedToken[]}
     */
    const TOKENS = Array.isArray(window.roolithPlaygroundTokens)
        ? window.roolithPlaygroundTokens.filter(
              (token) => token !== null && typeof token === 'object' && typeof token.name === 'string',
          )
        : [];

    /**
     * One custom property declaration in a generated rule.
     * @typedef {object} TokenDeclaration
     * @property {string} name - Custom property name.
     * @property {string} value - Custom property value.
     */

    /**
     * Declared advanced token values, keyed by scope. Values are the framework's
     * declared expressions, not resolved colors, so an unchanged scope can be
     * re-declared without breaking a `var()` chain.
     * @typedef {object} AdvancedDefaults
     * @property {Record<string, string>} shared - Tokens declared in every scope.
     * @property {Record<string, string>} light - Effective light scope values.
     * @property {Record<string, string>} dark - Effective dark scope values.
     */

    /**
     * Framework defaults read from the loaded stylesheet.
     * @typedef {object} PlaygroundDefaults
     * @property {Record<string, string>} colors - Brand fills in the light scope.
     * @property {Record<string, string>} darkColors - Brand fills in the dark scope.
     * @property {number} radius - Shared border radius in pixels.
     * @property {number} fontSize - Shared root font size in pixels.
     * @property {string} fontFamily - Shared font stack.
     * @property {AdvancedDefaults} advanced - Declared advanced token values.
     */

    /**
     * Values currently held by the playground controls.
     * @typedef {object} PlaygroundState
     * @property {Record<string, string>} colors - Chosen brand fills in the light scope.
     * @property {Record<string, string>} darkColors - Chosen brand fills in the dark scope.
     * @property {Record<string, string>} advanced - Advanced token overrides in the light scope.
     * @property {Record<string, string>} darkAdvanced - Advanced token overrides in the dark scope.
     * @property {Record<string, string>} sharedAdvanced - Advanced token overrides for every scope.
     * @property {number} radius - Chosen border radius in pixels.
     * @property {number} fontSize - Chosen root font size in pixels.
     * @property {string} fontFamily - Chosen font stack, empty for the framework default.
     */

    /**
     * Declarations grouped by the theme scope that needs them.
     * @typedef {object} TokenBlocks
     * @property {TokenDeclaration[]} shared - Declarations valid in every scope.
     * @property {TokenDeclaration[]} light - Light scope declarations.
     * @property {TokenDeclaration[]} dark - Dark scope declarations.
     * @property {{light: boolean, dark: boolean}} changed - Scopes with at least one edited token.
     * @property {number} count - Distinct token names across the three groups.
     */

    /**
     * Normalize a hex color to lowercase `#rrggbb`, expanding three digit
     * shorthand. A leading hash is optional.
     * @param {string} value - Candidate color.
     * @returns {string | null} The normalized color, or null when the value is not a hex color.
     */
    function normalizeHex(value) {
        const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());

        if (match === null) {
            return null;
        }

        const digits = match[1].toLowerCase();

        if (digits.length === 3) {
            return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
        }

        return `#${digits}`;
    }

    /**
     * Round one color channel into the 0-255 range and format it as two hex digits.
     * @param {number} value - Channel value.
     * @returns {string} Two lowercase hex digits.
     */
    function hexChannel(value) {
        return Math.round(Math.min(255, Math.max(0, value)))
            .toString(16)
            .padStart(2, '0');
    }

    /**
     * Normalize a color to lowercase `#rrggbb`. Accepts hex with or without a
     * leading hash, three or six digits, or an `rgb()`/`rgba()` value with numeric
     * or percentage channels. The framework declares four of its dark brand fills
     * as `rgb()` values, so reading defaults has to accept more than hex. An alpha
     * channel is ignored because brand fills are opaque.
     * @param {unknown} value - Candidate color.
     * @returns {string | null} The normalized color, or null when the value is not a hex or rgb color.
     */
    function normalizeColor(value) {
        if (typeof value !== 'string') {
            return null;
        }

        const hex = normalizeHex(value);

        if (hex !== null) {
            return hex;
        }

        const match = /^rgba?\(\s*([^)]+)\)$/i.exec(value.trim());
        const channels = match === null ? [] : match[1].split(/[\s,/]+/).filter(Boolean).slice(0, 3);

        if (channels.length !== 3) {
            return null;
        }

        const values = channels.map((channel) => {
            const number = Number.parseFloat(channel);

            if (!Number.isFinite(number)) {
                return null;
            }

            return channel.endsWith('%') ? (number / 100) * 255 : number;
        });

        if (values.some((channel) => channel === null)) {
            return null;
        }

        return `#${values.map(hexChannel).join('')}`;
    }

    /**
     * Pick a readable label color for a fill. 0.179 is the WCAG relative
     * luminance where black and white reach the same contrast ratio.
     * @param {string} hex - Fill color as `#rrggbb`.
     * @returns {string} Either `#000000` or `#ffffff`.
     */
    function readableInk(hex) {
        const channels = [1, 3, 5].map((offset) => {
            const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;

            return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];

        return luminance > 0.179 ? '#000000' : '#ffffff';
    }

    /**
     * Resolve a CSS length to pixels inside the document, which lets rem and
     * percentage defaults be compared with the pixel sliders.
     * @param {string} value - A CSS length such as `0.5rem` or `100%`.
     * @returns {number} The resolved pixel value, or the parsed number when the browser cannot measure it.
     */
    function resolvePx(value) {
        const probe = document.createElement('div');
        probe.style.cssText = 'position:fixed;top:0;left:-10000px;visibility:hidden;pointer-events:none;';
        probe.style.fontSize = value;
        document.documentElement.appendChild(probe);

        const pixels = Number.parseFloat(window.getComputedStyle(probe).fontSize);

        probe.remove();

        return Number.isFinite(pixels) ? pixels : Number.parseFloat(value);
    }

    /**
     * Read the framework token values that apply to one theme scope through a
     * throwaway element, so the playground compares against the loaded
     * stylesheet instead of values copied into this file. Every token falls back
     * to a known value when the stylesheet leaves it empty.
     * @param {string} themeClass - Scope class to read, such as `theme-dark`.
     * @returns {Record<string, string>} Raw token values keyed by token name.
     */
    function readThemeTokens(themeClass) {
        const probe = document.createElement('div');
        probe.className = themeClass;
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText =
            'position:fixed;top:0;left:-10000px;width:0;height:0;visibility:hidden;pointer-events:none;';
        document.body.appendChild(probe);

        const computed = window.getComputedStyle(probe);
        const tokens = {};

        for (const name of Object.keys(TOKEN_FALLBACKS)) {
            tokens[name] = computed.getPropertyValue(name).trim() || TOKEN_FALLBACKS[name];
        }

        probe.remove();

        return tokens;
    }

    /**
     * Visit every style rule in a rule list, descending into grouping rules such as
     * `@media`, so the media scoped dark tokens are read too. Keyframe rules carry a
     * style but no selector, so only rules with a selector are visited.
     * @param {CSSRuleList} rules - Rules to walk.
     * @param {(rule: CSSStyleRule) => void} visit - Called for every style rule.
     * @returns {void}
     */
    function walkStyleRules(rules, visit) {
        for (const rule of Array.from(rules)) {
            if (typeof rule.selectorText === 'string') {
                visit(rule);
            }

            if (rule.cssRules !== undefined) {
                walkStyleRules(rule.cssRules, visit);
            }
        }
    }

    /**
     * Read the declared advanced token values straight out of the loaded
     * stylesheet rules, keyed by the scope that declares them. Reading the declared
     * expressions instead of resolved colors keeps expressions such as
     * `var(--r-color-neutral)` intact, so re-declaring an unchanged scope keeps the
     * framework's token chain.
     * @returns {AdvancedDefaults} Declared values with light and dark resolved.
     */
    function readTokenDeclarations() {
        const declared = { shared: {}, light: {}, dark: {} };
        const scopeBySelector = {
            ':root,.theme-light,.theme-dark': 'shared',
            ':root,.theme-light': 'light',
            '.theme-dark': 'dark',
            ':root:not(.theme-light)': 'dark',
        };

        for (const sheet of Array.from(document.styleSheets)) {
            let rules = null;

            try {
                rules = sheet.cssRules;
            } catch (error) {
                /* a cross origin sheet cannot be inspected, skip it */
                continue;
            }

            walkStyleRules(rules, (rule) => {
                const scope = scopeBySelector[rule.selectorText.replace(/\s+/g, '')];

                if (scope === undefined) {
                    return;
                }

                for (const token of TOKENS) {
                    const value = rule.style.getPropertyValue(token.name).trim();

                    if (value !== '') {
                        declared[scope][token.name] = value;
                    }
                }
            });
        }

        return {
            shared: declared.shared,
            light: { ...declared.shared, ...declared.light },
            dark: { ...declared.shared, ...declared.light, ...declared.dark },
        };
    }

    /**
     * Build the defaults the controls start from: the brand fills of both theme
     * scopes plus the structural values they share.
     * @returns {PlaygroundDefaults} Defaults read from the loaded stylesheet.
     */
    function readDefaults() {
        const light = readThemeTokens('theme-light');
        const dark = readThemeTokens('theme-dark');
        const colors = {};
        const darkColors = {};

        for (const token of BRAND_TOKENS) {
            const name = `--r-color-${token.name}`;

            colors[token.name] = normalizeColor(light[name]) || TOKEN_FALLBACKS[name];
            darkColors[token.name] = normalizeColor(dark[name]) || TOKEN_FALLBACKS[name];
        }

        return {
            colors,
            darkColors,
            radius: Math.round(resolvePx(light['--r-global-border-radius'])),
            fontSize: Math.round(resolvePx(light['--r-global-base-font-size'])),
            fontFamily: light['--r-global-base-font'],
            advanced: readTokenDeclarations(),
        };
    }

    /**
     * List the advanced tokens the panel should render.
     * @returns {AdvancedToken[]} The generated catalog.
     */
    function listTokens() {
        return TOKENS;
    }

    /**
     * Resolve the framework default of one advanced token in one scope. Shared
     * tokens have a single default because the framework declares them once.
     * @param {AdvancedToken} token - Advanced token.
     * @param {PlaygroundDefaults} frameworkDefaults - Defaults read from the stylesheet.
     * @param {'light' | 'dark'} scope - Scope to resolve.
     * @returns {string} The declared default, or an empty string when the stylesheet does not declare it.
     */
    function tokenDefault(token, frameworkDefaults, scope) {
        if (token.shared) {
            return frameworkDefaults.advanced.shared[token.name] || '';
        }

        return frameworkDefaults.advanced[scope === 'dark' ? 'dark' : 'light'][token.name] || '';
    }

    /**
     * Create a clean control state from the framework defaults. An empty
     * `fontFamily` means the framework stack is left alone.
     * @param {PlaygroundDefaults} frameworkDefaults - Defaults read from the stylesheet.
     * @returns {PlaygroundState} A fresh state.
     */
    function createState(frameworkDefaults) {
        return {
            colors: { ...frameworkDefaults.colors },
            darkColors: { ...frameworkDefaults.darkColors },
            advanced: {},
            darkAdvanced: {},
            sharedAdvanced: {},
            radius: frameworkDefaults.radius,
            fontSize: frameworkDefaults.fontSize,
            fontFamily: '',
        };
    }

    /**
     * Validate one stored palette, keeping only entries that are hex colors and
     * falling back to the framework palette for every other entry.
     * @param {unknown} candidate - Parsed palette from storage.
     * @param {Record<string, string>} fallback - Framework palette for this scope.
     * @returns {Record<string, string>} A complete, safe palette.
     */
    function sanitizePalette(candidate, fallback) {
        const source = candidate !== null && typeof candidate === 'object' ? candidate : {};
        const palette = { ...fallback };

        for (const token of BRAND_TOKENS) {
            const stored = source[token.name];
            const hex = typeof stored === 'string' ? normalizeHex(stored) : null;

            if (hex !== null) {
                palette[token.name] = hex;
            }
        }

        return palette;
    }

    /**
     * Keep a numeric control value inside an inclusive range.
     * @param {number} value - Candidate value.
     * @param {number} min - Lowest allowed value.
     * @param {number} max - Highest allowed value.
     * @returns {number} The clamped value.
     */
    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    /**
     * Test whether a stored control value is a real, finite number.
     * @param {unknown} value - Candidate value.
     * @returns {boolean} True only for finite numbers, so `null`, `""`, and `true` stay out.
     */
    function isFiniteNumber(value) {
        return typeof value === 'number' && Number.isFinite(value);
    }

    /**
     * Widen a range so a measured default stays representable, returning a new
     * range and leaving the input untouched. Widening is required over clamping,
     * because a clamped default would look changed on load.
     * @param {{min: number, max: number}} range - Declared range.
     * @param {number} value - Measured default that must stay inside the range.
     * @returns {{min: number, max: number}} The widened range, never narrower than the input.
     */
    function widenRange(range, value) {
        return {
            min: Math.min(range.min, value),
            max: Math.max(range.max, value),
        };
    }

    /**
     * Validate one advanced token value before it reaches the generated CSS. The
     * value is free form CSS, so braces, semicolons, angle brackets, backslashes,
     * comment markers, and control characters are rejected to keep an edited
     * value from closing its declaration, and unbalanced parentheses are rejected
     * so a half typed `var()` never reaches the preview.
     * @param {unknown} value - Candidate declaration value.
     * @returns {string | null} The trimmed value, or null when it is not safe to emit.
     */
    function normalizeTokenValue(value) {
        if (typeof value !== 'string') {
            return null;
        }

        const trimmed = value.trim();

        if (trimmed === '' || trimmed.length > 160) {
            return null;
        }

        if (/[;{}<>\\\n\r]/.test(trimmed) || trimmed.includes('/*') || trimmed.includes('*/')) {
            return null;
        }

        const opened = trimmed.split('(').length - 1;
        const closed = trimmed.split(')').length - 1;

        return opened === closed ? trimmed : null;
    }

    /**
     * Validate one stored overrides map, keeping only known advanced tokens and
     * values that are safe to emit.
     * @param {unknown} candidate - Parsed overrides from storage.
     * @param {boolean} shared - True for the shared token map.
     * @returns {Record<string, string>} A safe overrides map.
     */
    function sanitizeOverrides(candidate, shared) {
        const source = candidate !== null && typeof candidate === 'object' ? candidate : {};
        const overrides = {};

        for (const token of TOKENS) {
            if (token.shared !== shared) {
                continue;
            }

            const value = normalizeTokenValue(source[token.name]);

            if (value !== null) {
                overrides[token.name] = value;
            }
        }

        return overrides;
    }

    /**
     * Validate a stored state before it reaches the controls, so stale or edited
     * storage cannot produce an out of range slider or an unknown font stack.
     * Numeric controls are accepted only as finite numbers: `null`, an empty
     * string, `true`, and other coercible values fall back to the framework
     * default instead of becoming zero or the slider minimum.
     * @param {unknown} candidate - Parsed storage value.
     * @param {PlaygroundDefaults} frameworkDefaults - Defaults read from the stylesheet.
     * @param {{radius: {min: number, max: number}, fontSize: {min: number, max: number}, fonts: string[]}} bounds - Allowed control values.
     * @returns {PlaygroundState} A state that is safe to apply.
     */
    function sanitizeState(candidate, frameworkDefaults, bounds) {
        const fallback = createState(frameworkDefaults);
        const source = candidate !== null && typeof candidate === 'object' ? candidate : {};
        const radius = isFiniteNumber(source.radius) ? source.radius : null;
        const fontSize = isFiniteNumber(source.fontSize) ? source.fontSize : null;

        return {
            colors: sanitizePalette(source.colors, fallback.colors),
            darkColors: sanitizePalette(source.darkColors, fallback.darkColors),
            advanced: sanitizeOverrides(source.advanced, false),
            darkAdvanced: sanitizeOverrides(source.darkAdvanced, false),
            sharedAdvanced: sanitizeOverrides(source.sharedAdvanced, true),
            radius:
                radius === null
                    ? fallback.radius
                    : clamp(Math.round(radius), bounds.radius.min, bounds.radius.max),
            fontSize:
                fontSize === null
                    ? fallback.fontSize
                    : clamp(Math.round(fontSize), bounds.fontSize.min, bounds.fontSize.max),
            fontFamily: bounds.fonts.includes(source.fontFamily) ? source.fontFamily : '',
        };
    }

    /**
     * Build the fill, on-color, and text tint for one brand color, mirroring the
     * framework recipe: the text tint mixes toward black in light and toward
     * white in dark, and a zero mix reuses the fill directly.
     * @param {{name: string, lightMix: number, darkMix: number}} token - Brand token definition.
     * @param {string} value - Chosen fill as `#rrggbb`.
     * @param {'light' | 'dark'} theme - Scope the declarations belong to.
     * @returns {TokenDeclaration[]} The three declarations that keep variants legible.
     */
    function buildBrandDeclarations(token, value, theme) {
        const mix = theme === 'dark' ? token.darkMix : token.lightMix;
        const ink = theme === 'dark' ? 'white' : 'black';
        const name = `--r-color-${token.name}`;
        const text = mix === 0 ? `var(${name})` : `color-mix(in srgb, var(${name}), ${ink} ${mix}%)`;

        return [
            { name, value },
            { name: `${name}-on`, value: readableInk(value) },
            { name: `${name}-text`, value: text },
        ];
    }

    /**
     * Build the framework's own declarations for one brand in one scope, used when
     * the other scope changed and this one has to re-assert its default so the
     * changed scope's rule cannot leak in. The on-color and text tint come from the
     * declared defaults when the catalog provides them, because re-deriving them
     * with the playground recipe could change a value the user never edited.
     * @param {{name: string}} token - Brand token definition.
     * @param {PlaygroundDefaults} frameworkDefaults - Defaults read from the stylesheet.
     * @param {'light' | 'dark'} scope - Scope whose defaults to emit.
     * @returns {TokenDeclaration[]} The framework fill triple.
     */
    function buildBrandDefaults(token, frameworkDefaults, scope) {
        const name = `--r-color-${token.name}`;
        const fill = scope === 'dark' ? frameworkDefaults.darkColors[token.name] : frameworkDefaults.colors[token.name];
        const declared = scope === 'dark' ? frameworkDefaults.advanced.dark : frameworkDefaults.advanced.light;

        return [
            { name, value: fill },
            { name: `${name}-on`, value: declared[`${name}-on`] || readableInk(fill) },
            { name: `${name}-text`, value: declared[`${name}-text`] || `var(${name})` },
        ];
    }

    /**
     * Compare a state with the framework defaults and collect only the
     * declarations that need to be emitted, grouped by the scope that applies
     * them. Structural tokens are shared by every scope in the framework.
     * @param {PlaygroundState} state - Values chosen in the controls.
     * @param {PlaygroundDefaults} frameworkDefaults - Defaults read from the stylesheet.
     * @returns {TokenBlocks} Declarations to emit and their distinct token count.
     */
    function buildDeclarations(state, frameworkDefaults) {
        const blocks = { shared: [], light: [], dark: [], changed: { light: false, dark: false }, count: 0 };

        if (state.radius !== frameworkDefaults.radius) {
            blocks.shared.push({ name: '--r-global-border-radius', value: `${state.radius}px` });
        }

        if (state.fontSize !== frameworkDefaults.fontSize) {
            blocks.shared.push({ name: '--r-global-base-font-size', value: `${state.fontSize}px` });
        }

        if (state.fontFamily !== '') {
            blocks.shared.push({ name: '--r-global-base-font', value: state.fontFamily });
        }

        for (const token of TOKENS) {
            if (!token.shared) {
                continue;
            }

            const value = state.sharedAdvanced[token.name];
            const fallback = tokenDefault(token, frameworkDefaults, 'light');

            if (value !== undefined && value !== fallback) {
                blocks.shared.push({ name: token.name, value });
            }
        }

        // A scope declaration has to be written to both scope rules, because a
        // light declaration on `:root` also matches an explicit dark page and the
        // framework does not redeclare every token in the dark block. Re-declaring
        // the unchanged scope with its own defaults keeps the palettes independent.
        for (const token of BRAND_TOKENS) {
            const light = state.colors[token.name];
            const dark = state.darkColors[token.name];
            const changedLight = light !== frameworkDefaults.colors[token.name];
            const changedDark = dark !== frameworkDefaults.darkColors[token.name];

            if (!changedLight && !changedDark) {
                continue;
            }

            const lightDeclarations = changedLight
                ? buildBrandDeclarations(token, light, 'light')
                : buildBrandDefaults(token, frameworkDefaults, 'light');
            const darkDeclarations = changedDark
                ? buildBrandDeclarations(token, dark, 'dark')
                : buildBrandDefaults(token, frameworkDefaults, 'dark');

            blocks.light.push(...lightDeclarations);
            blocks.dark.push(...darkDeclarations);

            blocks.changed.light = blocks.changed.light || changedLight;
            blocks.changed.dark = blocks.changed.dark || changedDark;
        }
        for (const token of TOKENS) {
            if (token.shared) {
                continue;
            }

            const light = state.advanced[token.name];
            const dark = state.darkAdvanced[token.name];
            const lightDefault = tokenDefault(token, frameworkDefaults, 'light');
            const darkDefault = tokenDefault(token, frameworkDefaults, 'dark');
            const changedLight = light !== undefined && light !== lightDefault;
            const changedDark = dark !== undefined && dark !== darkDefault;

            if (!changedLight && !changedDark) {
                continue;
            }

            const lightValue = light === undefined ? lightDefault : light;
            const darkValue = dark === undefined ? darkDefault : dark;

            if (lightValue !== '') {
                blocks.light.push({ name: token.name, value: lightValue });
            }

            if (darkValue !== '') {
                blocks.dark.push({ name: token.name, value: darkValue });
            }

            blocks.changed.light = blocks.changed.light || changedLight;
            blocks.changed.dark = blocks.changed.dark || changedDark;
        }

        const declarations = [...blocks.shared, ...blocks.light, ...blocks.dark];

        blocks.count = new Set(declarations.map((declaration) => declaration.name)).size;

        return blocks;
    }

    /**
     * Render one CSS rule with four-space indented declarations, matching the
     * formatting used in the docs code samples.
     * @param {string} selector - Selector list, one selector per line when it wraps.
     * @param {TokenDeclaration[]} declarations - Declarations for the rule.
     * @param {string} [indent] - Leading indentation, used inside a media query.
     * @returns {string} The rendered rule.
     */
    function renderRule(selector, declarations, indent) {
        const prefix = indent || '';
        const selectors = selector
            .split('\n')
            .map((line) => `${prefix}${line}`)
            .join('\n');
        const body = declarations
            .map((declaration) => `${prefix}    ${declaration.name}: ${declaration.value};`)
            .join('\n');

        return `${selectors} {\n${body}\n${prefix}}`;
    }

    /**
     * Render the CSS offered for copying, using the same scope selectors the
     * framework emits and skipping every empty block. Dark declarations are
     * repeated in the automatic dark media query, so an operating system dark
     * preference gets the same result as the explicit class. The result ends with
     * a trailing newline so it pastes cleanly into a stylesheet.
     * @param {TokenBlocks} blocks - Declarations to emit.
     * @returns {string} The generated stylesheet, or an empty string when nothing changed.
     */
    function renderOverrideCss(blocks) {
        const sections = [];

        if (blocks.shared.length > 0) {
            sections.push(renderRule(':root,\n.theme-light,\n.theme-dark', blocks.shared));
        }

        if (blocks.light.length > 0) {
            sections.push(renderRule(':root,\n.theme-light', blocks.light));
        }

        if (blocks.dark.length > 0) {
            const darkRule = renderRule(':root:not(.theme-light)', blocks.dark, '    ');

            sections.push(renderRule('.theme-dark', blocks.dark));
            sections.push(`@media (prefers-color-scheme: dark) {\n${darkRule}\n}`);
        }

        if (sections.length === 0) {
            return '';
        }

        return `/* roolith theme overrides */\n\n${sections.join('\n\n')}\n`;
    }

    /**
     * Render the stylesheet applied to the preview subtree only. The preview root
     * carries an explicit `theme-light` or `theme-dark` class, so the framework
     * itself re-declares that scope's palette and every token derived from it on
     * the preview element. Custom properties are then resolved against the values
     * declared on that element, which means the preview needs no alias list: only
     * the declarations that differ from the framework scope defaults are emitted.
     * Structural declarations are shared by both scopes and always included.
     * @param {TokenBlocks} blocks - Declarations to emit.
     * @param {'light' | 'dark'} scope - Scope the preview root is showing.
     * @param {string} selector - Selector matching the preview root in that scope.
     * @returns {string} The scoped preview stylesheet, empty when nothing changed.
     */
    function renderPreviewCss(blocks, scope, selector) {
        const declarations = [...blocks.shared, ...(scope === 'dark' ? blocks.dark : blocks.light)];

        if (declarations.length === 0) {
            return '';
        }

        return renderRule(selector, declarations);
    }

    window.roolithPlaygroundTheme = {
        normalizeHex,
        normalizeColor,
        normalizeTokenValue,
        readableInk,
        readDefaults,
        createState,
        sanitizeState,
        widenRange,
        listTokens,
        tokenDefault,
        buildDeclarations,
        renderOverrideCss,
        renderPreviewCss,
    };
})();
