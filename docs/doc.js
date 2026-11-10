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
 * Apply a theme by setting exactly one explicit scope class, so the automatic
 * `prefers-color-scheme` fallback in the framework CSS never overrides it.
 * @param {'light' | 'dark'} theme - Theme to apply.
 * @returns {void}
 */
function applyTheme(theme) {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    document.documentElement.classList.toggle('theme-light', theme === 'light');
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
 * Wire up the mobile navigation drawer, theme toggle, copy buttons, and accordion items.
 * @returns {void}
 */
function initDocSite() {
    document.querySelectorAll('[data-doc-theme-toggle]').forEach((button) => {
        button.addEventListener('click', toggleTheme);
    });

    document.querySelectorAll('[data-doc-sidebar-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            setSidebarOpen(!document.documentElement.classList.contains('doc-sidebar-open'));
        });
    });

    document.querySelectorAll('[data-doc-sidebar-close]').forEach((element) => {
        element.addEventListener('click', closeSidebar);
    });

    document.querySelectorAll('#doc-sidebar a').forEach((link) => {
        link.addEventListener('click', closeSidebar);
    });

    document.addEventListener('keydown', (event) => {
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
    });

    SIDEBAR_MEDIA.addEventListener('change', (event) => {
        if (!event.matches) {
            closeSidebar();
        }
    });

    document.querySelectorAll('[data-doc-copy]').forEach((button) => {
        button.addEventListener('click', async () => {
            const target = document.getElementById(button.getAttribute('data-doc-copy'));
            if (!target) {
                return;
            }
            const copied = await copyText(target.textContent);
            if (copied) {
                flashCopied(button);
            }
        });
    });

    document.querySelectorAll('.accordion-item-title').forEach((title) => {
        title.addEventListener('click', () => toggleAccordionItem(title));
    });
}

initTheme();

document.addEventListener('DOMContentLoaded', initDocSite);
