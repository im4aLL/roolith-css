/**
 * Theme playground font controller: lazily loads the Google font stylesheet for
 * the family chosen in the base font select.
 *
 * Each Google font option carries its stylesheet URL in `data-doc-font-load`, so
 * the markup owns the mapping and this script only injects the stylesheet once
 * per URL. The generated theme CSS stays in the page controller; this file only
 * makes the chosen family available to the browser. Nothing here is exposed
 * globally.
 */
(function () {
    'use strict';

    const SELECT_SELECTOR = '[data-doc-playground-font]';

    const LOAD_ATTRIBUTE = 'data-doc-font-load';

    const loaded = new Set();

    let preconnected = false;

    /**
     * Add the font host preconnects once, before the first stylesheet request.
     * @returns {void}
     */
    function preconnect() {
        if (preconnected) {
            return;
        }
        preconnected = true;

        [
            { href: 'https://fonts.googleapis.com', crossOrigin: null },
            { href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
        ].forEach(({ href, crossOrigin }) => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = href;
            if (crossOrigin !== null) {
                link.crossOrigin = crossOrigin;
            }
            document.head.appendChild(link);
        });
    }

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

        preconnect();

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
