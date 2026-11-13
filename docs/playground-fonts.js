/**
 * Theme playground font controller: lazily loads the Google font stylesheet for
 * the family chosen in the base font select.
 *
 * Each Google font option carries its stylesheet URL in `data-doc-font-load`, so
 * the markup owns the mapping and this script only injects the stylesheet once
 * per URL. The generated theme CSS stays in the page controller; this file only
 * makes the chosen family available to the browser. Nothing here is exposed
 * globally. The site only requests fonts on demand here, so this script does not
 * add connection hints of its own.
 */
(function () {
    'use strict';

    const SELECT_SELECTOR = '[data-doc-playground-font]';

    const LOAD_ATTRIBUTE = 'data-doc-font-load';

    const loaded = new Set();

    /**
     * Load the stylesheet of the currently selected option when it defines one.
     * Local stacks have no load attribute and are skipped.
     * @param {HTMLSelectElement} select - Base font family select.
     * @returns {void}
     */
    function loadSelectedFont(select) {
        const option = select.options[select.selectedIndex];
        const href = option ? option.getAttribute(LOAD_ATTRIBUTE) : null;
        if (!href || loaded.has(href)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-doc-font-family', option.value);
        document.head.appendChild(link);
        loaded.add(href);
    }

    const select = document.querySelector(SELECT_SELECTOR);
    if (!select) {
        return;
    }

    loadSelectedFont(select);
    select.addEventListener('change', () => {
        loadSelectedFont(select);
    });
})();
