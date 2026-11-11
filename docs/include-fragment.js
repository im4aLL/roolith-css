/**
 * Local replacement for the `include-fragment` custom element, so the docs site
 * loads its shared partials without any CDN runtime dependency.
 */

/**
 * Fetch the HTML named by the `src` attribute and swap it into the element.
 * The placeholder markup is left untouched when the request fails, and the
 * element keeps an `is-error` class so the shared styles can explain the state.
 * A successful load marks the element `is-loaded`, so other scripts can tell a
 * fragment that has already arrived from one that is still pending.
 */
class DocIncludeFragment extends HTMLElement {
    /**
     * Request the fragment as soon as the element is connected to the document.
     * @returns {void}
     */
    connectedCallback() {
        this.load();
    }

    /**
     * Replace the placeholder content with the fetched HTML, and guarantee that
     * one element only ever requests its fragment once.
     * @returns {Promise<void>} Resolves once the fragment has been handled.
     */
    async load() {
        if (this.loaded) {
            return;
        }
        this.loaded = true;

        const src = this.getAttribute('src');
        if (!src) {
            this.markError();
            return;
        }

        try {
            const response = await fetch(src, { credentials: 'same-origin' });
            if (!response.ok) {
                this.markError();
                return;
            }
            this.innerHTML = await response.text();
            this.classList.remove('is-error');
            this.classList.add('is-loaded');
            this.dispatchEvent(new Event('load', { bubbles: true }));
        } catch (error) {
            this.markError();
        }
    }

    /**
     * Mark the element as failed and dispatch a bubbling `error` event, so the
     * docs can re-sync navigation state that depends on this partial.
     * @returns {void}
     */
    markError() {
        this.classList.add('is-error');
        this.dispatchEvent(new Event('error', { bubbles: true }));
    }
}

if (!customElements.get('include-fragment')) {
    customElements.define('include-fragment', DocIncludeFragment);
}
