/**
 * Theme playground page controller: keeps the control state in storage and
 * paints the generated CSS onto the page.
 *
 * The playground is three classic scripts loaded with `defer`, in this order:
 * `/playground-theme.js` measures the framework defaults and renders the CSS,
 * `/playground-controls.js` owns the markup contract and bounds reconciliation,
 * and this file owns state, storage, events, rendering, and the status line. The
 * controller consumes `window.roolithPlaygroundTheme` and
 * `window.roolithPlaygroundControls`, and it uses the shared `copyText` and
 * `flashCopied` helpers declared by `doc.js`. Nothing here is exposed globally.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'roolith-playground';

    const EMPTY_STATUS = 'Nothing to copy yet. Change a control to generate theme overrides.';

    const EMPTY_CSS = `/* ${EMPTY_STATUS} */`;

    const STATUS_DURATION = 2400;

    const PREVIEW_SELECTOR = '.doc-playground-preview';

    const DARK_PREVIEW_SELECTOR = 'html.theme-dark .doc-playground-preview';

    /** @type {object | null} */
    let model = null;

    /** @type {object | null} */
    let controls = null;

    /** @type {object | null} */
    let elements = null;

    /** @type {object | null} */
    let defaults = null;

    /** @type {object | null} */
    let state = null;

    let overrideCount = 0;

    let statusTimer = 0;

    /**
     * Restore the saved control state, falling back to the framework defaults
     * when storage is unavailable or holds an unreadable payload.
     * @param {object} bounds - Allowed control values.
     * @returns {object} The state to start from.
     */
    function loadState(bounds) {
        let stored = null;

        try {
            stored = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            /* storage unavailable, start from the framework defaults */
            return model.createState(defaults);
        }

        if (stored === null) {
            return model.createState(defaults);
        }

        try {
            return model.sanitizeState(JSON.parse(stored), defaults, bounds);
        } catch (error) {
            /* unreadable payload, start from the framework defaults */
            return model.createState(defaults);
        }
    }

    /**
     * Persist the state and repaint after a control change. Storage failures stay
     * silent so a blocked or full store still leaves the playground usable.
     * @returns {void}
     */
    function commit() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            /* storage unavailable, the tweaks still apply for this visit */
        }

        render();
    }

    /**
     * Describe the number of overridden tokens for the status line.
     * @param {number} count - Overridden token count.
     * @returns {string} A short sentence.
     */
    function describeCount(count) {
        if (count === 0) {
            return EMPTY_STATUS;
        }

        return `${count} token${count === 1 ? '' : 's'} overridden.`;
    }

    /**
     * Write the live status message, skipping identical writes so dragging a
     * slider does not repeat an announcement.
     * @param {string} message - Message to show.
     * @returns {void}
     */
    function setStatus(message) {
        if (elements.status.textContent === message) {
            return;
        }

        elements.status.textContent = message;
    }

    /**
     * Show a temporary message such as copy feedback, then restore the token
     * summary after a short delay.
     * @param {string} message - Message to show.
     * @returns {void}
     */
    function announceTemporary(message) {
        window.clearTimeout(statusTimer);
        setStatus(message);
        statusTimer = window.setTimeout(() => {
            statusTimer = 0;
            setStatus(describeCount(overrideCount));
        }, STATUS_DURATION);
    }

    /**
     * Write the state into every control and readout, used on load, on reset, and
     * whenever a hex field is normalized after editing.
     * @returns {void}
     */
    function syncControls() {
        for (const name of Object.keys(elements.colors)) {
            elements.colors[name].value = state.colors[name];
            elements.hex[name].value = state.colors[name];
        }

        elements.radius.value = String(state.radius);
        elements.fontSize.value = String(state.fontSize);
        elements.fontFamily.value = state.fontFamily;
        elements.radiusValue.textContent = `${state.radius}px`;
        elements.fontSizeValue.textContent = `${state.fontSize}px`;
    }

    /**
     * Re-run syntax highlighting on the generated block after its text changed.
     * The first paint is left to the site-wide highlight pass: an element that has no
     * `data-highlighted` marker yet is returned to untouched, so the shared
     * `highlightAll()` on DOMContentLoaded colors it normally. Every later render
     * clears the marker highlight.js uses to skip an element, then highlights the
     * fresh text, which would otherwise log a "previously highlighted" message.
     * @returns {void}
     */
    function highlightCss() {
        if (!window.hljs || typeof window.hljs.highlightElement !== 'function') {
            return;
        }

        if (!elements.css.hasAttribute('data-highlighted')) {
            return;
        }

        elements.css.removeAttribute('data-highlighted');
        window.hljs.highlightElement(elements.css);
    }

    /**
     * Repaint the preview, the generated CSS, the readouts, and the status line
     * from the current state. Control values are left alone so a field being
     * typed in is not rewritten.
     * @returns {void}
     */
    function render() {
        const blocks = model.buildDeclarations(state, defaults);

        overrideCount = blocks.count;
        elements.previewStyle.textContent = model.renderPreviewCss(
            blocks,
            PREVIEW_SELECTOR,
            DARK_PREVIEW_SELECTOR,
        );
        elements.css.textContent = model.renderOverrideCss(blocks) || EMPTY_CSS;
        highlightCss();
        elements.count.textContent = `${overrideCount} token${overrideCount === 1 ? '' : 's'}`;
        elements.copy.disabled = overrideCount === 0;
        elements.radiusValue.textContent = `${state.radius}px`;
        elements.fontSizeValue.textContent = `${state.fontSize}px`;

        window.clearTimeout(statusTimer);
        statusTimer = 0;
        setStatus(describeCount(overrideCount));
    }

    /**
     * Store a validated brand fill and repaint.
     * @param {string} name - Brand token name, such as `primary`.
     * @param {string} value - Hex value from a control.
     * @returns {void}
     */
    function setBrandColor(name, value) {
        const hex = model.normalizeHex(value);

        if (hex === null || !Object.prototype.hasOwnProperty.call(state.colors, name)) {
            return;
        }

        state.colors[name] = hex;
        commit();
    }

    /**
     * Handle live input from the delegated controls. The color picker, the sliders,
     * and the font select commit on every input event. A hex field commits only once
     * its value is a complete color, so a half typed code never reaches the preview:
     * any value `normalizeHex` accepts applies here, with or without the leading
     * hash, and an incomplete value waits for the change event.
     * @param {Event} event - The input event.
     * @returns {void}
     */
    function handleInput(event) {
        const target = event.target;

        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        const colorName = target.getAttribute('data-doc-playground-color');

        if (colorName !== null) {
            setBrandColor(colorName, target.value);
            elements.hex[colorName].value = state.colors[colorName];
            return;
        }

        const hexName = target.getAttribute('data-doc-playground-hex');

        if (hexName !== null) {
            if (model.normalizeHex(target.value) !== null) {
                setBrandColor(hexName, target.value);
                elements.colors[hexName].value = state.colors[hexName];
            }

            return;
        }

        const rangeName = target.getAttribute('data-doc-playground-range');
        const rangeValue = Number.parseInt(target.value, 10);

        if (rangeName === null || !Number.isFinite(rangeValue)) {
            return;
        }

        if (rangeName === 'radius') {
            state.radius = rangeValue;
        } else if (rangeName === 'fontSize') {
            state.fontSize = rangeValue;
        } else {
            return;
        }

        commit();
    }

    /**
     * Apply the settled value of a control. A hex field is normalized on change, so
     * an incomplete code is completed or rejected here even though the input path
     * applies any value `normalizeHex` accepts; the font select applies immediately.
     * @param {Event} event - The change event.
     * @returns {void}
     */
    function handleChange(event) {
        const target = event.target;

        if (target instanceof HTMLSelectElement && target.hasAttribute('data-doc-playground-font')) {
            state.fontFamily = target.value;
            commit();
            return;
        }

        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        const hexName = target.getAttribute('data-doc-playground-hex');

        if (hexName === null) {
            return;
        }

        setBrandColor(hexName, target.value);
        syncControls();
    }

    /**
     * Flash the copy button through the shared docs helper. A flash that is
     * already running is left alone, because the helper restores the label it
     * captured and a second capture would restore the wrong text.
     * @param {HTMLButtonElement} button - The copy button.
     * @returns {void}
     */
    function flashCopyButton(button) {
        if (button.classList.contains('is-copied')) {
            return;
        }

        window.flashCopied(button);
    }

    /**
     * Copy the generated stylesheet that is on screen and announce the result.
     * Depends on `copyText` and `flashCopied` from `doc.js`.
     * @returns {Promise<void>} Resolves once the clipboard attempt finishes.
     */
    async function handleCopy() {
        if (overrideCount === 0) {
            return;
        }

        const copied = await window.copyText(elements.css.textContent);

        if (!copied) {
            setStatus('Copy failed. Select the CSS below and copy it manually.');
            return;
        }

        flashCopyButton(elements.copy);
        announceTemporary(`Copied ${overrideCount} token${overrideCount === 1 ? '' : 's'}.`);
    }

    /**
     * Restore every framework default, drop the saved state, and announce it.
     * @returns {void}
     */
    function handleReset() {
        state = model.createState(defaults);

        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            /* storage unavailable, the reset still applies for this visit */
        }

        syncControls();
        render();
        announceTemporary('Defaults restored.');
    }

    /**
     * Start the playground: bind the controls, read the framework defaults, restore
     * the saved state, and paint the first frame. A page with missing or invalid
     * markup is left inert with one console error instead of a half-initialized
     * playground.
     * @param {HTMLElement} root - Playground root element.
     * @returns {void}
     */
    function init(root) {
        const bound = controls.bind(root);

        if (bound === null) {
            return;
        }

        elements = bound.elements;

        defaults = model.readDefaults();

        if (!controls.brandsAreKnown(elements, defaults)) {
            return;
        }

        // A visitor default font size can fall outside the declared slider range, so
        // widen the range instead of clamping the default, which would fake a diff.
        controls.fitRanges(elements, bound.bounds, defaults, model);

        state = loadState(bound.bounds);

        // The first option means "framework default", so name the stack it keeps.
        if (elements.fontFamily.options.length > 0) {
            elements.fontFamily.options[0].textContent = `Framework default (${defaults.fontFamily})`;
        }

        elements.previewStyle = document.createElement('style');
        document.head.appendChild(elements.previewStyle);

        root.addEventListener('input', handleInput);
        root.addEventListener('change', handleChange);
        elements.copy.addEventListener('click', handleCopy);
        elements.reset.addEventListener('click', handleReset);

        syncControls();
        render();
    }

    const root = document.querySelector('[data-doc-playground]');

    if (root === null) {
        console.error('Theme playground: missing [data-doc-playground]');
    } else if (!window.roolithPlaygroundTheme) {
        console.error('Theme playground: missing window.roolithPlaygroundTheme');
    } else if (!window.roolithPlaygroundControls) {
        console.error('Theme playground: missing window.roolithPlaygroundControls');
    } else {
        model = window.roolithPlaygroundTheme;
        controls = window.roolithPlaygroundControls;
        init(root);
    }
})();
