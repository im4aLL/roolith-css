/**
 * Doc site behavior: theme toggle, copy-to-clipboard buttons, navigation state,
 * and the shared demo hooks used by component pages. Search lives in
 * `doc-search.js` and the transient surface controllers live in
 * `doc-surfaces.js`.
 */

const THEME_KEY = 'roolith-doc-theme';

/**
 * Resolve the operating system color scheme preference.
 * @returns {'light' | 'dark'} The preferred theme.
 */
function preferredTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Enable only the highlight.js stylesheet that matches the given theme.
 * @param {'light' | 'dark'} theme - Theme to apply.
 * @returns {void}
 */
function applyCodeTheme(theme) {
    document.querySelectorAll('[data-hljs-theme]').forEach((link) => {
        link.disabled = link.getAttribute('data-hljs-theme') !== theme;
    });
}

/**
 * Reflect the active theme on every theme toggle in the shared header.
 * @returns {void}
 */
function syncThemeToggleState() {
    const isDark = document.documentElement.classList.contains('theme-dark');
    document.querySelectorAll('[data-doc-theme-toggle]').forEach((button) => {
        button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
}

/**
 * Apply a theme by setting exactly one explicit scope class, so the automatic
 * `prefers-color-scheme` fallback in the framework CSS never overrides it.
 * @param {'light' | 'dark'} theme - Theme to apply.
 * @returns {void}
 */
function applyTheme(theme) {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    applyCodeTheme(theme);
    syncThemeToggleState();
}

/**
 * Highlight code blocks with the bundled highlight.js build, when it loaded.
 * @returns {void}
 */
function highlightCodeBlocks() {
    if (window.hljs && 'highlightAll' in window.hljs) {
        window.hljs.highlightAll();
    }
}

/**
 * Apply the stored theme, or the OS preference, before first paint to avoid
 * flashing the wrong mode.
 * @returns {void}
 */
function initTheme() {
    let stored = null;
    try {
        stored = localStorage.getItem(THEME_KEY);
    } catch (error) {
        /* storage unavailable, fall back to the OS preference */
    }
    applyTheme(stored === 'dark' || stored === 'light' ? stored : preferredTheme());
}

/**
 * Toggle between light and dark theme and persist the choice.
 * @returns {void}
 */
function toggleTheme() {
    const theme = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
    applyTheme(theme);
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        /* storage unavailable, theme still applies for this page */
    }
}

/**
 * Copy the text content of an element to the clipboard.
 * @param {string} text - Text to copy.
 * @returns {Promise<boolean>} Whether copying succeeded.
 */
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        let copied = false;
        try {
            copied = document.execCommand('copy');
        } catch (fallbackError) {
            copied = false;
        }
        textarea.remove();
        return copied;
    }
}

/**
 * Flash a temporary "Copied!" state on a copy button.
 * @param {HTMLButtonElement} button - The clicked copy button.
 * @returns {void}
 */
function flashCopied(button) {
    const original = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('is-copied');
    setTimeout(() => {
        button.textContent = original;
        button.classList.remove('is-copied');
    }, 1600);
}

/**
 * Toggle an accordion item open or closed.
 * @param {HTMLElement} title - The clicked accordion item title.
 * @returns {void}
 */
function toggleAccordionItem(title) {
    const item = title.closest('.accordion-item');
    if (item) {
        item.classList.toggle('active');
        refreshScrollableTables();
    }
}

/**
 * Activate one tab title and its panel, clearing the siblings in the same tab.
 * @param {HTMLElement} title - The clicked tab title.
 * @returns {void}
 */
function activateTab(title) {
    const tab = title.closest('.tab');
    if (!tab) {
        return;
    }
    const selector = title.getAttribute('data-doc-tab');
    const content = selector ? document.getElementById(selector.replace(/^#/, '')) : null;
    tab.querySelectorAll('.tab-title').forEach((item) => {
        item.classList.toggle('active', item === title);
    });
    tab.querySelectorAll('.tab-content').forEach((panel) => {
        panel.classList.toggle('active', panel === content);
    });
    refreshScrollableTables();
}

/**
 * Remove a dismissible message from the page.
 * @param {HTMLElement} button - The clicked message close control.
 * @returns {void}
 */
function dismissMessage(button) {
    const message = button.closest('.message[data-doc-dismissible]');
    if (message) {
        message.remove();
    }
}

const TOAST_DURATION = 3500;

/**
 * Append a demo toast notification to the body and remove it after a short delay.
 * @param {HTMLElement} trigger - Element carrying `data-doc-toast-show`.
 * @returns {void}
 */
function showToast(trigger) {
    const text = trigger.getAttribute('data-doc-toast-show') || 'Saved successfully.';
    const position = trigger.getAttribute('data-doc-toast-position');
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    if (position === 'bottom' || position === 'left' || position === 'top') {
        toast.classList.add(position);
    }

    const message = document.createElement('div');
    message.className = 'message message-success';
    message.setAttribute('role', 'status');
    message.textContent = text;

    toast.appendChild(message);
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), TOAST_DURATION);
}

const SIDEBAR_MEDIA = window.matchMedia('(max-width: 1023px)');

const SPOTLIGHT_MEDIA = window.matchMedia(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
);

const LAB_DEFAULT_COLOR = '#4a5cd0';

const LAB_DEFAULT_RADIUS = 8;

/**
 * Read the accent color and radius currently selected in a token lab.
 * @param {HTMLElement} lab - Token lab root element.
 * @returns {{ color: string, radius: number }} Current lab values.
 */
function readLabState(lab) {
    const swatch = lab.querySelector('[data-doc-lab-color][aria-pressed="true"]');
    const range = lab.querySelector('[data-doc-lab-radius]');
    const color = swatch ? swatch.getAttribute('data-doc-lab-color') : null;
    const radius = range ? Number.parseInt(range.value, 10) : Number.NaN;

    return {
        color: color || LAB_DEFAULT_COLOR,
        radius: Number.isFinite(radius) ? radius : LAB_DEFAULT_RADIUS,
    };
}

/**
 * Apply lab values to the preview and keep the readouts and snippet in sync.
 * @param {HTMLElement} lab - Token lab root element.
 * @returns {void}
 */
function renderLab(lab) {
    const { color, radius } = readLabState(lab);

    lab.style.setProperty('--r-color-primary', color);
    lab.style.setProperty('--r-global-border-radius', `${radius}px`);

    const range = lab.querySelector('[data-doc-lab-radius]');
    if (range) {
        const min = Number.parseFloat(range.min) || 0;
        const max = Number.parseFloat(range.max) || 100;
        const fill = max === min ? 0 : ((radius - min) / (max - min)) * 100;
        range.style.setProperty('--doc-range-fill', `${fill}%`);
    }

    const value = lab.querySelector('[data-doc-lab-radius-value]');
    if (value) {
        value.textContent = `${radius}px`;
    }

    const snippet = lab.querySelector('[data-doc-lab-snippet]');
    if (snippet) {
        snippet.textContent = `:root {\n    --r-color-primary: ${color};\n    --r-global-border-radius: ${radius}px;\n}`;
    }
}

/**
 * Mark one accent swatch as selected and repaint the lab.
 * @param {HTMLElement} lab - Token lab root element.
 * @param {Element} swatch - The chosen swatch button.
 * @returns {void}
 */
function selectLabColor(lab, swatch) {
    lab.querySelectorAll('[data-doc-lab-color]').forEach((button) => {
        button.setAttribute('aria-pressed', button === swatch ? 'true' : 'false');
    });
    renderLab(lab);
}

/**
 * Wire the radius slider and paint every token lab on the page.
 * @returns {void}
 */
function initLabControls() {
    document.querySelectorAll('[data-doc-lab]').forEach((lab) => {
        const range = lab.querySelector('[data-doc-lab-radius]');
        if (range) {
            range.addEventListener('input', () => renderLab(lab));
        }
        renderLab(lab);
    });
}

/**
 * Move a soft glow with the pointer across the hero section.
 * @param {HTMLElement} hero - Hero section element.
 * @returns {void}
 */
function initSpotlight(hero) {
    if (!SPOTLIGHT_MEDIA.matches) {
        return;
    }

    let frame = 0;

    hero.addEventListener('pointermove', (event) => {
        hero.classList.add('is-spotlight');
        if (frame) {
            return;
        }
        frame = requestAnimationFrame(() => {
            frame = 0;
            const bounds = hero.getBoundingClientRect();
            if (!bounds.width || !bounds.height) {
                return;
            }
            const layerLeft = bounds.left + bounds.width / 2 - window.innerWidth / 2;
            hero.style.setProperty('--doc-spot-x', `${event.clientX - layerLeft}px`);
            hero.style.setProperty('--doc-spot-y', `${event.clientY - bounds.top}px`);
        });
    });

    hero.addEventListener('pointerleave', () => {
        hero.classList.remove('is-spotlight');
    });
}

let navSyncQueued = false;

/**
 * Open or close the mobile navigation drawer.
 * @param {boolean} open - Whether the drawer should be open.
 * @returns {void}
 */
function setSidebarOpen(open) {
    if (open && !document.getElementById('doc-sidebar')) {
        return;
    }
    document.documentElement.classList.toggle('doc-sidebar-open', open);
    syncSidebarToggleTarget();
}

/**
 * Keep the sidebar toggle pointing at `#doc-sidebar` whenever the drawer exists,
 * and only drop the relationship on pages that have neither the sidebar nor a
 * still pending placeholder that may load it. The toggle stays disabled until a
 * drawer exists, reads `Loading navigation` while a placeholder may still load
 * it, and is hidden outright when the drawer will never arrive, so it never
 * advertises a state it cannot produce.
 * @returns {void}
 */
function syncSidebarToggleTarget() {
    const hasSidebar = Boolean(document.getElementById('doc-sidebar'));
    const hasPlaceholder = Boolean(document.querySelector('include-fragment[src*="sidebar"]:not(.is-error):not(.is-loaded)'));
    const isOpen = document.documentElement.classList.contains('doc-sidebar-open');
    document.querySelectorAll('[data-doc-sidebar-toggle]').forEach((button) => {
        button.hidden = !hasSidebar && !hasPlaceholder;
        button.disabled = !hasSidebar;
        if (hasSidebar) {
            button.setAttribute('aria-controls', 'doc-sidebar');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
            return;
        }
        button.removeAttribute('aria-controls');
        button.removeAttribute('aria-expanded');
        if (hasPlaceholder) {
            button.setAttribute('aria-label', 'Loading navigation');
        }
    });
}

/**
 * Close the mobile navigation drawer when it is open.
 * @returns {void}
 */
function closeSidebar() {
    if (document.documentElement.classList.contains('doc-sidebar-open')) {
        setSidebarOpen(false);
    }
}

/**
 * Normalize a pathname so `/`, `/index.html`, `/foo/`, and a clean `/foo` URL all
 * compare consistently, because static hosts may strip or add the `.html` suffix.
 * @param {string} pathname - Pathname to normalize.
 * @returns {string} Normalized pathname.
 */
function normalizePath(pathname) {
    return pathname
        .replace(/index\.html$/, '')
        .replace(/\.html$/, '')
        .replace(/\/+$/, '');
}

/**
 * Test whether a navigation URL addresses the page currently being viewed. The
 * comparison also accepts a site mounted under a subpath, so a dev server that
 * serves the docs from `/docs/` still marks the page whose links are rooted at
 * the deployment root.
 * @param {string} href - URL to compare with the current page.
 * @returns {boolean} Whether the URL points at the current page.
 */
function isCurrentPage(href) {
    const current = normalizePath(window.location.pathname);
    const target = normalizePath(new URL(href).pathname);
    if (current === target) {
        return true;
    }
    return Boolean(target) && current.endsWith(target);
}

/**
 * Highlight the navigation entry that matches the current page. Only the first
 * match wins, so duplicate targets do not light up twice.
 * @returns {void}
 */
function markActiveNav() {
    document.querySelectorAll('.layout-header-nav, .doc-footer .nav').forEach((list) => {
        let matched = false;
        list.querySelectorAll('.nav-item').forEach((item) => {
            const link = item.querySelector('a');
            const isMatch = Boolean(link) && !matched && isCurrentPage(link.href);
            matched = matched || isMatch;
            item.classList.toggle('active', isMatch);
        });
    });
}

/**
 * Highlight the sidebar entry that matches the current page and mark it as the
 * current page for assistive technology. Runs repeatedly so it also works when
 * the sidebar partial replaces its placeholder later.
 * @returns {void}
 */
function markActiveSidebar() {
    document.querySelectorAll('#doc-sidebar .sidebar-nav-list-item').forEach((item) => {
        const link = item.querySelector('.sidebar-nav-list-link');
        const isMatch = Boolean(link) && isCurrentPage(link.href);
        item.classList.toggle('is-active', isMatch);
        if (!link) {
            return;
        }
        if (isMatch) {
            link.setAttribute('aria-current', 'page');
            return;
        }
        link.removeAttribute('aria-current');
    });
}

/**
 * Coalesce repeated navigation syncs into one animation frame.
 * @returns {void}
 */
function scheduleNavSync() {
    if (navSyncQueued) {
        return;
    }
    navSyncQueued = true;
    requestAnimationFrame(() => {
        navSyncQueued = false;
        markActiveNav();
        markActiveSidebar();
        syncSidebarToggleTarget();
        syncThemeToggleState();
    });
}

const TABLE_SCROLL_TOLERANCE = 1;

let tableSyncQueued = false;

/**
 * Gate each documentation table wrapper on whether it actually overflows, so a
 * keyboard user finds a scroll stop where one is needed and no inert stop where
 * the table already fits. On overflow the gate adds `tabindex="0"` and ensures
 * `role="region"`; when the wrapper fits it removes only `tabindex`. The region
 * role and the authored name are never removed, so `aria-label` or
 * `aria-labelledby` stays valid whether or not the wrapper overflows.
 * @returns {void}
 */
function updateScrollableTables() {
    document.querySelectorAll('.doc-table-wrap, .table-responsive, .doc-playground-table-wrap').forEach((wrapper) => {
        const overflows = wrapper.scrollWidth - wrapper.clientWidth > TABLE_SCROLL_TOLERANCE;
        if (overflows) {
            wrapper.setAttribute('tabindex', '0');
            wrapper.setAttribute('role', 'region');
            return;
        }
        wrapper.removeAttribute('tabindex');
    });
}

/**
 * Gate table-wrapper focusability once on load and again after each resize,
 * coalescing bursts of resize events into a single animation frame.
 * @returns {void}
 */
function initScrollableTables() {
    updateScrollableTables();
    window.addEventListener('resize', () => {
        if (tableSyncQueued) {
            return;
        }
        tableSyncQueued = true;
        requestAnimationFrame(() => {
            tableSyncQueued = false;
            updateScrollableTables();
        });
    });
}

let repeaterRowCounter = 0;
let repeaterDrag = null;

const REPEATER_DRAG_CLASS = 'is-dragging';

/**
 * Return the rows of a repeater in their current visual order.
 * @param {HTMLElement} repeater - Root carrying `data-doc-repeater`.
 * @returns {HTMLElement[]} The row elements.
 */
function repeaterRows(repeater) {
    return Array.from(repeater.querySelectorAll('.block-repeater-item'));
}

/**
 * Describe a row by its field name, falling back to its position.
 * @param {HTMLElement} row - The row element.
 * @param {number} index - Zero-based row position.
 * @returns {string} A phrase such as `the Region field`.
 */
function repeaterRowLabel(row, index) {
    const input = row.querySelector('[data-doc-repeater-name]');
    const name = input instanceof HTMLInputElement ? input.value.trim() : '';
    return name ? `the ${name} field` : `field ${index + 1}`;
}

/**
 * Announce a repeater change through the polite status region inside the block.
 * @param {HTMLElement} repeater - Root carrying `data-doc-repeater`.
 * @param {string} message - Text to announce.
 * @returns {void}
 */
function announceRepeaterChange(repeater, message) {
    const status = repeater.querySelector('[data-doc-repeater-status]');
    if (status) {
        status.textContent = message;
    }
}

/**
 * Keep ids, field names, and row action labels in step with the current order.
 * Ids stay stable per row, while names follow the row index for form submission.
 * @param {HTMLElement} repeater - Root carrying `data-doc-repeater`.
 * @returns {void}
 */
function syncRepeaterRows(repeater) {
    repeaterRows(repeater).forEach((row, index) => {
        if (!row.dataset.repeaterRowId) {
            repeaterRowCounter += 1;
            row.dataset.repeaterRowId = String(repeaterRowCounter);
        }

        const suffix = row.dataset.repeaterRowId;

        row.querySelectorAll('.form-field').forEach((field) => {
            const input = field.querySelector('input');
            const label = field.querySelector('label');

            if (!(input instanceof HTMLInputElement) || !label) {
                return;
            }

            if (input.matches('[data-doc-repeater-name]')) {
                input.id = `block-repeater-name-${suffix}`;
                input.name = `fields[${index}][name]`;
            } else if (input.matches('[data-doc-repeater-value]')) {
                input.id = `block-repeater-value-${suffix}`;
                input.name = `fields[${index}][value]`;
            }

            if (input.id) {
                label.setAttribute('for', input.id);
            }
        });

        const description = repeaterRowLabel(row, index);
        const sort = row.querySelector('[data-doc-repeater-sort]');
        const remove = row.querySelector('[data-doc-repeater-remove]');

        if (sort instanceof HTMLElement) {
            sort.draggable = true;
            sort.setAttribute('aria-label', `Reorder ${description}`);
        }

        if (remove) {
            remove.setAttribute('aria-label', `Remove ${description}`);
        }
    });
}

/**
 * Append a blank row copied from the first row, focus its name field, and announce it.
 * @param {HTMLElement} repeater - Root carrying `data-doc-repeater`.
 * @returns {void}
 */
function addRepeaterRow(repeater) {
    const list = repeater.querySelector('.block-repeater-list');
    const source = repeater.querySelector('.block-repeater-item');

    if (!list || !source) {
        return;
    }

    const row = source.cloneNode(true);
    delete row.dataset.repeaterRowId;

    row.querySelectorAll('input').forEach((input) => {
        input.removeAttribute('id');
        input.value = '';
    });

    list.append(row);
    syncRepeaterRows(repeater);

    const firstInput = row.querySelector('[data-doc-repeater-name]');
    if (firstInput instanceof HTMLInputElement) {
        firstInput.focus();
    }

    announceRepeaterChange(repeater, `Added ${repeaterRowLabel(row, repeaterRows(repeater).length - 1)}.`);
}

/**
 * Remove the row that owns the clicked button and keep focus in a useful place.
 * @param {HTMLElement} button - The clicked remove control.
 * @returns {void}
 */
function removeRepeaterRow(button) {
    const repeater = button.closest('[data-doc-repeater]');
    const row = button.closest('.block-repeater-item');

    if (!(repeater instanceof HTMLElement) || !(row instanceof HTMLElement)) {
        return;
    }

    const rows = repeaterRows(repeater);
    if (rows.length <= 1) {
        return;
    }

    const index = rows.indexOf(row);
    const description = repeaterRowLabel(row, index);

    row.remove();
    syncRepeaterRows(repeater);

    const remaining = repeaterRows(repeater);
    const nextRow = remaining[Math.min(index, remaining.length - 1)];
    const nextRemove = nextRow ? nextRow.querySelector('[data-doc-repeater-remove]') : null;
    const addButton = repeater.querySelector('[data-doc-repeater-add]');

    if (nextRemove instanceof HTMLElement && nextRemove.offsetParent !== null) {
        nextRemove.focus();
    } else if (addButton instanceof HTMLElement) {
        addButton.focus();
    }

    announceRepeaterChange(repeater, `Removed ${description}.`);
}

/**
 * Move a row one position up or down and report whether it changed position.
 * @param {HTMLElement} row - The row to move.
 * @param {-1 | 1} direction - Up when negative, down when positive.
 * @returns {boolean} Whether the row moved.
 */
function moveRepeaterRow(row, direction) {
    const sibling = direction < 0 ? row.previousElementSibling : row.nextElementSibling;
    const list = row.parentElement;

    if (!sibling || !list) {
        return false;
    }

    if (direction < 0) {
        list.insertBefore(row, sibling);
    } else {
        list.insertBefore(sibling, row);
    }

    return true;
}

/**
 * Start dragging a row from its sort handle.
 * @param {DragEvent} event - The dragstart event.
 * @returns {void}
 */
function startRepeaterDrag(event) {
    const handle = event.target instanceof Element ? event.target.closest('[data-doc-repeater-sort]') : null;
    const row = handle ? handle.closest('.block-repeater-item') : null;
    const repeater = handle ? handle.closest('[data-doc-repeater]') : null;

    if (!(handle instanceof HTMLElement) || !row || !(repeater instanceof HTMLElement) || !event.dataTransfer) {
        return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', '');

    repeaterDrag = {
        row,
        repeater,
        startIndex: repeaterRows(repeater).indexOf(row),
    };
    row.classList.add(REPEATER_DRAG_CLASS);
}

/**
 * Reorder rows while a dragged row crosses the midpoint of a sibling.
 * @param {DragEvent} event - The dragover event.
 * @returns {void}
 */
function moveRepeaterDrag(event) {
    if (!repeaterDrag) {
        return;
    }

    const { row, repeater } = repeaterDrag;
    const overRow = event.target instanceof Element ? event.target.closest('.block-repeater-item') : null;

    if (!overRow || overRow === row || overRow.closest('[data-doc-repeater]') !== repeater) {
        return;
    }

    event.preventDefault();

    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }

    const rect = overRow.getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;
    overRow.parentElement.insertBefore(row, before ? overRow : overRow.nextSibling);
}

/**
 * Finish a drag, renumber the rows, and announce the new position.
 * @param {DragEvent} event - The dragend or drop event.
 * @returns {void}
 */
function endRepeaterDrag(event) {
    if (!repeaterDrag) {
        return;
    }

    event.preventDefault();

    const { row, repeater, startIndex } = repeaterDrag;
    repeaterDrag = null;
    row.classList.remove(REPEATER_DRAG_CLASS);
    syncRepeaterRows(repeater);

    const index = repeaterRows(repeater).indexOf(row);
    if (index !== startIndex) {
        announceRepeaterChange(repeater, `Moved ${repeaterRowLabel(row, index)} to position ${index + 1}.`);
    }
}

/**
 * Move a focused row with the arrow keys on its sort handle.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {void}
 */
function handleRepeaterKeydown(event) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
    }

    const handle = event.target instanceof Element ? event.target.closest('[data-doc-repeater-sort]') : null;
    const row = handle ? handle.closest('.block-repeater-item') : null;
    const repeater = handle ? handle.closest('[data-doc-repeater]') : null;

    if (!handle || !row || !(repeater instanceof HTMLElement)) {
        return;
    }

    event.preventDefault();

    if (!moveRepeaterRow(row, event.key === 'ArrowUp' ? -1 : 1)) {
        return;
    }

    syncRepeaterRows(repeater);

    const index = repeaterRows(repeater).indexOf(row);
    announceRepeaterChange(repeater, `Moved ${repeaterRowLabel(row, index)} to position ${index + 1}.`);
}

/**
 * Refresh row action labels when a field name changes.
 * @param {Event} event - The input event.
 * @returns {void}
 */
function handleRepeaterInput(event) {
    const input = event.target;

    if (!(input instanceof Element) || !input.matches('[data-doc-repeater-name]')) {
        return;
    }

    const repeater = input.closest('[data-doc-repeater]');
    if (repeater instanceof HTMLElement) {
        syncRepeaterRows(repeater);
    }
}

/**
 * Keep the fixed SVG map tooltip inside the viewport and next to the pointer.
 * @param {HTMLElement} tooltip - The tooltip element.
 * @param {number} clientX - Pointer viewport x.
 * @param {number} clientY - Pointer viewport y.
 * @returns {void}
 */
function positionSvgMapTooltip(tooltip, clientX, clientY) {
    const padding = 8;
    const rect = tooltip.getBoundingClientRect();
    let left = clientX + 12;
    let top = clientY - rect.height - 12;

    if (left + rect.width + padding > window.innerWidth) {
        left = clientX - rect.width - 12;
    }

    if (top < padding) {
        top = clientY + 12;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

/**
 * Fill the tooltip with the name and metrics carried by a map path.
 * @param {HTMLElement} tooltip - The tooltip element.
 * @param {SVGPathElement} path - The hovered path.
 * @returns {boolean} Whether the path had a name and the tooltip was filled.
 */
function renderSvgMapTooltip(tooltip, path) {
    const { name, pageviews, uniqueVisitors, visits } = path.dataset;

    if (!name) {
        return false;
    }

    const content = document.createElement('div');
    content.className = 'block-svg-map-tooltip-content';

    const title = document.createElement('div');
    title.className = 'block-svg-map-tooltip-content-hl';
    title.textContent = name;
    content.append(title);

    [
        ['Pageviews', pageviews],
        ['Unique', uniqueVisitors],
        ['Visits', visits],
    ].forEach(([label, value]) => {
        if (!value) {
            return;
        }

        const metric = document.createElement('div');
        metric.className = 'block-svg-map-tooltip-content-text';
        metric.textContent = `${label}: ${value}`;
        content.append(metric);
    });

    tooltip.replaceChildren(content);

    return true;
}

/**
 * Hide the SVG map tooltip.
 * @param {HTMLElement} tooltip - The tooltip element.
 * @returns {void}
 */
function hideSvgMapTooltip(tooltip) {
    tooltip.classList.remove('show');
}

/**
 * Bind the demo SVG map to a tooltip that follows the pointer and shows the
 * analytics each country path carries, mirroring the canonical demo.
 * @returns {void}
 */
function initSvgMap() {
    const map = document.querySelector('[data-doc-svg-map]');
    const tooltip = document.querySelector('[data-doc-svg-map-tooltip]');

    if (!(map instanceof HTMLElement) || !(tooltip instanceof HTMLElement)) {
        return;
    }

    map.querySelectorAll('path').forEach((path) => {
        path.addEventListener('mouseenter', (event) => {
            if (!renderSvgMapTooltip(tooltip, path)) {
                return;
            }

            tooltip.classList.add('show');
            positionSvgMapTooltip(tooltip, event.clientX, event.clientY);
        });

        path.addEventListener('mousemove', (event) => {
            positionSvgMapTooltip(tooltip, event.clientX, event.clientY);
        });

        path.addEventListener('mouseleave', () => hideSvgMapTooltip(tooltip));

        path.addEventListener(
            'touchstart',
            (event) => {
                const touch = event.touches[0];

                if (!touch || !renderSvgMapTooltip(tooltip, path)) {
                    return;
                }

                tooltip.classList.add('show');
                positionSvgMapTooltip(tooltip, touch.clientX, touch.clientY);
                event.preventDefault();
            },
            { passive: false },
        );

        path.addEventListener('touchend', () => hideSvgMapTooltip(tooltip));
        path.addEventListener('touchcancel', () => hideSvgMapTooltip(tooltip));
    });

    window.addEventListener('scroll', () => hideSvgMapTooltip(tooltip), { passive: true });
    window.addEventListener('resize', () => hideSvgMapTooltip(tooltip));
}

/**
 * Handle clicks on document-level controls. Delegation keeps the behavior working
 * for markup added by the include-fragment partials after the page has loaded.
 * @param {MouseEvent} event - The click event.
 * @returns {Promise<void>} Resolves when the click has been handled.
 */
async function handleClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
        return;
    }

    if (!target.closest('[data-doc-search]') && !target.closest('[data-doc-search-toggle]')) {
        closeSearchResults();
        closeSearchBar();
    }

    if (!target.closest('.combo-box')) {
        closeComboBoxes();
    }

    if (!target.closest('.popover') && !target.closest('[data-doc-popover]')) {
        closePopovers(false);
    }

    if (target.closest('[data-doc-theme-toggle]')) {
        toggleTheme();
        return;
    }

    if (target.closest('[data-doc-search-toggle]')) {
        setSearchOpen(!isSearchBarOpen());
        return;
    }

    if (target.closest('[data-doc-sidebar-toggle]')) {
        setSidebarOpen(!document.documentElement.classList.contains('doc-sidebar-open'));
        return;
    }

    if (target.closest('[data-doc-sidebar-close]') || target.closest('#doc-sidebar a')) {
        closeSidebar();
        return;
    }

    const labSwatch = target.closest('[data-doc-lab-color]');
    if (labSwatch) {
        const lab = labSwatch.closest('[data-doc-lab]');
        if (lab) {
            selectLabColor(lab, labSwatch);
        }
        return;
    }

    const copyButton = target.closest('[data-doc-copy]');
    if (copyButton) {
        const sourceId = copyButton.getAttribute('data-doc-copy');
        const source = sourceId ? document.getElementById(sourceId) : null;
        if (source) {
            const copied = await copyText(source.textContent);
            if (copied) {
                flashCopied(copyButton);
            }
        }
        return;
    }

    const repeaterAdd = target.closest('[data-doc-repeater-add]');
    if (repeaterAdd) {
        const repeater = repeaterAdd.closest('[data-doc-repeater]');
        if (repeater instanceof HTMLElement) {
            addRepeaterRow(repeater);
        }
        return;
    }

    const repeaterRemove = target.closest('[data-doc-repeater-remove]');
    if (repeaterRemove) {
        removeRepeaterRow(repeaterRemove);
        return;
    }

    const modalClose = target.closest('.modal-close, [data-doc-modal-close]');
    if (modalClose) {
        const modal = modalClose.closest('.modal');
        if (modal) {
            closeModal(modal);
        }
        return;
    }

    if (target.classList.contains('modal')) {
        closeModal(target);
        return;
    }

    const drawerClose = target.closest('.drawer-close, [data-doc-drawer-close]');
    if (drawerClose) {
        const container = drawerClose.closest('.drawer-container');
        if (container) {
            closeDrawer(container);
        }
        return;
    }

    const drawerBackdrop = target.closest('.drawer-container');
    if (drawerBackdrop && !target.closest('.drawer')) {
        closeDrawer(drawerBackdrop);
        return;
    }

    const modalTrigger = target.closest('[data-doc-modal]');
    if (modalTrigger) {
        openModal(modalTrigger);
        return;
    }

    const drawerTrigger = target.closest('[data-doc-drawer]');
    if (drawerTrigger) {
        openDrawer(drawerTrigger);
        return;
    }

    const tabTitle = target.closest('.tab-title[data-doc-tab]');
    if (tabTitle) {
        activateTab(tabTitle);
        return;
    }

    const accordionTitle = target.closest('.accordion-item-title');
    if (accordionTitle) {
        toggleAccordionItem(accordionTitle);
        return;
    }

    const comboTrigger = target.closest('[data-doc-combo-box]');
    if (comboTrigger) {
        toggleComboBox(comboTrigger);
        return;
    }

    const popoverTrigger = target.closest('[data-doc-popover]');
    if (popoverTrigger) {
        togglePopover(popoverTrigger);
        return;
    }

    const messageClose = target.closest('.message-close');
    if (messageClose) {
        dismissMessage(messageClose);
        return;
    }

    const toastTrigger = target.closest('[data-doc-toast-show]');
    if (toastTrigger) {
        showToast(toastTrigger);
    }
}

/**
 * Close the topmost transient surface on Escape and return focus when possible.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {void}
 */
function handleKeydown(event) {
    if (event.key !== 'Escape') {
        return;
    }

    // Result rows use `tabIndex = -1`, so this covers the click-focus race or a
    // programmatic focus on a result link: closing the panel removes that node,
    // so focus is returned to the input instead of falling back to the body.
    const focusInPanel = isSearchResultsFocused();

    if (closeSearchResults()) {
        if (focusInPanel) {
            focusSearchInput();
        }
        return;
    }

    if (isSearchBarOpen()) {
        closeSearchBar();
        const searchToggle = document.querySelector('[data-doc-search-toggle]');
        if (searchToggle) {
            searchToggle.focus();
        }
        return;
    }

    const modal = document.querySelector('.modal.active');
    if (modal) {
        closeModal(modal);
        return;
    }

    const drawer = document.querySelector('.drawer-container.open');
    if (drawer) {
        closeDrawer(drawer);
        return;
    }

    if (closePopovers(true)) {
        return;
    }

    if (closeComboBoxes()) {
        return;
    }

    if (!document.documentElement.classList.contains('doc-sidebar-open')) {
        return;
    }

    closeSidebar();
    const toggle = document.querySelector('[data-doc-sidebar-toggle]');
    if (toggle) {
        toggle.focus();
    }
}

/**
 * Re-sync navigation state once a shared partial has either loaded or failed, so the
 * sidebar toggle never points at a drawer that will not arrive. The sidebar toggle is
 * corrected immediately as well, because the queued frame may never run when
 * `requestAnimationFrame` is throttled.
 * @param {Event} event - The `load` or `error` event fired by an include-fragment.
 * @returns {void}
 */
function handleFragmentEvent(event) {
    const target = event.target;
    if (target instanceof Element && target.matches('include-fragment')) {
        syncSidebarToggleTarget();
        scheduleNavSync();
    }
}

/**
 * Wire up delegated controls and keep partial-driven UI in sync once the page is ready.
 * @returns {void}
 */
function initDocSite() {
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('dragstart', startRepeaterDrag);
    document.addEventListener('dragover', moveRepeaterDrag);
    document.addEventListener('drop', endRepeaterDrag);
    document.addEventListener('dragend', endRepeaterDrag);
    document.addEventListener('keydown', handleRepeaterKeydown);
    document.addEventListener('input', handleRepeaterInput);
    initSearch();
    document.addEventListener('load', handleFragmentEvent);
    document.addEventListener('error', handleFragmentEvent, true);
    initSurfaces();

    SIDEBAR_MEDIA.addEventListener('change', (event) => {
        if (!event.matches) {
            closeSidebar();
        }
    });

    // Partials replace their placeholders asynchronously, so re-sync whenever the
    // page gains nodes instead of assuming the header is already in place.
    new MutationObserver(scheduleNavSync).observe(document.body, { childList: true, subtree: true });
    scheduleNavSync();

    initScrollableTables();

    document.querySelectorAll('[data-doc-repeater]').forEach((repeater) => {
        if (repeater instanceof HTMLElement) {
            syncRepeaterRows(repeater);
        }
    });

    initSvgMap();

    initLabControls();
    document.querySelectorAll('[data-doc-hero]').forEach((hero) => initSpotlight(hero));

    highlightCodeBlocks();
}

initTheme();

document.addEventListener('DOMContentLoaded', initDocSite);
