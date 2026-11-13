(function () {
    'use strict';

    var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var desktopQuery = window.matchMedia('(min-width: 1024px)');

    /**
     * Returns the first element that matches a selector inside a scope.
     * @param {string} selector CSS selector to find.
     * @param {ParentNode} [scope] Element or document to search within.
     * @returns {Element|null} The matching element, or null when absent.
     */
    function selectElement(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    /**
     * Converts an array-like collection into a real array.
     * @param {ArrayLike<Element>} collection Nodes to convert.
     * @returns {Element[]} A plain array of the same nodes.
     */
    function toArray(collection) {
        return Array.prototype.slice.call(collection);
    }

    /**
     * Subscribes to a media query change with a fallback for older browsers.
     * @param {MediaQueryList} query Media query to watch.
     * @param {Function} handler Callback invoked when the match changes.
     * @returns {void}
     */
    function onMediaChange(query, handler) {
        if (typeof query.addEventListener === 'function') {
            query.addEventListener('change', handler);
            return;
        }

        if (typeof query.addListener === 'function') {
            query.addListener(handler);
        }
    }

    /**
     * Wires the mobile menu toggle, outside clicks, Escape, scroll lock, and resize.
     * @returns {void}
     */
    function initMobileMenu() {
        var toggle = selectElement('[data-menu-toggle]');
        var panel = selectElement('[data-menu-panel]');

        if (!toggle || !panel) {
            return;
        }

        /**
         * Reports whether the mobile panel is currently expanded.
         * @returns {boolean} True when the panel is open.
         */
        function isMenuOpen() {
            return toggle.getAttribute('aria-expanded') === 'true';
        }

        /**
         * Applies the open or closed state to the panel, toggle, and page scroll.
         * @param {boolean} open Whether the menu should be open.
         * @param {boolean} returnFocus Whether focus should return to the toggle.
         * @returns {void}
         */
        function setMenuState(open, returnFocus) {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            panel.hidden = !open;
            document.documentElement.classList.toggle('ex-company-menu-open', open);

            if (!open && returnFocus) {
                toggle.focus();
            }
        }

        /**
         * Closes the menu when a pointer press lands outside the header controls.
         * @param {PointerEvent} event Pointer press anywhere in the document.
         * @returns {void}
         */
        function handleOutsidePointer(event) {
            if (!isMenuOpen()) {
                return;
            }

            if (panel.contains(event.target) || toggle.contains(event.target)) {
                return;
            }

            setMenuState(false, false);
        }

        /**
         * Closes the menu when Escape is pressed anywhere on the page.
         * @param {KeyboardEvent} event Key press event.
         * @returns {void}
         */
        function handleEscape(event) {
            if (event.key !== 'Escape' || !isMenuOpen()) {
                return;
            }

            setMenuState(false, true);
        }

        /**
         * Closes the menu when the layout grows to the desktop breakpoint.
         * @returns {void}
         */
        function handleDesktopChange() {
            if (desktopQuery.matches && isMenuOpen()) {
                setMenuState(false, false);
            }
        }

        toggle.addEventListener('click', function () {
            setMenuState(!isMenuOpen(), false);
        });

        document.addEventListener('pointerdown', handleOutsidePointer);
        document.addEventListener('keydown', handleEscape);

        window.addEventListener(
            'scroll',
            function () {
                if (isMenuOpen()) {
                    setMenuState(false, false);
                }
            },
            { passive: true },
        );

        toArray(panel.querySelectorAll('a')).forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuState(false, false);
            });
        });

        onMediaChange(desktopQuery, handleDesktopChange);
    }

    /**
     * Adds the elevated header class once the page has scrolled away from the top.
     * @returns {void}
     */
    function initHeaderState() {
        var header = selectElement('[data-header]');

        if (!header) {
            return;
        }

        var ticking = false;

        /**
         * Reads the scroll position and syncs the header state.
         * @returns {void}
         */
        function updateHeaderState() {
            ticking = false;
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        }

        /**
         * Queues one header update per animation frame.
         * @returns {void}
         */
        function requestHeaderUpdate() {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(updateHeaderState);
        }

        window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
        updateHeaderState();
    }

    /**
     * Reveals marked sections as they enter the viewport, unless motion is reduced.
     * @returns {void}
     */
    function initReveals() {
        var items = toArray(document.querySelectorAll('[data-reveal]'));

        if (!items.length || !('IntersectionObserver' in window) || reducedMotionQuery.matches) {
            return;
        }

        document.documentElement.classList.add('ex-company-reveal-ready');

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
        );

        items.forEach(function (item) {
            observer.observe(item);
        });

        onMediaChange(reducedMotionQuery, function (event) {
            if (!event.matches) {
                return;
            }

            items.forEach(function (item) {
                item.classList.add('is-revealed');
                observer.unobserve(item);
            });
        });
    }

    /**
     * Formats a counter value with thousands separators and fixed decimals.
     * @param {number} value Numeric value to format.
     * @param {number} decimals Number of decimal places to keep.
     * @returns {string} The formatted value.
     */
    function formatCounterValue(value, decimals) {
        var safeValue = Number.isFinite(value) ? value : 0;
        var fixed = safeValue.toFixed(decimals);
        var parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    /**
     * Animates one counter from zero to its data target over a short duration.
     * @param {HTMLElement} element Counter element to update.
     * @returns {void}
     */
    function animateCounter(element) {
        var target = parseFloat(element.getAttribute('data-counter-target'));
        var decimals = parseInt(element.getAttribute('data-counter-decimals'), 10);
        var duration = 1500;
        var startTime = null;

        if (!Number.isFinite(target)) {
            return;
        }

        if (!Number.isFinite(decimals) || decimals < 0) {
            decimals = 0;
        }

        /**
         * Advances one animation frame of the counter.
         * @param {number} timestamp Frame timestamp supplied by the browser.
         * @returns {void}
         */
        function step(timestamp) {
            if (startTime === null) {
                startTime = timestamp;
            }

            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);

            element.textContent = formatCounterValue(target * eased, decimals);

            if (progress < 1) {
                window.requestAnimationFrame(step);
                return;
            }

            element.textContent = formatCounterValue(target, decimals);
        }

        window.requestAnimationFrame(step);
    }

    /**
     * Starts each stats counter the first time it becomes visible.
     * @returns {void}
     */
    function initCounters() {
        var counters = toArray(document.querySelectorAll('[data-counter]'));

        if (!counters.length) {
            return;
        }

        /**
         * Writes the final value without animation.
         * @param {HTMLElement} element Counter element to settle.
         * @returns {void}
         */
        function setFinalValue(element) {
            var target = parseFloat(element.getAttribute('data-counter-target'));
            var decimals = parseInt(element.getAttribute('data-counter-decimals'), 10);

            if (!Number.isFinite(target)) {
                return;
            }

            if (!Number.isFinite(decimals) || decimals < 0) {
                decimals = 0;
            }

            element.textContent = formatCounterValue(target, decimals);
        }

        if (!('IntersectionObserver' in window) || reducedMotionQuery.matches) {
            counters.forEach(setFinalValue);
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.45 }
        );

        counters.forEach(function (counter) {
            observer.observe(counter);
        });

        onMediaChange(reducedMotionQuery, function (event) {
            if (!event.matches) {
                return;
            }

            counters.forEach(function (counter) {
                observer.unobserve(counter);
                setFinalValue(counter);
            });
        });
    }

    /**
     * Wires one tab group with selection, roving tabindex, and arrow-key support.
     * @param {HTMLElement} group Element carrying the data-tabs attribute.
     * @returns {void}
     */
    function setupTabGroup(group) {
        var tabs = toArray(group.querySelectorAll('[role="tab"]'));
        var panels = toArray(group.querySelectorAll('[role="tabpanel"]'));

        if (!tabs.length || !panels.length) {
            return;
        }

        /**
         * Selects one tab and shows the panel it controls.
         * @param {HTMLElement} activeTab Tab to select.
         * @param {boolean} moveFocus Whether keyboard focus should follow selection.
         * @returns {void}
         */
        function activateTab(activeTab, moveFocus) {
            tabs.forEach(function (tab) {
                var selected = tab === activeTab;
                tab.setAttribute('aria-selected', selected ? 'true' : 'false');
                tab.setAttribute('tabindex', selected ? '0' : '-1');

                var panelId = tab.getAttribute('aria-controls');
                var panel = panelId ? document.getElementById(panelId) : null;

                if (panel) {
                    panel.classList.toggle('active', selected);
                }
            });

            if (moveFocus) {
                activeTab.focus();
            }
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                activateTab(tab, false);
            });

            tab.addEventListener('keydown', function (event) {
                var nextIndex = index;

                if (event.key === 'ArrowRight') {
                    nextIndex = (index + 1) % tabs.length;
                } else if (event.key === 'ArrowLeft') {
                    nextIndex = (index - 1 + tabs.length) % tabs.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = tabs.length - 1;
                } else {
                    return;
                }

                event.preventDefault();
                activateTab(tabs[nextIndex], true);
            });
        });
    }

    /**
     * Finds every tab group on the page and initializes it.
     * @returns {void}
     */
    function initTabs() {
        toArray(document.querySelectorAll('[data-tabs]')).forEach(setupTabGroup);
    }

    /**
     * Handles the newsletter form without a network request.
     * @returns {void}
     */
    function initNewsletter() {
        var form = selectElement('[data-newsletter]');

        if (!form) {
            return;
        }

        var input = selectElement('input[type="email"]', form);
        var status = selectElement('[data-newsletter-status]', form);

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!input) {
                return;
            }

            if (!input.checkValidity()) {
                input.reportValidity();
                return;
            }

            if (status) {
                status.textContent = 'Thanks - check your inbox to confirm your subscription.';
            }

            form.reset();
        });
    }

    /**
     * Highlights the header link for the section currently in view.
     * @returns {void}
     */
    function initActiveNav() {
        var links = toArray(document.querySelectorAll('[data-nav-link]'));
        var entries = [];
        var ticking = false;

        links.forEach(function (link) {
            var href = link.getAttribute('href');

            if (!href || href.charAt(0) !== '#' || href.length < 2) {
                return;
            }

            var section = document.getElementById(href.slice(1));

            if (section) {
                entries.push({ link: link, section: section });
            }
        });

        if (!entries.length) {
            return;
        }

        /**
         * Marks one nav entry as current and clears the rest.
         * @param {Object|null} activeEntry Entry to highlight, or null for none.
         * @returns {void}
         */
        function setActiveLink(activeEntry) {
            entries.forEach(function (entry) {
                var active = entry === activeEntry;
                entry.link.classList.toggle('is-active', active);

                if (active) {
                    entry.link.setAttribute('aria-current', 'location');
                } else {
                    entry.link.removeAttribute('aria-current');
                }
            });
        }

        /**
         * Chooses the section nearest the top of the viewport and highlights its link.
         * @returns {void}
         */
        function updateActiveLink() {
            ticking = false;

            var current = null;

            entries.forEach(function (entry) {
                if (entry.section.getBoundingClientRect().top <= 120) {
                    current = entry;
                }
            });

            var nearPageEnd =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

            if (nearPageEnd) {
                current = entries[entries.length - 1];
            }

            setActiveLink(current);
        }

        /**
         * Queues one nav update per animation frame.
         * @returns {void}
         */
        function requestNavUpdate() {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(updateActiveLink);
        }

        window.addEventListener('scroll', requestNavUpdate, { passive: true });
        window.addEventListener('resize', requestNavUpdate);
        updateActiveLink();
    }

    /**
     * Starts every page controller after the document is parsed.
     * @returns {void}
     */
    function init() {
        initMobileMenu();
        initHeaderState();
        initReveals();
        initCounters();
        initTabs();
        initNewsletter();
        initActiveNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    init();
})();
