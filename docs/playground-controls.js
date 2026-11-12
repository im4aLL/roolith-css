/**
 * Theme playground control contract: binds the playground markup, reads the
 * allowed control values, and reconciles the slider ranges with the measured
 * framework defaults.
 *
 * This is a classic script loaded with `defer` between `/playground-theme.js`
 * and `/playground.js`. It publishes one namespace,
 * `window.roolithPlaygroundControls`, because the page controller is a separate
 * classic script and both share the global scope. This module owns the element
 * map and hands it to the controller; state, storage, events, rendering, and the
 * status line stay in the controller.
 */
(function () {
    'use strict';

    const REQUIRED_SELECTORS = {
        css: '[data-doc-playground-css]',
        count: '[data-doc-playground-count]',
        status: '[data-doc-playground-status]',
        reset: '[data-doc-playground-reset]',
        preview: '.doc-playground-preview',
        fontFamily: '[data-doc-playground-font]',
        radius: '[data-doc-playground-range="radius"]',
        fontSize: '[data-doc-playground-range="fontSize"]',
        radiusValue: '[data-doc-playground-radius-value]',
        fontSizeValue: '[data-doc-playground-font-size-value]',
        advancedToggle: '[data-doc-playground-advanced-toggle]',
        advancedPanel: '[data-doc-playground-advanced]',
        advancedLabel: '[data-doc-playground-advanced-label]',
        advancedTheme: '[data-doc-playground-advanced-theme]',
        advancedShared: '[data-doc-playground-advanced-shared]',
    };

    const SCOPES = ['light', 'dark'];

    /**
     * One slider's allowed values.
     * @typedef {object} ControlRange
     * @property {number} min - Lowest allowed value.
     * @property {number} max - Highest allowed value.
     */

    /**
     * Allowed control values read from the bound controls.
     * @typedef {object} ControlBounds
     * @property {ControlRange} radius - Allowed radius values.
     * @property {ControlRange} fontSize - Allowed font size values.
     * @property {string[]} fonts - Font stack values offered by the select.
     */

    /**
     * Bind result handed to the controller.
     * @typedef {object} BoundControls
     * @property {object} elements - Bound controls, including the `colors`, `hex`, and `scopes` groups and the `copyButtons` list.
     * @property {ControlBounds} bounds - Allowed control values.
     */

    /**
     * Query one required element, reporting the missing data attribute instead of
     * throwing so a renamed attribute cannot leave a silently broken page.
     * @param {ParentNode} root - Playground root element.
     * @param {string} selector - Data attribute selector for the element.
     * @returns {Element | null} The element, or null after logging the selector.
     */
    function queryRequired(root, selector) {
        const element = root.querySelector(selector);

        if (element === null) {
            console.error(`Theme playground: missing ${selector}`);
        }

        return element;
    }

    /**
     * Bind every required control and output, so the caller can leave the page
     * inert instead of running on a half-built DOM.
     * @param {HTMLElement} root - Playground root element.
     * @param {object} elements - Element map to fill.
     * @returns {boolean} True when every required element was found.
     */
    function bindElements(root, elements) {
        for (const [name, selector] of Object.entries(REQUIRED_SELECTORS)) {
            const element = queryRequired(root, selector);

            if (element === null) {
                return false;
            }

            elements[name] = element;
        }

        return true;
    }

    /**
     * Collect every copy button, so the controller can keep all of them in sync
     * and each one copies the same generated stylesheet.
     * @param {HTMLElement} root - Playground root element.
     * @param {object} elements - Element map to fill.
     * @returns {boolean} True when at least one copy button exists.
     */
    function bindCopyButtons(root, elements) {
        elements.copyButtons = Array.from(root.querySelectorAll('[data-doc-playground-copy]'));

        if (elements.copyButtons.length === 0) {
            console.error('Theme playground: missing [data-doc-playground-copy]');
            return false;
        }

        return true;
    }

    /**
     * Collect the brand color and hex field pairs, then confirm both controls exist
     * for every brand token so live editing cannot fail on a renamed attribute.
     * @param {HTMLElement} root - Playground root element.
     * @param {object} elements - Element map to fill.
     * @returns {boolean} True when every brand token has a color and a hex field.
     */
    function bindColorPairs(root, elements) {
        root.querySelectorAll('[data-doc-playground-color]').forEach((input) => {
            elements.colors[input.getAttribute('data-doc-playground-color')] = input;
        });

        root.querySelectorAll('[data-doc-playground-hex]').forEach((input) => {
            elements.hex[input.getAttribute('data-doc-playground-hex')] = input;
        });

        const names = new Set([...Object.keys(elements.colors), ...Object.keys(elements.hex)]);

        if (names.size === 0) {
            console.error('Theme playground: missing [data-doc-playground-color] pairs');
            return false;
        }

        for (const name of names) {
            if (elements.colors[name] === undefined) {
                console.error(`Theme playground: missing [data-doc-playground-color="${name}"]`);
                return false;
            }

            if (elements.hex[name] === undefined) {
                console.error(`Theme playground: missing [data-doc-playground-hex="${name}"]`);
                return false;
            }
        }

        return true;
    }

    /**
     * Collect the light and dark palette switches, so the controller can rely on
     * both scopes existing before it reads or writes a palette.
     * @param {HTMLElement} root - Playground root element.
     * @param {object} elements - Element map to fill.
     * @returns {boolean} True when both scopes are switched by a bound control.
     */
    function bindScopes(root, elements) {
        elements.scopes = Array.from(root.querySelectorAll('[data-doc-playground-scope]'));

        const names = new Set(elements.scopes.map((button) => button.getAttribute('data-doc-playground-scope')));

        for (const scope of SCOPES) {
            if (!names.has(scope)) {
                console.error(`Theme playground: missing [data-doc-playground-scope="${scope}"]`);
                return false;
            }
        }

        return true;
    }

    /**
     * Read the finite limits of one slider, reporting the control and the missing
     * attribute so an incomplete slider cannot leak `NaN` into the generated CSS.
     * @param {HTMLInputElement} control - Slider element.
     * @param {string} name - Slider range name, such as `radius`.
     * @returns {ControlRange | null} The limits, or null after logging the offender.
     */
    function readRange(control, name) {
        const min = Number.parseFloat(control.min);
        const max = Number.parseFloat(control.max);
        const selector = `[data-doc-playground-range="${name}"]`;

        if (!Number.isFinite(min)) {
            console.error(`Theme playground: ${selector} has no finite min`);
            return null;
        }

        if (!Number.isFinite(max)) {
            console.error(`Theme playground: ${selector} has no finite max`);
            return null;
        }

        return { min, max };
    }

    /**
     * Read the allowed range and font stack values from the bound controls so the
     * controller never duplicates the slider limits. Every parsed limit must be
     * finite, because a slider missing `min` or `max` would otherwise generate
     * `NaNpx` declarations that the browser silently drops.
     * @param {object} elements - Bound controls.
     * @returns {ControlBounds | null} Allowed control values, or null after logging the offender.
     */
    function readBounds(elements) {
        const radius = readRange(elements.radius, 'radius');
        const fontSize = readRange(elements.fontSize, 'fontSize');

        if (radius === null || fontSize === null) {
            return null;
        }

        return {
            radius,
            fontSize,
            fonts: Array.from(elements.fontFamily.options, (option) => option.value),
        };
    }

    /**
     * Bind the playground markup and read the allowed control values in one step,
     * so a missing control, an unpaired brand, or an invalid slider leaves the page
     * inert after a single named console error.
     * @param {HTMLElement} root - Playground root element.
     * @returns {BoundControls | null} The bound controls and bounds, or null after logging the offender.
     */
    function bind(root) {
        const elements = {
            colors: {},
            hex: {},
            scopes: [],
        };

        if (
            !bindElements(root, elements) ||
            !bindCopyButtons(root, elements) ||
            !bindColorPairs(root, elements) ||
            !bindScopes(root, elements)
        ) {
            return null;
        }

        const bounds = readBounds(elements);

        if (bounds === null) {
            return null;
        }

        return { elements, bounds };
    }

    /**
     * Confirm every bound brand control names a token the model can resolve, so an
     * unknown brand cannot write `undefined` into the color and hex controls.
     * @param {object} elements - Bound controls.
     * @param {{colors: Record<string, string>}} defaults - Framework defaults.
     * @returns {boolean} True when every bound brand is a model brand.
     */
    function brandsAreKnown(elements, defaults) {
        for (const name of Object.keys(elements.colors)) {
            if (!Object.prototype.hasOwnProperty.call(defaults.colors, name)) {
                console.error(`Theme playground: unknown brand [data-doc-playground-color="${name}"]`);
                return false;
            }
        }

        return true;
    }

    /**
     * Widen a slider range so a measured default stays representable, and write the
     * limits back onto the control so its thumb agrees with the readout. The range
     * math lives in the model, so widening is tested without a browser.
     * @param {ControlRange} range - Range to widen in place.
     * @param {HTMLInputElement} control - Slider bound to the range.
     * @param {number} value - Measured default that must stay inside the range.
     * @param {{widenRange: (range: ControlRange, value: number) => ControlRange}} model - Theme model.
     * @returns {void}
     */
    function fitRange(range, control, value, model) {
        const widened = model.widenRange(range, value);

        range.min = widened.min;
        range.max = widened.max;
        control.min = String(range.min);
        control.max = String(range.max);
    }

    /**
     * Widen both slider ranges, because a visitor default font size or a framework
     * radius can fall outside the declared limits and clamping would fake a diff.
     * @param {object} elements - Bound controls.
     * @param {ControlBounds} bounds - Allowed control values, widened in place.
     * @param {{radius: number, fontSize: number}} defaults - Measured framework defaults.
     * @param {{widenRange: (range: ControlRange, value: number) => ControlRange}} model - Theme model.
     * @returns {void}
     */
    function fitRanges(elements, bounds, defaults, model) {
        fitRange(bounds.radius, elements.radius, defaults.radius, model);
        fitRange(bounds.fontSize, elements.fontSize, defaults.fontSize, model);
    }

    window.roolithPlaygroundControls = {
        bind,
        brandsAreKnown,
        fitRanges,
    };
})();
