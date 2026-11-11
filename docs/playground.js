/**
 * Theme playground page controller: keeps the control state in storage and
 * paints the generated CSS onto the page.
 *
 * The playground is classic scripts loaded with `defer`, in this order:
 * `/playground-tokens.js` is the generated advanced token catalog,
 * `/playground-theme.js` measures the framework defaults and renders the CSS,
 * `/playground-controls.js` owns the markup contract and bounds reconciliation,
 * `/playground-advanced.js` builds the advanced token panel, and this file owns
 * state, storage, events, rendering, and the status line. The controller consumes
 * the namespaces the other scripts publish, and it uses the shared `copyText` and
 * `flashCopied` helpers declared by `doc.js`. Nothing here is exposed globally.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'roolith-playground';

    const EMPTY_STATUS = 'Nothing to copy yet. Change a control to generate theme overrides.';

    const EMPTY_CSS = `/* ${EMPTY_STATUS} */`;

    const STATUS_DURATION = 2400;

    const PREVIEW_SELECTOR = '.doc-playground-preview';

    const PERSIST_DELAY = 250;

    const HIGHLIGHT_DELAY = 160;

    const PALETTE_BY_SCOPE = { light: 'colors', dark: 'darkColors' };

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

    /** @type {object | null} */
    let advanced = null;

    /** @type {Map<string, object> | null} */
    let advancedView = null;

    /** @type {Map<string, object>} */
    let tokensByName = new Map();

    let activeScope = 'light';

    let advancedOpen = false;

    let advancedTimer = 0;

    let overrideCount = 0;

    let statusTimer = 0;

    let renderFrame = 0;

    let persistTimer = 0;

    let highlightTimer = 0;

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
     * Persist the current state. Storage failures stay silent so a blocked or full
     * store still leaves the playground usable for this visit.
     * @returns {void}
     */
    function persist() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            /* storage unavailable, the tweaks still apply for this visit */
        }
    }

    /**
     * Save after a short quiet period, so dragging a slider or the native color
     * picker does not write storage on every input event.
     * @returns {void}
     */
    function schedulePersist() {
        window.clearTimeout(persistTimer);
        persistTimer = window.setTimeout(() => {
            persistTimer = 0;
            persist();
        }, PERSIST_DELAY);
    }

    /**
     * Write a pending save immediately, so a value edited just before the page is
     * left is not lost.
     * @returns {void}
     */
    function flushPersist() {
        if (persistTimer === 0) {
            return;
        }

        window.clearTimeout(persistTimer);
        persistTimer = 0;
        persist();
    }

    /**
     * Coalesce input events into one paint per animation frame.
     * @returns {void}
     */
    function scheduleRender() {
        if (renderFrame !== 0) {
            return;
        }

        renderFrame = window.requestAnimationFrame(() => {
            renderFrame = 0;
            render();
        });
    }

    /**
     * Cancel a queued paint, so a caller that renders immediately does not paint twice.
     * @returns {void}
     */
    function cancelRender() {
        if (renderFrame === 0) {
            return;
        }

        window.cancelAnimationFrame(renderFrame);
        renderFrame = 0;
    }

    /**
     * Apply a live edit: update storage and the preview soon, without doing either
     * work per input event.
     * @returns {void}
     */
    function update() {
        schedulePersist();
        scheduleRender();
    }

    /**
     * Apply a settled edit: save and repaint once, then let the status line settle.
     * @returns {void}
     */
    function commit() {
        window.clearTimeout(persistTimer);
        persistTimer = 0;
        persist();
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
     * Resolve the value an advanced editor should show: the stored override for
     * the active scope, or the framework default for that scope.
     * @param {string} name - Token name.
     * @returns {string} The current value.
     */
    function currentTokenValue(name) {
        const token = tokensByName.get(name);

        if (token === undefined) {
            return '';
        }

        const overrides = token.shared
            ? state.sharedAdvanced
            : activeScope === 'dark'
              ? state.darkAdvanced
              : state.advanced;

        return overrides[name] ?? model.tokenDefault(token, defaults, activeScope);
    }

    /**
     * Write the active scope into the advanced panel and repaint its fields.
     * @returns {void}
     */
    function syncAdvanced() {
        elements.advancedLabel.textContent = activeScope === 'dark' ? 'Dark scope tokens' : 'Light scope tokens';

        if (advanced === null || advancedView === null) {
            return;
        }

        advanced.sync(advancedView, currentTokenValue);
    }

    /**
     * Store a validated advanced token value, then repaint. An empty field clears
     * the override and falls back to the framework default; a value that cannot be
     * emitted safely is rejected with a status message.
     * @param {string} name - Token name from the editor.
     * @param {string} raw - Raw field value.
     * @returns {void}
     */
    function applyTokenValue(name, raw) {
        const token = tokensByName.get(name);

        if (token === undefined) {
            return;
        }

        const trimmed = raw.trim();
        const value = trimmed === '' ? null : model.normalizeTokenValue(trimmed);

        if (value === null && trimmed !== '') {
            announceTemporary('That value cannot be used in a declaration.');
            syncAdvanced();
            return;
        }

        const overrides = token.shared
            ? state.sharedAdvanced
            : activeScope === 'dark'
              ? state.darkAdvanced
              : state.advanced;

        if (value === null) {
            delete overrides[name];
        } else {
            overrides[name] = value;
        }

        commit();
        syncAdvanced();
    }

    /**
     * Show or hide the advanced panel, syncing its fields and chips when it opens.
     * @param {boolean} open - Whether the panel should be visible.
     * @returns {void}
     */
    function setAdvancedOpen(open) {
        advancedOpen = open;
        elements.advancedPanel.hidden = !open;
        elements.advancedToggle.setAttribute('aria-expanded', open ? 'true' : 'false');

        if (!open) {
            return;
        }

        syncAdvanced();

        if (advanced !== null && advancedView !== null) {
            advanced.refreshChips(advancedView, elements.preview);
        }
    }

    /**
     * Repaint the advanced color chips once the edits pause, so dragging a slider
     * does not read a computed style per token on every frame.
     * @returns {void}
     */
    function scheduleAdvancedChips() {
        window.clearTimeout(advancedTimer);
        advancedTimer = window.setTimeout(() => {
            advancedTimer = 0;

            if (advanced !== null && advancedView !== null) {
                advanced.refreshChips(advancedView, elements.preview);
            }
        }, HIGHLIGHT_DELAY);
    }

    /**
     * Write the palette of the active scope into every color control, the sliders,
     * the select, and the readouts. Used on load, on reset, on a scope switch, and
     * whenever a hex field is normalized.
     * @returns {void}
     */
    function syncControls() {
        const palette = state[PALETTE_BY_SCOPE[activeScope]];

        for (const name of Object.keys(elements.colors)) {
            elements.colors[name].value = palette[name];
            elements.hex[name].value = palette[name];
        }

        elements.radius.value = String(state.radius);
        elements.fontSize.value = String(state.fontSize);
        elements.fontFamily.value = state.fontFamily;
        elements.radiusValue.textContent = `${state.radius}px`;
        elements.fontSizeValue.textContent = `${state.fontSize}px`;
    }

    /**
     * Put the active scope on the preview element and reflect it on the switches.
     * The explicit theme class makes the preview resolve the framework scope
     * itself, so the preview stays correct whatever theme the docs page uses.
     * @param {{changed: {light: boolean, dark: boolean}}} blocks - Current diff.
     * @returns {void}
     */
    function syncScope(blocks) {
        elements.preview.classList.toggle('theme-light', activeScope === 'light');
        elements.preview.classList.toggle('theme-dark', activeScope === 'dark');

        for (const button of elements.scopes) {
            const scope = button.getAttribute('data-doc-playground-scope');

            button.setAttribute('aria-pressed', scope === activeScope ? 'true' : 'false');
            button.classList.toggle('is-modified', blocks.changed[scope] === true);
        }
    }

    /**
     * Apply the root font size to the document while a non-default value is set.
     * The framework reads this token on `html` to set the rem scale, and rem units
     * cannot be rescaled from inside a subtree, so the whole page is the only
     * honest place to show it. The inline value is dropped when the default wins.
     * @returns {void}
     */
    function applyRootFontSize() {
        if (state.fontSize === defaults.fontSize) {
            document.documentElement.style.removeProperty('--r-global-base-font-size');
            return;
        }

        document.documentElement.style.setProperty('--r-global-base-font-size', `${state.fontSize}px`);
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
     * Highlight after the edits pause, so dragging a slider does not re-highlight
     * the whole block on every frame.
     * @returns {void}
     */
    function scheduleHighlight() {
        window.clearTimeout(highlightTimer);
        highlightTimer = window.setTimeout(() => {
            highlightTimer = 0;
            highlightCss();
        }, HIGHLIGHT_DELAY);
    }

    /**
     * Repaint the preview, the generated CSS, the readouts, and the status line
     * from the current state. Control values are left alone so a field being
     * typed in is not rewritten.
     * @returns {void}
     */
    function render() {
        cancelRender();

        const blocks = model.buildDeclarations(state, defaults);
        const selector = `${PREVIEW_SELECTOR}.theme-${activeScope}`;

        overrideCount = blocks.count;
        elements.previewStyle.textContent = model.renderPreviewCss(blocks, activeScope, selector);
        elements.css.textContent = model.renderOverrideCss(blocks) || EMPTY_CSS;
        elements.count.textContent = `${overrideCount} token${overrideCount === 1 ? '' : 's'}`;
        elements.copy.disabled = overrideCount === 0;
        elements.reset.disabled = overrideCount === 0;
        elements.radiusValue.textContent = `${state.radius}px`;
        elements.fontSizeValue.textContent = `${state.fontSize}px`;

        applyRootFontSize();
        syncScope(blocks);
        scheduleHighlight();

        if (advancedOpen) {
            scheduleAdvancedChips();
        }

        window.clearTimeout(statusTimer);
        statusTimer = 0;
        setStatus(describeCount(overrideCount));
    }

    /**
     * Store a normalized fill in the active palette when the name is a model brand.
     * @param {string} name - Brand token name, such as `primary`.
     * @param {string} hex - Normalized fill.
     * @returns {boolean} True when the fill was stored.
     */
    function storeBrandColor(name, hex) {
        const palette = state[PALETTE_BY_SCOPE[activeScope]];

        if (!Object.prototype.hasOwnProperty.call(palette, name)) {
            return false;
        }

        palette[name] = hex;

        return true;
    }

    /**
     * Store a validated brand fill in the active palette and repaint soon.
     * @param {string} name - Brand token name, such as `primary`.
     * @param {string} value - Hex value from a control.
     * @returns {void}
     */
    function setBrandColor(name, value) {
        const hex = model.normalizeHex(value);

        if (hex === null || !storeBrandColor(name, hex)) {
            return;
        }

        update();
    }

    /**
     * Handle live input from the delegated controls. The color picker, the sliders,
     * and the font select update on every input event. A hex field updates only once
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
            elements.hex[colorName].value = state[PALETTE_BY_SCOPE[activeScope]][colorName];
            return;
        }

        const hexName = target.getAttribute('data-doc-playground-hex');

        if (hexName !== null) {
            if (model.normalizeHex(target.value) !== null) {
                setBrandColor(hexName, target.value);
                elements.colors[hexName].value = state[PALETTE_BY_SCOPE[activeScope]][hexName];
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

        update();
    }

    /**
     * Apply the settled value of a control. A hex field is normalized on change, so
     * an incomplete code is completed, rejected, or explained here even though the
     * input path applies any value `normalizeHex` accepts; the font select applies
     * immediately.
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

        if (target.hasAttribute('data-doc-playground-token')) {
            applyTokenValue(target.getAttribute('data-doc-playground-token'), target.value);
            return;
        }

        if (target.hasAttribute('data-doc-playground-hex')) {
            const hexName = target.getAttribute('data-doc-playground-hex');
            const hex = model.normalizeHex(target.value);

            if (hex === null || !storeBrandColor(hexName, hex)) {
                if (target.value.trim() !== '') {
                    announceTemporary('That is not a hex color. Use #rgb or #rrggbb.');
                }

                syncControls();
                return;
            }

            commit();
            syncControls();
            return;
        }

        commit();
    }

    /**
     * Switch which palette the color controls edit and which scope the preview
     * shows. The choice is a view preference, so it is not part of the saved state.
     * @param {string} scope - Scope name, `light` or `dark`.
     * @returns {void}
     */
    function setScope(scope) {
        if (activeScope === scope || !Object.prototype.hasOwnProperty.call(PALETTE_BY_SCOPE, scope)) {
            return;
        }

        activeScope = scope;
        syncControls();
        syncAdvanced();
        render();
    }

    /**
     * Handle clicks on the scope switches.
     * @param {Event} event - The click event.
     * @returns {void}
     */
    function handleClick(event) {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        if (target.closest('[data-doc-playground-advanced-toggle]') !== null) {
            setAdvancedOpen(!advancedOpen);
            return;
        }

        const scopeButton = target.closest('[data-doc-playground-scope]');

        if (scopeButton === null) {
            return;
        }

        setScope(scopeButton.getAttribute('data-doc-playground-scope'));
    }

    /**
     * Commit an advanced value on Enter, because a text field otherwise only
     * reports `change` when it loses focus. Applying it here keeps the keyboard flow
     * independent of whether the field had been marked dirty by a previous edit.
     * @param {KeyboardEvent} event - The key event.
     * @returns {void}
     */
    function handleKeydown(event) {
        if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement)) {
            return;
        }

        if (!event.target.hasAttribute('data-doc-playground-token')) {
            return;
        }

        event.preventDefault();
        applyTokenValue(event.target.getAttribute('data-doc-playground-token'), event.target.value);
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
        window.clearTimeout(persistTimer);
        persistTimer = 0;

        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            /* storage unavailable, the reset still applies for this visit */
        }

        syncControls();
        syncAdvanced();
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

        // Start in the scope the reader is looking at, so the preview and the docs
        // page do not disagree on first paint.
        activeScope = document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';

        advanced = window.roolithPlaygroundAdvanced || null;
        tokensByName = new Map(model.listTokens().map((token) => [token.name, token]));

        if (advanced === null || tokensByName.size === 0) {
            elements.advancedToggle.hidden = true;
        } else {
            advancedView = advanced.build(model.listTokens(), {
                shared: elements.advancedShared,
                theme: elements.advancedTheme,
            });
        }

        // The first option means "framework default", so name the stack it keeps.
        if (elements.fontFamily.options.length > 0) {
            elements.fontFamily.options[0].textContent = `Framework default (${defaults.fontFamily})`;
        }

        elements.previewStyle = document.createElement('style');
        document.head.appendChild(elements.previewStyle);

        root.addEventListener('input', handleInput);
        root.addEventListener('change', handleChange);
        root.addEventListener('click', handleClick);
        root.addEventListener('keydown', handleKeydown);
        window.addEventListener('pagehide', flushPersist);
        elements.copy.addEventListener('click', handleCopy);
        elements.reset.addEventListener('click', handleReset);

        syncControls();
        syncAdvanced();
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
