(function () {
    'use strict';

    var THEME_KEY = 'ex-bistro-theme';
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');

    /**
     * Applies the navigation open state to the toggle and the panel.
     * @param {boolean} open Whether the panel is open.
     * @returns {void}
     */
    function setNav(open) {
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        panel.hidden = !open;
    }

    /**
     * Handles the toggle click, Escape, and presses outside the panel.
     * @param {Event} event Click or key press event from the document.
     * @returns {void}
     */
    function handleNav(event) {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        if (event.type === 'keydown') {
            if (open && event.key === 'Escape') {
                setNav(false);
                toggle.focus();
            }
            return;
        }
        if (open || toggle.contains(event.target)) {
            setNav(toggle.contains(event.target) ? !open : false);
        }
    }

    /**
     * Applies a theme to the root classes, the meta tag, and the toggle.
     * @param {string} theme Theme to apply, "light" or "dark".
     * @returns {void}
     */
    function applyTheme(theme) {
        var dark = theme === 'dark';
        document.documentElement.classList.toggle('theme-dark', dark);
        document.documentElement.classList.toggle('theme-light', !dark);
        document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#13160f' : '#f7f1e4');
        var themeToggle = document.querySelector('[data-theme-toggle]');
        themeToggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (error) {
            return;
        }
    }

    /**
     * Flips between the light and dark palettes.
     * @returns {void}
     */
    function onThemeToggle() {
        applyTheme(document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark');
    }

    /**
     * Validates the reservation form and confirms instead of sending it.
     * @param {SubmitEvent} event Submit event from the reservation form.
     * @returns {void}
     */
    function onReserve(event) {
        event.preventDefault();
        var form = event.currentTarget;
        Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (field) {
            field.closest('.form-field').classList.toggle('error', !field.checkValidity());
        });
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        form.hidden = true;
        document.querySelector('[data-reservation-status]').hidden = false;
        document.querySelector('[data-reservation-status]').focus();
    }

    if (toggle && panel) {
        document.addEventListener('keydown', handleNav);
        document.addEventListener('click', handleNav);
    }
    var stored = null;
    try {
        stored = localStorage.getItem(THEME_KEY);
    } catch (error) {
        stored = null;
    }
    var wantsDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(wantsDark ? 'dark' : 'light');
    document.querySelector('[data-theme-toggle]').addEventListener('click', onThemeToggle);
    document.querySelector('[data-reservation]').addEventListener('submit', onReserve);
})();
