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

    initLabControls();
    document.querySelectorAll('[data-doc-hero]').forEach((hero) => initSpotlight(hero));

    highlightCodeBlocks();
}

initTheme();

document.addEventListener('DOMContentLoaded', initDocSite);
