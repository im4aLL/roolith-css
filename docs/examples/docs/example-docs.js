(function () {
    'use strict';

    var THEME_KEY = 'kite-theme';
    var THEME_COLORS = { light: '#f7f9fd', dark: '#060a12' };
    var themeToggle = document.querySelector('[data-theme-toggle]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var menuPanel = document.querySelector('[data-menu-panel]');
    var header = document.querySelector('[data-header]');
    var faq = document.querySelector('[data-faq]');
    var desktopQuery = window.matchMedia('(min-width: 1024px)');
    var menuOpen = false;

    /**
     * Applies one theme to the page, the toggle, and the browser bar color.
     * @param {string} theme Theme name, light or dark.
     * @param {boolean} persist Whether the choice is remembered.
     */
    function applyTheme(theme, persist) {
        var isDark = theme === 'dark';
        var meta = document.querySelector('meta[name="theme-color"]');

        document.documentElement.classList.toggle('theme-dark', isDark);
        document.documentElement.classList.toggle('theme-light', !isDark);
        meta.setAttribute('content', isDark ? THEME_COLORS.dark : THEME_COLORS.light);
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');

        if (persist) {
            try {
                window.localStorage.setItem(THEME_KEY, theme);
            } catch (error) {
                return;
            }
        }
    }

    /** Flips the current theme and remembers the choice. */
    function handleThemeToggle() {
        applyTheme(document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark', true);
    }

    /**
     * Applies an open or closed state to the panel and its toggle.
     * @param {boolean} open Target state.
     */
    function setMenuOpen(open) {
        menuOpen = open;
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menuPanel.hidden = !open;
    }

    /**
     * Toggles the panel from its button and closes it on any other click.
     * @param {MouseEvent} event Click event from the document.
     */
    function handlePageClick(event) {
        if (menuToggle.contains(event.target)) {
            setMenuOpen(!menuOpen);
            return;
        }
        if (menuOpen) {
            setMenuOpen(false);
        }
    }

    /**
     * Closes the open panel on Escape and returns focus to its toggle.
     * @param {KeyboardEvent} event Key press from the document.
     */
    function handleEscape(event) {
        if (menuOpen && event.key === 'Escape') {
            setMenuOpen(false);
            menuToggle.focus();
        }
    }

    /**
     * Closes the open panel when the layout no longer needs it.
     * @param {MediaQueryListEvent} event Viewport change event.
     */
    function handleViewportChange(event) {
        if (event.matches && menuOpen) {
            setMenuOpen(false);
        }
    }

    /** Adds the raised header treatment once the page leaves the top. */
    function handleScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 6);
    }

    /**
     * Applies an open state to one FAQ item and closes the others.
     * @param {Element} item Accordion item that received the interaction.
     * @param {boolean} open Whether that item should open.
     */
    function setFaqItem(item, open) {
        faq.querySelectorAll('.accordion-item').forEach(function (entry) {
            var isOpen = open && entry === item;

            entry.classList.toggle('active', isOpen);
            entry.querySelector('.accordion-item-title').setAttribute('aria-expanded', String(isOpen));
        });
    }

    /**
     * Toggles an FAQ item from a click, Enter, or Space.
     * @param {Event} event Interaction event from the accordion.
     */
    function handleFaq(event) {
        var title = event.target.closest('.accordion-item-title');
        var item;

        if (!title || (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')) {
            return;
        }
        if (event.type === 'keydown') {
            event.preventDefault();
        }

        item = title.closest('.accordion-item');
        setFaqItem(item, !item.classList.contains('active'));
    }

    themeToggle.addEventListener('click', handleThemeToggle);
    document.addEventListener('click', handlePageClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (faq) {
        faq.addEventListener('click', handleFaq);
        faq.addEventListener('keydown', handleFaq);
    }
    if (typeof desktopQuery.addEventListener === 'function') {
        desktopQuery.addEventListener('change', handleViewportChange);
    } else {
        desktopQuery.addListener(handleViewportChange);
    }
    applyTheme(document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light', false);
    handleScroll();
})();
