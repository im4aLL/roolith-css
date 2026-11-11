/**
 * Theme model for the docs theme playground: reads the framework token defaults
 * from the loaded stylesheet, validates control state, and renders override CSS
 * with the same light and dark scope selectors the framework emits.
 *
 * This is a classic script loaded with `defer` before `/playground-controls.js`
 * and `/playground.js`. It publishes one namespace,
 * `window.roolithPlaygroundTheme`, because the page controller is a separate
 * classic script and both share the global scope. The model holds no state and
 * touches the document only to measure token defaults.
 */
(function () {
    'use strict';

    const BRAND_TOKENS = [
        { name: 'primary', lightMix: 0, darkMix: 34 },
        { name: 'secondary', lightMix: 8, darkMix: 2 },
        { name: 'info', lightMix: 10, darkMix: 0 },
        { name: 'success', lightMix: 6, darkMix: 28 },
        { name: 'warning', lightMix: 10, darkMix: 0 },
        { name: 'danger', lightMix: 6, darkMix: 32 },
        { name: 'link', lightMix: 8, darkMix: 0 },
    ];

    const TOKEN_FALLBACKS = {
        '--r-color-primary': '#4a5cd0',
        '--r-color-secondary': '#7b6aa6',
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
     * Alias tokens the framework declares at theme scope and the preview consumes,
     * repeated inside the preview subtree.
     *
     * Custom properties are substituted where they are declared, so every framework
     * token the preview consumes that is derived from a tuned token must be listed
     * here, or the preview keeps the page value while the copied CSS moves. The list
     * is exactly that set: no more and no less, meaning nothing the preview does not
     * consume and no consumed, tuned token left out. Adding a component to the
     * preview markup means auditing its tokens against this list.
     * A component token that reads a private framework token has to repeat that
     * private recipe, because the private value is resolved where the framework
     * declares it and would otherwise keep the page fill; `--r-comment-highlight-color`
     * mirrors `--_r-comment-highlight` for that reason, so `renderPreviewCss` also
     * cancels its light recipe in the dark scope.
     */
    const PREVIEW_ALIASES = [
        { name: '--r-accent', value: 'var(--r-color-primary)' },
        { name: '--r-accent-on', value: 'var(--r-color-primary-on)' },
        { name: '--r-link', value: 'var(--r-color-link)' },
        { name: '--r-focus-ring-color', value: 'var(--r-link)' },
        { name: '--r-form-input-hover-border-color', value: 'var(--r-link)' },
        { name: '--r-form-input-focus-border-color', value: 'var(--r-accent)' },
        { name: '--r-pagination-item-active-background-color', value: 'var(--r-accent)' },
        { name: '--r-pagination-item-active-color', value: 'var(--r-accent-on)' },
        { name: '--r-tab-active-color', value: 'var(--r-accent)' },
        {
            name: '--r-comment-highlight-color',
            value: 'color-mix(in srgb, var(--r-color-primary) 20%, var(--r-surface-page))',
        },
        { name: '--r-button-radius', value: 'var(--r-global-border-radius)' },
        { name: '--r-card-radius', value: 'var(--r-global-border-radius)' },
        { name: '--r-form-input-radius', value: 'var(--r-global-border-radius)' },
        { name: '--r-img-radius', value: 'var(--r-global-border-radius)' },
        { name: '--r-message-radius', value: 'var(--r-global-border-radius)' },
        { name: '--r-pagination-item-border-radius', value: 'var(--r-global-border-radius)' },
    ];

    /**
     * One custom property declaration in a generated rule.
     * @typedef {object} TokenDeclaration
     * @property {string} name - Custom property name.
     * @property {string} value - Custom property value.
     */

    /**
     * The dark value of the one alias whose framework recipe differs by theme. The
     * dark scope keeps this neutral grey, and the copied CSS never overrides it, so
     * the preview has to reset the light recipe there.
     * @type {TokenDeclaration}
     */
    const DARK_COMMENT_RESET = { name: '--r-comment-highlight-color', value: 'var(--r-color-neutral-300)' };

    /**
     * Framework defaults read from the loaded stylesheet.
     * @typedef {object} PlaygroundDefaults
     * @property {Record<string, string>} colors - Brand fills in the light scope.
     * @property {Record<string, string>} darkColors - Brand fills in the dark scope.
     * @property {number} radius - Shared border radius in pixels.
     * @property {number} fontSize - Shared root font size in pixels.
     * @property {string} fontFamily - Shared font stack.
     */

    /**
     * Values currently held by the playground controls.
     * @typedef {object} PlaygroundState
     * @property {Record<string, string>} colors - Chosen brand fills.
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

            colors[token.name] = normalizeHex(light[name]) || TOKEN_FALLBACKS[name];
            darkColors[token.name] = normalizeHex(dark[name]) || TOKEN_FALLBACKS[name];
        }

        return {
            colors,
            darkColors,
            radius: Math.round(resolvePx(light['--r-global-border-radius'])),
            fontSize: Math.round(resolvePx(light['--r-global-base-font-size'])),
            fontFamily: light['--r-global-base-font'],
        };
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
            radius: frameworkDefaults.radius,
            fontSize: frameworkDefaults.fontSize,
            fontFamily: '',
        };
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
        const sourceColors = source.colors !== null && typeof source.colors === 'object' ? source.colors : {};
        const colors = { ...fallback.colors };
        const radius = isFiniteNumber(source.radius) ? source.radius : null;
        const fontSize = isFiniteNumber(source.fontSize) ? source.fontSize : null;

        for (const token of BRAND_TOKENS) {
            const stored = sourceColors[token.name];
            const hex = typeof stored === 'string' ? normalizeHex(stored) : null;

            if (hex !== null) {
                colors[token.name] = hex;
            }
        }

        return {
            colors,
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
     * Compare a state with the framework defaults and collect only the
     * declarations that need to be emitted, grouped by the scope that applies
     * them. Structural tokens are shared by every scope in the framework.
     * @param {PlaygroundState} state - Values chosen in the controls.
     * @param {PlaygroundDefaults} frameworkDefaults - Defaults read from the stylesheet.
     * @returns {TokenBlocks} Declarations to emit and their distinct token count.
     */
    function buildDeclarations(state, frameworkDefaults) {
        const blocks = { shared: [], light: [], dark: [], count: 0 };

        if (state.radius !== frameworkDefaults.radius) {
            blocks.shared.push({ name: '--r-global-border-radius', value: `${state.radius}px` });
        }

        if (state.fontSize !== frameworkDefaults.fontSize) {
            blocks.shared.push({ name: '--r-global-base-font-size', value: `${state.fontSize}px` });
        }

        if (state.fontFamily !== '') {
            blocks.shared.push({ name: '--r-global-base-font', value: state.fontFamily });
        }

        blocks.count = blocks.shared.length;

        for (const token of BRAND_TOKENS) {
            const value = state.colors[token.name];
            const changedLight = value !== frameworkDefaults.colors[token.name];
            const changedDark = value !== frameworkDefaults.darkColors[token.name];

            if (changedLight) {
                blocks.light.push(...buildBrandDeclarations(token, value, 'light'));
            }

            if (changedDark) {
                blocks.dark.push(...buildBrandDeclarations(token, value, 'dark'));
            }

            if (changedLight || changedDark) {
                blocks.count += 3;
            }
        }

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
     * Render the stylesheet applied to a preview subtree only. The light and
     * structural declarations share one rule, the dark scope is a descendant
     * rule, and the alias tokens the framework declares at theme scope are
     * repeated here so the preview resolves them against the local values.
     *
     * The dark rule is emitted whenever the base rule is, even with no dark
     * declarations, because `--r-comment-highlight-color` is the one alias whose
     * framework recipe differs by theme: the light recipe mixes the primary fill
     * while the dark scope keeps a neutral grey that the copied CSS never
     * overrides. Without the paired reset the base alias would tint the
     * highlighted comment in dark mode while a real page keeps it grey.
     * @param {TokenBlocks} blocks - Declarations to emit.
     * @param {string} lightSelector - Selector for the preview root in the light scope.
     * @param {string} darkSelector - Selector for the preview root in the dark scope.
     * @returns {string} The scoped preview stylesheet, empty when nothing changed.
     */
    function renderPreviewCss(blocks, lightSelector, darkSelector) {
        if (blocks.shared.length === 0 && blocks.light.length === 0 && blocks.dark.length === 0) {
            return '';
        }

        const lightDeclarations = [...PREVIEW_ALIASES, ...blocks.shared, ...blocks.light];
        const darkDeclarations = [DARK_COMMENT_RESET, ...blocks.dark];

        return [renderRule(lightSelector, lightDeclarations), renderRule(darkSelector, darkDeclarations)].join('\n\n');
    }

    window.roolithPlaygroundTheme = {
        normalizeHex,
        readableInk,
        readDefaults,
        createState,
        sanitizeState,
        widenRange,
        buildDeclarations,
        renderOverrideCss,
        renderPreviewCss,
    };
})();
