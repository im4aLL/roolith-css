/**
 * Doc site behavior: theme toggle, copy-to-clipboard buttons, and accordion items.
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
 * Apply a theme by setting exactly one explicit scope class, so the automatic
 * `prefers-color-scheme` fallback in the framework CSS never overrides it.
 * @param {'light' | 'dark'} theme - Theme to apply.
 * @returns {void}
 */
function applyTheme(theme) {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    applyCodeTheme(theme);
}

/**
 * Highlight code blocks with the CDN build of highlight.js, when it loaded.
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
    }
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
    document.documentElement.classList.toggle('doc-sidebar-open', open);
    document.querySelectorAll('[data-doc-sidebar-toggle]').forEach((button) => {
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
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
 * Normalize a pathname so `/`, `/index.html`, and `/foo/` compare consistently.
 * @param {string} pathname - Pathname to normalize.
 * @returns {string} Normalized pathname.
 */
function normalizePath(pathname) {
    return pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
}

/**
 * Highlight the navigation entry that matches the current page. Only the first
 * match wins, so duplicate targets do not light up twice.
 * @returns {void}
 */
function markActiveNav() {
    const current = normalizePath(window.location.pathname);
    document.querySelectorAll('.layout-header-nav, .doc-footer .nav').forEach((list) => {
        let matched = false;
        list.querySelectorAll('.nav-item').forEach((item) => {
            const link = item.querySelector('a');
            const isMatch = Boolean(link) && !matched && normalizePath(new URL(link.href).pathname) === current;
            matched = matched || isMatch;
            item.classList.toggle('active', isMatch);
        });
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

    if (target.closest('[data-doc-theme-toggle]')) {
        toggleTheme();
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

    const accordionTitle = target.closest('.accordion-item-title');
    if (accordionTitle) {
        toggleAccordionItem(accordionTitle);
    }
}

/**
 * Close the mobile drawer on Escape and return focus to the toggle button.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {void}
 */
function handleKeydown(event) {
    if (event.key !== 'Escape') {
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
 * Wire up delegated controls and keep partial-driven UI in sync once the page is ready.
 * @returns {void}
 */
function initDocSite() {
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    SIDEBAR_MEDIA.addEventListener('change', (event) => {
        if (!event.matches) {
            closeSidebar();
        }
    });

    // Partials replace their placeholders asynchronously, so re-sync whenever the
    // page gains nodes instead of assuming the header is already in place.
    new MutationObserver(scheduleNavSync).observe(document.body, { childList: true, subtree: true });
    scheduleNavSync();

    initLabControls();
    document.querySelectorAll('[data-doc-hero]').forEach((hero) => initSpotlight(hero));

    highlightCodeBlocks();
}

initTheme();

document.addEventListener('DOMContentLoaded', initDocSite);
