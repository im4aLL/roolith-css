/**
 * Docs search UI: index loading, result ranking, keyboard navigation, and the
 * responsive mobile search bar used by the shared doc header.
 *
 * Pages must load `/doc-search.js` before `/doc.js`. Both files are classic
 * scripts sharing the global scope, so `doc.js` relies on `initSearch`,
 * `isSearchResultsFocused`, `focusSearchInput`, `closeSearchResults`,
 * `closeSearchBar`, `setSearchOpen`, and `isSearchBarOpen` being defined here.
 */

const SEARCH_LIMIT = 10;

const SEARCH_SCORE_TITLE = 4;

const SEARCH_SCORE_GROUP = 3;

const SEARCH_SCORE_HEADING = 2;

let searchIndexPromise = null;

let searchEntries = [];

let searchResults = [];

let searchActiveIndex = -1;

let searchUnavailable = false;

let searchGeneration = 0;

let searchInitialized = false;

let searchPointerInside = false;

let searchRestoreSuppressed = false;

/**
 * Find the search input in the shared header, if it has loaded.
 * @returns {HTMLInputElement | null} The search input.
 */
function getSearchInput() {
    const input = document.querySelector('[data-doc-search-input]');
    return input instanceof HTMLInputElement ? input : null;
}

/**
 * Find the search results panel in the shared header, if it has loaded.
 * @returns {HTMLElement | null} The results panel.
 */
function getSearchPanel() {
    const panel = document.querySelector('[data-doc-search-results]');
    return panel instanceof HTMLElement ? panel : null;
}

/**
 * Report whether focus currently sits inside the search results panel, so a
 * caller can tell whether closing the panel removes the focused node.
 * @returns {boolean} True when the active element is inside the panel.
 */
function isSearchResultsFocused() {
    const panel = getSearchPanel();
    return Boolean(panel) && panel.contains(document.activeElement);
}

/**
 * Move focus to the search input without reopening the results panel. The
 * suppression flag has two clearers: `handleSearchFocus` consumes and clears it
 * when the synchronous focus event fires, and the queued microtask clears it as
 * the fallback for when `focus()` produces no event at all.
 * @returns {void}
 */
function focusSearchInput() {
    const input = getSearchInput();
    if (!input) {
        return;
    }
    searchRestoreSuppressed = true;
    input.focus();
    queueMicrotask(() => {
        searchRestoreSuppressed = false;
    });
}

/**
 * Fetch and cache the search index on first use.
 * @returns {Promise<Array<{ title: string, url: string, group: string, headings: Array<{ text: string, anchor: string }> }>>} Indexed pages.
 */
function loadSearchIndex() {
    if (!searchIndexPromise) {
        searchIndexPromise = fetch('/search-index.json', { credentials: 'same-origin' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Search index request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                searchEntries = data && Array.isArray(data.pages) ? data.pages : [];
                return searchEntries;
            })
            .catch(() => {
                searchUnavailable = true;
                searchEntries = [];
                return searchEntries;
            });
    }
    return searchIndexPromise;
}

/**
 * Keep the search input `aria-expanded` state in sync with the panel.
 * @param {boolean} expanded - Whether the panel is visible.
 * @returns {void}
 */
function setSearchExpanded(expanded) {
    const input = getSearchInput();
    if (input) {
        input.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
}

/**
 * Write an announcement into the search status live region.
 * @param {string} message - Text to announce, or an empty string to clear it.
 * @returns {void}
 */
function setSearchStatus(message) {
    const status = document.querySelector('[data-doc-search-status]');
    if (status) {
        status.textContent = message;
    }
}

/**
 * Normalize the heading list of an indexed page into text and anchor objects.
 * Plain strings from older indexes are treated as headings without an anchor.
 * @param {{ headings?: Array<{ text: string, anchor?: string } | string> }} entry - Indexed page.
 * @returns {Array<{ text: string, anchor: string }>} Normalized headings in document order.
 */
function normalizeSearchHeadings(entry) {
    if (!Array.isArray(entry.headings)) {
        return [];
    }

    return entry.headings
        .map((heading) => {
            if (typeof heading === 'string') {
                return { text: heading, anchor: '' };
            }

            if (!heading || typeof heading !== 'object') {
                return null;
            }

            return {
                text: String(heading.text || ''),
                anchor: String(heading.anchor || ''),
            };
        })
        .filter((heading) => heading !== null && heading.text !== '');
}

/**
 * Build the navigable url of a ranked page, appending the matched heading anchor
 * so a result jumps straight to the matching section.
 * @param {{ url: string, anchor?: string }} entry - Ranked page entry.
 * @returns {string} The page url, with a fragment when the entry has an anchor.
 */
function getSearchEntryUrl(entry) {
    const url = String(entry.url || '');

    return entry.anchor ? `${url}#${entry.anchor}` : url;
}

/**
 * Score one indexed page against a normalized query. Title matches outweigh
 * group matches, which outweigh headings. The best matching heading and its
 * anchor are returned so the row can show and open where the hit came from.
 * @param {{ title: string, url: string, group: string, headings: Array<{ text: string, anchor?: string } | string> }} entry - Indexed page.
 * @param {string} needle - Lowercase trimmed query.
 * @returns {{ score: number, heading: string, anchor: string }} Match score, best heading text, and its anchor.
 */
function scoreSearchEntry(entry, needle) {
    let score = 0;
    const headings = normalizeSearchHeadings(entry);

    if (String(entry.title || '').toLowerCase().includes(needle)) {
        score += SEARCH_SCORE_TITLE;
    }

    if (String(entry.group || '').toLowerCase().includes(needle)) {
        score += SEARCH_SCORE_GROUP;
    }

    const headingMatch =
        headings.find((heading) => heading.text.toLowerCase().startsWith(needle)) ||
        headings.find((heading) => heading.text.toLowerCase().includes(needle));

    if (headingMatch) {
        score += SEARCH_SCORE_HEADING;
    }

    return {
        score,
        heading: headingMatch ? headingMatch.text : '',
        anchor: headingMatch ? headingMatch.anchor : '',
    };
}

/**
 * Rank indexed pages by relevance and keep the ten best matches. Ties fall back
 * to the page title so the order stays stable between keystrokes.
 * @param {string} query - Raw search input value.
 * @returns {Array<{ title: string, url: string, group: string, headings: Array<{ text: string, anchor: string }>, match: string, anchor: string }>} Ranked pages.
 */
function filterSearchEntries(query) {
    const needle = query.trim().toLowerCase();
    if (!needle) {
        return [];
    }

    const ranked = [];

    searchEntries.forEach((entry) => {
        const { score, heading, anchor } = scoreSearchEntry(entry, needle);
        if (score > 0) {
            ranked.push({ entry, score, heading, anchor });
        }
    });

    ranked.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return String(a.entry.title || '').localeCompare(String(b.entry.title || ''));
    });

    return ranked
        .slice(0, SEARCH_LIMIT)
        .map((match) => ({ ...match.entry, match: match.heading, anchor: match.anchor }));
}

/**
 * Clear the active result row and the input relationship that points at it.
 * @returns {void}
 */
function clearSearchActive() {
    searchResults = [];
    searchActiveIndex = -1;
    const input = getSearchInput();
    if (input) {
        input.removeAttribute('aria-activedescendant');
    }
}

/**
 * Render a single disabled option row inside the search listbox.
 * @param {string} message - Text to show.
 * @returns {void}
 */
function renderSearchStatus(message) {
    const panel = getSearchPanel();
    if (!panel) {
        return;
    }
    panel.textContent = '';
    const row = document.createElement('div');
    row.className = 'doc-search-empty';
    row.setAttribute('role', 'option');
    row.setAttribute('aria-disabled', 'true');
    row.setAttribute('aria-selected', 'false');
    row.textContent = message;
    panel.appendChild(row);
    panel.hidden = false;
    clearSearchActive();
    setSearchExpanded(true);
    setSearchStatus(message);
}

/**
 * Render matching pages as safe DOM rows with group, title, and best heading text.
 * Each row links to the matched heading anchor when the entry has one. Rows are
 * removed from the tab order because keyboard selection stays on the input via
 * `aria-activedescendant`.
 * @param {Array<{ title: string, url: string, group: string, match: string, anchor: string }>} entries - Ranked pages.
 * @param {string} query - Raw search input value, used for the empty state.
 * @returns {void}
 */
function renderSearchResults(entries, query) {
    const panel = getSearchPanel();
    if (!panel) {
        return;
    }

    if (!entries.length) {
        renderSearchStatus(`No pages found for "${query.trim()}".`);
        return;
    }

    panel.textContent = '';
    clearSearchActive();
    searchResults = entries;

    entries.forEach((entry, index) => {
        const link = document.createElement('a');
        link.className = 'doc-search-result';
        link.id = `doc-search-result-${index}`;
        link.href = getSearchEntryUrl(entry);
        link.tabIndex = -1;
        link.setAttribute('role', 'option');
        link.setAttribute('aria-selected', 'false');

        const group = document.createElement('span');
        group.className = 'doc-search-result-group';
        group.textContent = entry.group || 'Docs';

        const title = document.createElement('span');
        title.className = 'doc-search-result-title';
        title.textContent = entry.title || entry.url;

        link.appendChild(group);
        link.appendChild(title);

        if (entry.match) {
            const match = document.createElement('span');
            match.className = 'doc-search-result-match';
            match.textContent = entry.match;
            link.appendChild(match);
        }

        panel.appendChild(link);
    });

    panel.hidden = false;
    setSearchExpanded(true);
    setSearchStatus(`${entries.length} ${entries.length === 1 ? 'result' : 'results'} found.`);
}

/**
 * Hide and clear the search results panel. Closing also invalidates any search
 * request still waiting on the index, so a dismissed panel stays dismissed.
 * @returns {boolean} Whether the panel was open.
 */
function closeSearchResults() {
    searchGeneration += 1;
    setSearchStatus('');
    const panel = getSearchPanel();
    if (!panel || panel.hidden) {
        return false;
    }
    panel.hidden = true;
    panel.textContent = '';
    clearSearchActive();
    setSearchExpanded(false);
    return true;
}

/**
 * Move the active result by one row, wrapping at both ends. With no active row,
 * ArrowDown starts at the first result and ArrowUp starts at the last one.
 * @param {number} delta - Offset to apply, `1` for down and `-1` for up.
 * @returns {void}
 */
function moveSearchActive(delta) {
    if (!searchResults.length) {
        return;
    }
    if (searchActiveIndex < 0) {
        setSearchActive(delta > 0 ? 0 : searchResults.length - 1);
        return;
    }
    const next = (searchActiveIndex + delta + searchResults.length) % searchResults.length;
    setSearchActive(next);
}

/**
 * Mark one result row as active for keyboard navigation.
 * @param {number} index - Row index to highlight.
 * @returns {void}
 */
function setSearchActive(index) {
    const panel = getSearchPanel();
    const input = getSearchInput();
    if (!panel) {
        return;
    }
    const rows = panel.querySelectorAll('.doc-search-result');
    rows.forEach((row, position) => {
        const isActive = position === index;
        row.classList.toggle('is-active', isActive);
        row.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    searchActiveIndex = index;
    const activeRow = rows[index];
    if (input && activeRow) {
        input.setAttribute('aria-activedescendant', activeRow.id);
    }
    if (activeRow) {
        activeRow.scrollIntoView({ block: 'nearest' });
    }
}

/**
 * Resolve the current query and render the matching pages.
 * @param {string} query - Raw search input value.
 * @returns {Promise<void>} Resolves when the panel is updated.
 */
async function runSearch(query) {
    if (!query.trim()) {
        closeSearchResults();
        return;
    }

    searchGeneration += 1;
    const generation = searchGeneration;

    await loadSearchIndex();

    if (generation !== searchGeneration) {
        return;
    }

    const input = getSearchInput();
    if (input && input.value.trim() !== query.trim()) {
        return;
    }

    if (searchUnavailable) {
        renderSearchStatus('Search is unavailable right now.');
        return;
    }

    renderSearchResults(filterSearchEntries(query), query);
}

/**
 * Open or close the mobile search bar. Opening focuses the input, closing also
 * dismisses any open results panel.
 * @param {boolean} open - Whether the bar should be open.
 * @returns {void}
 */
function setSearchOpen(open) {
    document.documentElement.classList.toggle('doc-search-open', open);
    document.querySelectorAll('[data-doc-search-toggle]').forEach((button) => {
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        button.setAttribute('aria-label', open ? 'Close search' : 'Open search');
    });

    if (!open) {
        closeSearchResults();
        return;
    }

    const input = getSearchInput();
    if (input) {
        input.focus();
    }
}

/**
 * Report whether the mobile search bar is currently open, so other scripts do
 * not depend on the document element class name.
 * @returns {boolean} True when the search bar is open.
 */
function isSearchBarOpen() {
    return document.documentElement.classList.contains('doc-search-open');
}

/**
 * Close the mobile search bar when it is open.
 * @returns {void}
 */
function closeSearchBar() {
    if (isSearchBarOpen()) {
        setSearchOpen(false);
    }
}

/**
 * Load the index on first focus and restore results for an existing query. The
 * suppression path is handled here too: a `searchRestoreSuppressed` flag set by
 * `focusSearchInput` is consumed by this handler, so the Escape focus return does
 * not reopen the panel, while a genuine later focus still restores the query.
 * @param {FocusEvent} event - The focus event.
 * @returns {void}
 */
function handleSearchFocus(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches('[data-doc-search-input]')) {
        return;
    }
    loadSearchIndex();
    if (searchRestoreSuppressed) {
        searchRestoreSuppressed = false;
        return;
    }
    if (input.value.trim()) {
        runSearch(input.value);
    }
}

/**
 * Record whether the latest pointer press landed inside the search surface. A
 * blur caused by pressing inside the panel resolves `relatedTarget` to null, so
 * the flag lets focusout tell that case apart from a real dismissal.
 * @param {MouseEvent} event - The mousedown event.
 * @returns {void}
 */
function handleSearchPointerDown(event) {
    const target = event.target;
    if (!(target instanceof Element)) {
        searchPointerInside = false;
        return;
    }
    searchPointerInside = Boolean(target.closest('[data-doc-search]') || target.closest('[data-doc-search-toggle]'));
}

/**
 * Dismiss the results panel once focus leaves the search form or the search
 * toggle, unless focus moves to another control inside either of them, or the
 * focus loss came from pressing inside the search surface. The mobile search bar
 * itself stays open.
 * @param {FocusEvent} event - The focusout event.
 * @returns {void}
 */
function handleSearchFocusOut(event) {
    const from = event.target;
    if (!(from instanceof Element)) {
        return;
    }
    const fromForm = from.closest('[data-doc-search]');
    const fromToggle = from.closest('[data-doc-search-toggle]');
    if (!fromForm && !fromToggle) {
        return;
    }
    const to = event.relatedTarget;
    if (to instanceof Element && (to.closest('[data-doc-search]') || to.closest('[data-doc-search-toggle]'))) {
        return;
    }
    if (!(to instanceof Element) && searchPointerInside) {
        return;
    }
    closeSearchResults();
}

/**
 * Update the results while the user types in the search input.
 * @param {Event} event - The input event.
 * @returns {void}
 */
function handleSearchInput(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches('[data-doc-search-input]')) {
        return;
    }
    runSearch(input.value);
}

/**
 * Move through results or open the active one with the keyboard.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {void}
 */
function handleSearchKeydown(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches('[data-doc-search-input]')) {
        return;
    }

    const panel = getSearchPanel();
    const isOpen = Boolean(panel) && !panel.hidden;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (!isOpen || !searchResults.length) {
            return;
        }
        event.preventDefault();
        moveSearchActive(event.key === 'ArrowDown' ? 1 : -1);
        return;
    }

    if (event.key === 'Enter') {
        event.preventDefault();
        if (!isOpen || !searchResults.length) {
            return;
        }
        const entry = searchResults[searchActiveIndex >= 0 ? searchActiveIndex : 0];
        if (entry) {
            window.location.assign(getSearchEntryUrl(entry));
        }
    }
}

/**
 * Keep the header search form from submitting, which would reload the page and
 * discard the open results panel. Enter navigation is handled on keydown.
 * @param {SubmitEvent} event - The submit event.
 * @returns {void}
 */
function handleSearchSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-doc-search]')) {
        return;
    }
    event.preventDefault();
}

/**
 * Register the delegated search listeners on the document. Repeated calls are
 * ignored so the listeners cannot be bound twice.
 * @returns {void}
 */
function initSearch() {
    if (searchInitialized) {
        return;
    }
    searchInitialized = true;
    document.addEventListener('focusin', handleSearchFocus);
    document.addEventListener('focusout', handleSearchFocusOut);
    document.addEventListener('mousedown', handleSearchPointerDown);
    document.addEventListener('input', handleSearchInput);
    document.addEventListener('keydown', handleSearchKeydown);
    document.addEventListener('submit', handleSearchSubmit);
}
