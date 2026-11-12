/**
 * Advanced token panel for the docs theme playground: builds one grouped editor
 * row per advanced token, keeps the fields in step with the active scope, and
 * refreshes the color chips from the live preview.
 *
 * This is a classic script loaded with `defer` after `/playground-tokens.js` and
 * `/playground-controls.js`, and before `/playground.js`. It publishes one
 * namespace, `window.roolithPlaygroundAdvanced`, because the page controller is a
 * separate classic script. The module only builds and paints the panel; state,
 * events, storage, and the status line stay in the controller.
 */
(function () {
    'use strict';

    const GROUP_ORDER = ['Palette', 'Surfaces', 'Text', 'Borders', 'Roles', 'Global', 'Detail'];

    /**
     * Built panel handles.
     * @typedef {object} AdvancedView
     * @property {Map<string, HTMLInputElement>} inputs - Editor input keyed by token name.
     * @property {Map<string, HTMLElement>} chips - Color chip keyed by token name.
     */

    /**
     * Order two tokens by their panel group, then by their catalog order.
     * @param {{group: string}} left - First token.
     * @param {{group: string}} right - Second token.
     * @returns {number} Sort order.
     */
    function compareTokens(left, right) {
        return GROUP_ORDER.indexOf(left.group) - GROUP_ORDER.indexOf(right.group);
    }

    /**
     * Build the editor row for one token.
     * @param {{name: string, kind: string}} token - Advanced token.
     * @param {AdvancedView} view - Handles to fill.
     * @returns {HTMLElement} The row element.
     */
    function createRow(token, view) {
        const id = `doc-playground-token-${token.name.replace(/^--/, '')}`;
        const row = document.createElement('div');
        row.className = 'doc-playground-token-row';

        const label = document.createElement('label');
        label.className = 'doc-playground-token-name';
        label.htmlFor = id;

        const name = document.createElement('code');
        name.textContent = token.name;
        label.append(name);

        const field = document.createElement('div');
        field.className = 'doc-playground-token-field';

        if (token.kind === 'color') {
            const chip = document.createElement('span');
            chip.className = 'doc-playground-token-chip';
            chip.setAttribute('aria-hidden', 'true');
            field.append(chip);
            view.chips.set(token.name, chip);
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.className = 'doc-playground-token-input form-input';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.setAttribute('data-doc-playground-token', token.name);
        field.append(input);

        view.inputs.set(token.name, input);
        row.append(label, field);

        return row;
    }

    /**
     * Build one collapsible group of token rows.
     * @param {string} group - Group label.
     * @param {object[]} tokens - Tokens in this group.
     * @param {AdvancedView} view - Handles to fill.
     * @returns {HTMLElement} The group element.
     */
    function createGroup(group, tokens, view) {
        const details = document.createElement('details');
        details.className = 'doc-playground-token-group';

        const summary = document.createElement('summary');
        const title = document.createElement('span');
        title.textContent = group;

        const count = document.createElement('span');
        count.className = 'doc-playground-token-group-count';
        count.textContent = String(tokens.length);
        summary.append(title, count);

        const rows = document.createElement('div');
        rows.className = 'doc-playground-token-rows';

        for (const token of tokens) {
            rows.append(createRow(token, view));
        }

        details.append(summary, rows);

        return details;
    }

    /**
     * Group tokens by their catalog group, preserving the catalog order.
     * @param {object[]} tokens - Tokens to group.
     * @returns {Map<string, object[]>} Tokens per group.
     */
    function groupTokens(tokens) {
        const groups = new Map();

        for (const token of tokens) {
            const group = groups.get(token.group) || [];
            group.push(token);
            groups.set(token.group, group);
        }

        return groups;
    }

    /**
     * Build the advanced panel inside the given containers, one container for the
     * shared tokens and one for the tokens of the active scope.
     * @param {object[]} tokens - Advanced tokens from the model.
     * @param {{shared: HTMLElement, theme: HTMLElement}} containers - Panel containers.
     * @returns {AdvancedView} The built handles.
     */
    function build(tokens, containers) {
        const view = { inputs: new Map(), chips: new Map() };

        for (const [scope, container] of Object.entries(containers)) {
            const scoped = tokens
                .filter((token) => (scope === 'shared' ? token.shared : !token.shared))
                .sort(compareTokens);
            const wrapper = document.createElement('div');
            wrapper.className = 'doc-playground-token-groups';

            for (const [group, grouped] of groupTokens(scoped)) {
                wrapper.append(createGroup(group, grouped, view));
            }

            container.append(wrapper);
        }

        return view;
    }

    /**
     * Write the current values into every editor field.
     * @param {AdvancedView} view - Built handles.
     * @param {(name: string) => string} resolve - Current value for a token name.
     * @returns {void}
     */
    function sync(view, resolve) {
        for (const [name, input] of view.inputs) {
            input.value = resolve(name);
        }
    }

    /**
     * Paint each color chip with the value the token has inside the preview, so a
     * chip follows the tuned palette instead of the docs page palette.
     * @param {AdvancedView} view - Built handles.
     * @param {HTMLElement} preview - Preview root element.
     * @returns {void}
     */
    function refreshChips(view, preview) {
        const computed = window.getComputedStyle(preview);

        for (const [name, chip] of view.chips) {
            chip.style.backgroundColor = computed.getPropertyValue(name).trim();
        }
    }

    window.roolithPlaygroundAdvanced = {
        build,
        sync,
        refreshChips,
    };
})();
