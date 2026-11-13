(function () {
    'use strict';

    var THEME_KEY = 'foxtail-theme';
    var THEME_COLORS = { light: '#f7f1e6', dark: '#171a14' };
    var root = document.documentElement;

    /** Applies one theme to the page, the toggle, and browser chrome. */
    function applyTheme(theme) {
        var dark = theme === 'dark';
        var toggle = document.querySelector('[data-theme-toggle]');
        var meta = document.querySelector('meta[name="theme-color"]');
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(dark ? 'theme-dark' : 'theme-light');
        if (toggle) {
            toggle.setAttribute('aria-pressed', String(dark));
            toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        }
        if (meta) {
            meta.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light);
        }
    }

    /** Restores the saved or system theme, then wires the theme toggle. */
    function initTheme() {
        var saved = null;
        var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        try {
            saved = window.localStorage.getItem(THEME_KEY);
        } catch (error) {
            saved = null;
        }
        applyTheme(saved || system);
        var toggle = document.querySelector('[data-theme-toggle]');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            var next = root.classList.contains('theme-dark') ? 'light' : 'dark';
            applyTheme(next);
            try {
                window.localStorage.setItem(THEME_KEY, next);
            } catch (error) {
                return;
            }
        });
    }

    /** Wires the menu toggle, Escape and outside dismissal, and focus return. */
    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-menu-panel]');
        if (!toggle || !panel) {
            return;
        }

        /** Applies the open state and optionally restores focus to the toggle. */
        function setOpen(next, returnFocus) {
            toggle.setAttribute('aria-expanded', String(next));
            toggle.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
            panel.hidden = !next;
            if (!next && returnFocus) {
                toggle.focus();
            }
        }

        /** Closes the panel on Escape or on a press outside the header. */
        function handleDismiss(event) {
            var outside = event.type === 'pointerdown' && !panel.contains(event.target) && !toggle.contains(event.target);
            if (!panel.hidden && (event.key === 'Escape' || outside)) {
                setOpen(false, event.type === 'keydown');
            }
        }

        toggle.addEventListener('click', function () {
            setOpen(panel.hidden, false);
        });
        panel.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function () {
                setOpen(false, false);
            });
        });
        document.addEventListener('keydown', handleDismiss);
        document.addEventListener('pointerdown', handleDismiss);
    }

    /** Adds one to the bag count and confirms the click on its card. */
    function initCart() {
        var counter = document.querySelector('[data-cart-count]');
        var count = 0;
        document.querySelectorAll('[data-add-to-cart]').forEach(function (button) {
            var label = button.textContent.trim();
            button.addEventListener('click', function () {
                count += 1;
                if (counter) {
                    counter.textContent = String(count);
                }
                button.textContent = 'Added';
                var card = button.closest('.ex-shop-product') || button.closest('.card');
                var status = card ? card.querySelector('[data-cart-status]') : null;
                if (status) {
                    status.textContent = button.getAttribute('data-product') + ' is in your bag.';
                }
                window.setTimeout(function () {
                    button.textContent = label;
                }, 1800);
            });
        });
    }

    initTheme();
    initMenu();
    initCart();
})();
