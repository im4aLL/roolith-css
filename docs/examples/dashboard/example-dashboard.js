(function () {
    'use strict';

    var CHART_WIDTH = 720;
    var CHART_HEIGHT = 240;
    var CHART_PAD = 12;
    var CHART_BASE = 228;
    var THEME_KEY = 'pulse-theme';

    var state = {
        theme: 'light',
        period: '30d',
        compare: true,
        sidebarOpen: false,
        modalOpen: false,
        modalTrigger: null,
        currentPoints: [],
        currentPeriod: null
    };

    var activeMenu = null;
    var toastTimer = null;

    var PERIODS = {
        '7d': {
            totalValue: 34280,
            totalDisplay: '34,280',
            totalLabel: '$34,280',
            compareLabel: '$29,500',
            compareSummary: 'vs. $29,500 in the previous 7 days',
            legendLabel: 'Previous 7 days',
            delta: '16.2%',
            direction: 'is-upward',
            chip: 'is-up',
            days: 7,
            axisMax: 8000,
            axis: ['$8k', '$6k', '$4k', '$2k', '$0'],
            labels: ['Jun 6', 'Jun 7', 'Jun 8', 'Jun 9', 'Jun 10', 'Jun 11', 'Jun 12'],
            values: [3.6, 4.2, 3.9, 5.1, 4.8, 5.6, 7.08],
            compare: [3.2, 3.5, 3.8, 4.1, 4.2, 5.0, 5.7],
            chartTitle: 'Revenue over the last 7 days',
            chartDesc: 'Revenue rose from $3,600 to $7,080 over the last 7 days, with a total of $34,280 compared with $29,500 in the previous 7 days.'
        },
        '30d': {
            totalValue: 128430,
            totalDisplay: '128,430',
            totalLabel: '$128,430',
            compareLabel: '$108,650',
            compareSummary: 'vs. $108,650 in the previous 30 days',
            legendLabel: 'Previous 30 days',
            delta: '18.2%',
            direction: 'is-upward',
            chip: 'is-up',
            days: 30,
            axisMax: 20000,
            axis: ['$20k', '$15k', '$10k', '$5k', '$0'],
            labels: ['May 14', 'May 17', 'May 20', 'May 23', 'May 26', 'May 29', 'Jun 1', 'Jun 4', 'Jun 6', 'Jun 8', 'Jun 10', 'Jun 12'],
            values: [7.2, 8.1, 7.8, 9.4, 8.9, 10.6, 11.2, 10.4, 12.3, 11.8, 13.6, 17.13],
            compare: [6.4, 6.9, 7.1, 7.8, 8.2, 8.6, 9.1, 8.8, 10.2, 9.9, 11.0, 14.65],
            chartTitle: 'Revenue over the last 30 days',
            chartDesc: 'Revenue rose from $7,200 to $17,130 over the last 30 days, with a total of $128,430 compared with $108,650 in the previous 30 days.'
        },
        '12m': {
            totalValue: 1482900,
            totalDisplay: '1,482,900',
            totalLabel: '$1,482,900',
            compareLabel: '$1,116,300',
            compareSummary: 'vs. $1,116,300 in the previous 12 months',
            legendLabel: 'Previous 12 months',
            delta: '32.8%',
            direction: 'is-upward',
            chip: 'is-up',
            days: 365,
            axisMax: 240000,
            axis: ['$240k', '$180k', '$120k', '$60k', '$0'],
            labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [78, 86, 92, 105, 99, 118, 124, 131, 142, 138, 155, 214.9],
            compare: [64, 70, 74, 82, 79, 90, 96, 101, 110, 108, 120, 122.3],
            chartTitle: 'Revenue over the last 12 months',
            chartDesc: 'Revenue rose from $78,000 to $214,900 over the last 12 months, with a total of $1,482,900 compared with $1,116,300 in the previous 12 months.'
        }
    };

    var currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    /**
     * Queries one element and returns null when it is missing.
     * @param {string} selector CSS selector to resolve.
     * @param {ParentNode} [root] Optional query root.
     * @returns {Element|null} The first matching element or null.
     */
    function qs(selector, root) {
        var scope = root || document;
        return scope.querySelector(selector);
    }

    /**
     * Queries all matching elements as a real array.
     * @param {string} selector CSS selector to resolve.
     * @param {ParentNode} [root] Optional query root.
     * @returns {Element[]} Matching elements.
     */
    function qsa(selector, root) {
        var scope = root || document;
        return Array.prototype.slice.call(scope.querySelectorAll(selector));
    }

    /**
     * Formats a number as whole US dollars.
     * @param {number} value Amount in dollars.
     * @returns {string} Formatted currency string.
     */
    function formatCurrency(value) {
        return currencyFormatter.format(value);
    }

    /**
     * Rounds a chart coordinate to two decimal places.
     * @param {number} value Coordinate value.
     * @returns {number} Rounded coordinate.
     */
    function roundCoordinate(value) {
        return Math.round(value * 100) / 100;
    }

    /**
     * Updates the text of an element by id, when the element exists.
     * @param {string} id Element id.
     * @param {string} text Replacement text.
     * @returns {void}
     */
    function setTextById(id, text) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Returns the theme stored in localStorage, defaulting to light.
     * @returns {string} Either dark or light.
     */
    function getStoredTheme() {
        try {
            return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
        } catch (error) {
            return 'light';
        }
    }

    /**
     * Applies a theme to the document and updates the toggle state.
     * @param {string} theme Theme name, dark or light.
     * @param {boolean} persist Whether to store the choice.
     * @returns {void}
     */
    function applyTheme(theme, persist) {
        var root = document.documentElement;
        var next = theme === 'dark' ? 'dark' : 'light';
        var toggle = document.getElementById('theme-toggle');
        var meta = qs('meta[name="theme-color"]');

        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(next === 'dark' ? 'theme-dark' : 'theme-light');
        state.theme = next;

        if (toggle) {
            var isDark = next === 'dark';
            toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        }

        if (meta) {
            meta.setAttribute('content', next === 'dark' ? '#0c0c0c' : '#f6f7f9');
        }

        if (persist) {
            try {
                window.localStorage.setItem(THEME_KEY, next);
            } catch (error) {
                return;
            }
        }
    }

    /**
     * Wires the light and dark theme toggle.
     * @returns {void}
     */
    function initThemeToggle() {
        var toggle = document.getElementById('theme-toggle');
        applyTheme(getStoredTheme(), false);

        if (!toggle) {
            return;
        }

        toggle.addEventListener('click', function () {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark', true);
        });
    }

    /**
     * Keeps the document scroll lock in sync with every open surface.
     * @returns {void}
     */
    function updateScrollLock() {
        var locked = state.sidebarOpen || state.modalOpen;
        document.body.classList.toggle('ex-dashboard-scroll-locked', locked);
    }

    /**
     * Returns the focusable children of a container that are currently rendered.
     * @param {Element} container Focus scope.
     * @returns {HTMLElement[]} Focusable elements in document order.
     */
    function getFocusable(container) {
        if (!container) {
            return [];
        }

        return qsa('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container).filter(function (element) {
            return element.getClientRects().length > 0;
        });
    }

    /**
     * Returns the menu items inside a menu panel.
     * @param {Element} panel Menu panel.
     * @returns {HTMLElement[]} Items with a menu item role.
     */
    function getMenuItems(panel) {
        if (!panel) {
            return [];
        }

        return qsa('[role^="menuitem"]', panel).filter(function (item) {
            return item.getAttribute('aria-disabled') !== 'true';
        });
    }

    /**
     * Keeps Tab navigation inside a focus scope.
     * @param {Element} container Focus scope.
     * @param {KeyboardEvent} event Keyboard event.
     * @returns {void}
     */
    function trapFocus(container, event) {
        if (event.key !== 'Tab') {
            return;
        }

        var focusable = getFocusable(container);
        if (!focusable.length) {
            event.preventDefault();
            if (container instanceof HTMLElement) {
                container.focus();
            }
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    /**
     * Opens one menu and closes any other open menu.
     * @param {object} controller Menu controller from createMenu.
     * @returns {void}
     */
    function openMenu(controller) {
        if (!controller) {
            return;
        }

        if (activeMenu && activeMenu !== controller) {
            closeMenu(activeMenu, false);
        }

        controller.isOpen = true;
        controller.root.classList.add('is-open');
        controller.panel.hidden = false;
        controller.trigger.setAttribute('aria-expanded', 'true');
        activeMenu = controller;

        var items = getMenuItems(controller.panel);
        var focusable = items.length ? items : getFocusable(controller.panel);
        if (focusable.length) {
            focusable[0].focus({ preventScroll: true });
        }
    }

    /**
     * Closes a menu and optionally returns focus to its trigger.
     * @param {object} controller Menu controller from createMenu.
     * @param {boolean} returnFocus Whether to focus the trigger.
     * @returns {void}
     */
    function closeMenu(controller, returnFocus) {
        if (!controller) {
            return;
        }

        controller.isOpen = false;
        controller.root.classList.remove('is-open');
        controller.panel.hidden = true;
        controller.trigger.setAttribute('aria-expanded', 'false');

        if (activeMenu === controller) {
            activeMenu = null;
        }

        if (returnFocus) {
            controller.trigger.focus({ preventScroll: true });
        }
    }

    /**
     * Builds a menu controller for one trigger and panel pair.
     * @param {Element} root Wrapper carrying the data-menu attribute.
     * @returns {object|null} Menu controller or null when the markup is incomplete.
     */
    function createMenu(root) {
        var trigger = qs('[data-menu-trigger]', root);
        var panel = qs('[data-menu-panel]', root);

        if (!trigger || !panel) {
            return null;
        }

        var controller = {
            root: root,
            trigger: trigger,
            panel: panel,
            isOpen: false
        };

        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (controller.isOpen) {
                closeMenu(controller, true);
            } else {
                openMenu(controller);
            }
        });

        trigger.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                openMenu(controller);
            }
        });

        panel.addEventListener('click', function (event) {
            var target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            var action = target.closest('a, button, [role^="menuitem"]');
            if (action && panel.contains(action)) {
                closeMenu(controller, true);
            }
        });

        return controller;
    }

    /**
     * Wires every data-menu surface on the page.
     * @returns {void}
     */
    function initMenus() {
        qsa('[data-menu]').forEach(function (root) {
            createMenu(root);
        });

        document.addEventListener('pointerdown', function (event) {
            var target = event.target;
            if (!activeMenu || !(target instanceof Node)) {
                return;
            }

            if (!activeMenu.root.contains(target)) {
                closeMenu(activeMenu, false);
            }
        });

        document.addEventListener('focusin', function (event) {
            var target = event.target;
            if (!activeMenu || !(target instanceof Node)) {
                return;
            }

            if (!activeMenu.root.contains(target)) {
                closeMenu(activeMenu, false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (!activeMenu) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu(activeMenu, true);
                return;
            }

            if (event.key === 'Tab') {
                if (activeMenu.panel.getAttribute('role') === 'menu') {
                    closeMenu(activeMenu, true);
                }
                return;
            }

            if (activeMenu.panel.getAttribute('role') !== 'menu') {
                return;
            }

            var items = getMenuItems(activeMenu.panel);
            if (!items.length) {
                return;
            }

            var currentIndex = items.indexOf(document.activeElement);
            var nextIndex = -1;

            if (event.key === 'ArrowDown') {
                nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
            } else if (event.key === 'ArrowUp') {
                nextIndex = currentIndex === -1 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = items.length - 1;
            }

            if (nextIndex > -1) {
                event.preventDefault();
                items[nextIndex].focus();
            }
        });
    }

    /**
     * Wires the workspace switcher menu.
     * @returns {void}
     */
    function initWorkspaceSwitcher() {
        var options = qsa('[data-workspace-option]');
        var name = document.getElementById('workspace-name');
        var plan = document.getElementById('workspace-plan');

        if (!options.length || !name) {
            return;
        }

        options.forEach(function (option) {
            option.addEventListener('click', function () {
                options.forEach(function (item) {
                    item.classList.remove('is-selected');
                    item.setAttribute('aria-checked', 'false');
                });

                option.classList.add('is-selected');
                option.setAttribute('aria-checked', 'true');

                name.textContent = option.getAttribute('data-workspace-name') || 'Workspace';

                if (plan) {
                    plan.textContent = option.getAttribute('data-workspace-plan') || '';
                }

                showToast('Switched to ' + name.textContent + '.');
            });
        });
    }

    /**
     * Wires the notification mark-all-read action.
     * @returns {void}
     */
    function initNotifications() {
        var button = document.getElementById('mark-notifications-read');
        var trigger = document.getElementById('notifications-trigger');
        var dot = document.getElementById('notification-dot');

        if (!button) {
            return;
        }

        button.addEventListener('click', function () {
            if (dot) {
                dot.hidden = true;
            }

            if (trigger) {
                trigger.setAttribute('aria-label', 'Notifications');
            }

            showToast('All notifications marked as read.');
        });
    }

    /**
     * Wires order row copy and demo toast actions.
     * @returns {void}
     */
    function initRowActions() {
        document.addEventListener('click', function (event) {
            var target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            var copyButton = target.closest('[data-copy-order]');
            if (copyButton) {
                event.preventDefault();
                var orderId = copyButton.getAttribute('data-copy-order');
                if (!orderId) {
                    return;
                }

                if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    try {
                        navigator.clipboard.writeText(orderId).then(function () {
                            showToast('Order ID ' + orderId + ' copied.');
                        }).catch(function () {
                            showToast('Order ID: ' + orderId);
                        });
                    } catch (error) {
                        showToast('Order ID: ' + orderId);
                    }
                } else {
                    showToast('Order ID: ' + orderId);
                }
                return;
            }

            var toastButton = target.closest('[data-toast]');
            if (toastButton) {
                event.preventDefault();
                var message = toastButton.getAttribute('data-toast');
                if (message) {
                    showToast(message);
                }
            }
        });
    }

    /**
     * Builds scaled chart points from a set of dollar thousands values.
     * @param {number[]} values Values in thousands of dollars.
     * @param {number} axisMax Top value of the vertical axis.
     * @returns {{x: number, y: number}[]} Scaled points.
     */
    function buildChartPoints(values, axisMax) {
        var innerHeight = CHART_BASE - CHART_PAD;
        var lastIndex = values.length - 1;

        return values.map(function (value, index) {
            var x = lastIndex === 0 ? 0 : (index / lastIndex) * CHART_WIDTH;
            var ratio = axisMax > 0 ? (value * 1000) / axisMax : 0;
            var y = CHART_PAD + (1 - ratio) * innerHeight;

            return {
                x: roundCoordinate(x),
                y: roundCoordinate(y)
            };
        });
    }

    /**
     * Converts chart points into a smooth cubic Bezier path.
     * @param {{x: number, y: number}[]} points Scaled chart points.
     * @returns {string} SVG path data.
     */
    function buildSmoothPath(points) {
        if (!points.length) {
            return '';
        }

        if (points.length === 1) {
            return 'M ' + points[0].x + ' ' + points[0].y;
        }

        var path = 'M ' + points[0].x + ' ' + points[0].y;

        for (var index = 0; index < points.length - 1; index += 1) {
            var previous = points[index - 1] || points[index];
            var current = points[index];
            var next = points[index + 1];
            var after = points[index + 2] || next;

            var controlOneX = roundCoordinate(current.x + (next.x - previous.x) / 6);
            var controlOneY = roundCoordinate(current.y + (next.y - previous.y) / 6);
            var controlTwoX = roundCoordinate(next.x - (after.x - current.x) / 6);
            var controlTwoY = roundCoordinate(next.y - (after.y - current.y) / 6);

            path += ' C ' + controlOneX + ' ' + controlOneY + ', ' + controlTwoX + ' ' + controlTwoY + ', ' + next.x + ' ' + next.y;
        }

        return path;
    }

    /**
     * Hides the revenue chart hover cursor and tooltip.
     * @returns {void}
     */
    function hideChartHover() {
        var cursor = document.getElementById('revenue-cursor');
        var tooltip = document.getElementById('revenue-tooltip');

        if (cursor) {
            cursor.style.opacity = '0';
        }

        if (tooltip) {
            tooltip.hidden = true;
        }
    }

    /**
     * Positions the chart hover cursor and tooltip for the nearest data point.
     * @param {PointerEvent} event Pointer movement event.
     * @returns {void}
     */
    function handleRevenuePointer(event) {
        var plot = document.getElementById('revenue-plot');
        var cursor = document.getElementById('revenue-cursor');
        var tooltip = document.getElementById('revenue-tooltip');
        var period = state.currentPeriod;
        var points = state.currentPoints;

        if (!plot || !cursor || !tooltip || !period || !points.length) {
            return;
        }

        if (event.pointerType === 'touch') {
            return;
        }

        var rect = plot.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return;
        }

        var ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        var index = Math.round(ratio * (points.length - 1));
        var point = points[index];
        var xPercent = (point.x / CHART_WIDTH) * 100;
        var yPercent = (point.y / CHART_HEIGHT) * 100;

        cursor.style.left = xPercent + '%';
        cursor.style.opacity = '1';

        var label = document.createElement('span');
        label.className = 'ex-dashboard-tooltip-label';
        label.textContent = period.labels[index];

        var value = document.createElement('strong');
        value.textContent = formatCurrency(period.values[index] * 1000);

        tooltip.replaceChildren(label, value);

        if (state.compare) {
            var compare = document.createElement('span');
            compare.className = 'ex-dashboard-tooltip-compare';
            compare.textContent = 'Previous: ' + formatCurrency(period.compare[index] * 1000);
            tooltip.appendChild(compare);
        }

        tooltip.hidden = false;
        tooltip.style.top = yPercent + '%';

        var tooltipWidth = tooltip.offsetWidth || 130;
        var x = (xPercent / 100) * rect.width;
        var left = Math.min(Math.max(x, tooltipWidth / 2 + 4), rect.width - tooltipWidth / 2 - 4);
        tooltip.style.left = left + 'px';
        tooltip.classList.toggle('is-below', yPercent < 28);
    }

    /**
     * Updates every number, path, label, and accessibility description for a period.
     * @param {string} key Period key.
     * @returns {void}
     */
    function renderRevenue(key) {
        var period = PERIODS[key];
        if (!period) {
            return;
        }

        var line = document.getElementById('revenue-line');
        var area = document.getElementById('revenue-area');
        var compareLine = document.getElementById('revenue-compare-line');
        var marker = document.getElementById('revenue-marker');
        var deltaChip = document.getElementById('revenue-delta-chip');
        var delta = document.getElementById('revenue-delta');
        var panel = document.getElementById('revenue-panel');
        var xAxis = document.getElementById('revenue-xaxis');
        var yAxis = document.getElementById('revenue-yaxis');
        var chartTitle = document.getElementById('revenue-chart-title');
        var chartDesc = document.getElementById('revenue-chart-desc');
        var points = buildChartPoints(period.values, period.axisMax);
        var comparePoints = buildChartPoints(period.compare, period.axisMax);
        var linePath = buildSmoothPath(points);

        state.currentPeriod = period;
        state.currentPoints = points;

        if (line) {
            line.setAttribute('d', linePath);
        }

        if (area) {
            area.setAttribute('d', linePath + ' L ' + CHART_WIDTH + ' ' + CHART_BASE + ' L 0 ' + CHART_BASE + ' Z');
        }

        if (compareLine) {
            compareLine.setAttribute('d', buildSmoothPath(comparePoints));
            compareLine.style.display = state.compare ? '' : 'none';
        }

        if (marker && points.length) {
            marker.style.left = '100%';
            marker.style.top = (points[points.length - 1].y / CHART_HEIGHT) * 100 + '%';
        }

        if (delta) {
            delta.classList.remove('is-upward', 'is-downward', 'is-flat');
            delta.classList.add(period.direction);
            delta.textContent = period.delta;
        }

        if (deltaChip) {
            deltaChip.classList.remove('is-up', 'is-down');
            deltaChip.classList.add(period.chip);
        }

        setTextById('revenue-total', period.totalDisplay);
        setTextById('revenue-compare-summary', period.compareSummary);
        setTextById('revenue-compare-legend', period.legendLabel);
        setTextById('revenue-summary-total', period.totalLabel);
        setTextById('revenue-summary-compare', period.compareLabel);
        setTextById('revenue-summary-daily', formatCurrency(Math.round(period.totalValue / period.days)));

        if (panel) {
            panel.setAttribute('aria-labelledby', 'period-tab-' + key);
        }

        if (xAxis) {
            xAxis.replaceChildren();
            period.labels.forEach(function (labelText) {
                var label = document.createElement('span');
                label.textContent = labelText;
                xAxis.appendChild(label);
            });
        }

        if (yAxis) {
            var yLabels = qsa('span', yAxis);
            period.axis.forEach(function (labelText, index) {
                if (yLabels[index]) {
                    yLabels[index].textContent = labelText;
                }
            });
        }

        if (chartTitle) {
            chartTitle.textContent = period.chartTitle;
        }

        if (chartDesc) {
            chartDesc.textContent = period.chartDesc;
        }

        hideChartHover();
    }

    /**
     * Selects a revenue period and updates the tabs, select, and chart.
     * @param {string} key Period key.
     * @param {boolean} focusTab Whether to move focus to the selected tab.
     * @returns {void}
     */
    function activatePeriod(key, focusTab) {
        if (!PERIODS[key]) {
            return;
        }

        state.period = key;

        var tabs = qsa('[data-period-tab]');
        var activeTab = null;

        tabs.forEach(function (tab) {
            var active = tab.getAttribute('data-period-tab') === key;
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
            tab.tabIndex = active ? 0 : -1;
            if (active) {
                activeTab = tab;
            }
        });

        var range = document.getElementById('date-range');
        if (range) {
            range.value = key;
        }

        renderRevenue(key);

        if (focusTab && activeTab) {
            activeTab.focus();
        }
    }

    /**
     * Wires the revenue tabs, date range select, and chart pointer hover.
     * @returns {void}
     */
    function initRevenueChart() {
        var tablist = qs('.ex-dashboard-tabs[role="tablist"]');
        var activeTab = qs('[data-period-tab][aria-selected="true"]');
        var initialKey = activeTab && activeTab.getAttribute('data-period-tab');

        if (!initialKey || !PERIODS[initialKey]) {
            initialKey = '30d';
        }

        if (tablist) {
            var tabs = qsa('[data-period-tab]', tablist);

            tabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    var key = tab.getAttribute('data-period-tab');
                    if (key) {
                        activatePeriod(key, false);
                    }
                });
            });

            tablist.addEventListener('keydown', function (event) {
                var currentIndex = tabs.indexOf(document.activeElement);
                var nextIndex = -1;

                if (event.key === 'ArrowRight') {
                    nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % tabs.length;
                } else if (event.key === 'ArrowLeft') {
                    nextIndex = currentIndex === -1 ? tabs.length - 1 : (currentIndex - 1 + tabs.length) % tabs.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = tabs.length - 1;
                }

                if (nextIndex > -1) {
                    event.preventDefault();
                    var nextTab = tabs[nextIndex];
                    var key = nextTab.getAttribute('data-period-tab');
                    if (key) {
                        activatePeriod(key, true);
                    }
                }
            });
        }

        var range = document.getElementById('date-range');
        if (range) {
            range.addEventListener('change', function () {
                activatePeriod(range.value, false);
            });
        }

        var plot = document.getElementById('revenue-plot');
        if (plot) {
            plot.addEventListener('pointermove', handleRevenuePointer);
            plot.addEventListener('pointerleave', hideChartHover);
            plot.addEventListener('pointercancel', hideChartHover);
        }

        activatePeriod(initialKey, false);
    }

    /**
     * Wires the comparison switch to the chart, legend, and summary.
     * @returns {void}
     */
    function initCompareToggle() {
        var input = document.getElementById('compare-toggle');
        if (!input) {
            return;
        }

        /**
         * Applies the current comparison state to the revenue card.
         * @returns {void}
         */
        function applyComparison() {
            state.compare = input.checked;

            var card = qs('.ex-dashboard-revenue');
            var compareLine = document.getElementById('revenue-compare-line');
            var legendItem = document.getElementById('revenue-compare-legend-item');
            var summaryBlock = document.getElementById('revenue-summary-compare-block');
            var summaryText = document.getElementById('revenue-compare-summary');

            if (card) {
                card.classList.toggle('is-compare-off', !state.compare);
            }

            if (compareLine) {
                compareLine.style.display = state.compare ? '' : 'none';
            }

            if (legendItem) {
                legendItem.hidden = !state.compare;
            }

            if (summaryBlock) {
                summaryBlock.hidden = !state.compare;
            }

            if (summaryText) {
                summaryText.hidden = !state.compare;
            }

            hideChartHover();
        }

        input.addEventListener('change', applyComparison);
        applyComparison();
    }

    /**
     * Opens the report modal and moves focus into the form.
     * @param {HTMLElement} modal Modal element.
     * @param {HTMLElement} trigger Element that opened the modal.
     * @returns {void}
     */
    function openReportModal(modal, trigger) {
        if (!modal) {
            return;
        }

        state.modalOpen = true;
        state.modalTrigger = trigger || document.activeElement;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        var app = qs('.ex-dashboard-app');
        if (app && 'inert' in app) {
            app.inert = true;
        }

        updateScrollLock();

        window.requestAnimationFrame(function () {
            var field = document.getElementById('report-name');
            var content = qs('.modal-content', modal);
            var target = field || content;
            if (target) {
                target.focus();
            }
        });
    }

    /**
     * Closes the report modal and restores focus to its trigger.
     * @param {HTMLElement} modal Modal element.
     * @param {boolean} returnFocus Whether to focus the opener.
     * @returns {void}
     */
    function closeReportModal(modal, returnFocus) {
        if (!modal) {
            return;
        }

        state.modalOpen = false;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');

        var app = qs('.ex-dashboard-app');
        if (app && 'inert' in app) {
            app.inert = false;
        }

        updateScrollLock();

        var trigger = state.modalTrigger;
        state.modalTrigger = null;

        if (returnFocus && trigger && typeof trigger.focus === 'function') {
            trigger.focus();
        }
    }

    /**
     * Wires the new report modal triggers, form, and dismissal paths.
     * @returns {void}
     */
    function initModal() {
        var modal = document.getElementById('new-report-modal');
        if (!modal) {
            return;
        }

        var content = qs('.modal-content', modal);
        var form = document.getElementById('new-report-form');
        var openers = qsa('[data-modal-open="new-report-modal"]');

        openers.forEach(function (opener) {
            opener.addEventListener('click', function () {
                openReportModal(modal, opener);
            });
        });

        qsa('[data-modal-close]', modal).forEach(function (button) {
            button.addEventListener('click', function () {
                closeReportModal(modal, true);
            });
        });

        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                closeReportModal(modal, true);
            }
        });

        if (content) {
            content.addEventListener('keydown', function (event) {
                trapFocus(content, event);
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var nameInput = document.getElementById('report-name');
                var reportName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'New report';
                closeReportModal(modal, true);
                showToast('"' + reportName + '" report created. We will email you when it is ready.');
            });
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && state.modalOpen && !event.defaultPrevented) {
                event.preventDefault();
                closeReportModal(modal, true);
            }
        });
    }

    /**
     * Wires mobile sidebar opening, closing, focus, and resize behavior.
     * @returns {void}
     */
    function initSidebar() {
        var sidebar = document.getElementById('pulse-sidebar');
        var openButton = document.getElementById('sidebar-toggle');
        var closeButton = document.getElementById('sidebar-close');
        var scrim = document.getElementById('sidebar-scrim');
        var main = qs('.ex-dashboard-main');
        var media = window.matchMedia('(max-width: 1023.98px)');

        if (!sidebar || !openButton || !scrim) {
            return;
        }

        /**
         * Applies the open or closed sidebar state.
         * @param {boolean} open Whether the overlay should be open.
         * @param {boolean} returnFocus Whether to focus the opener on close.
         * @returns {void}
         */
        function setSidebar(open, returnFocus) {
            var shouldOpen = Boolean(open && media.matches);

            state.sidebarOpen = shouldOpen;
            sidebar.classList.toggle('is-open', shouldOpen);
            scrim.classList.toggle('is-open', shouldOpen);
            openButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
            openButton.setAttribute('aria-label', shouldOpen ? 'Close navigation' : 'Open navigation');

            if (shouldOpen) {
                sidebar.inert = false;
                sidebar.removeAttribute('aria-hidden');
                if (main && 'inert' in main) {
                    main.inert = true;
                }
                updateScrollLock();
                var target = closeButton || qs('.sidebar-nav-list-link', sidebar);
                if (target) {
                    window.requestAnimationFrame(function () {
                        target.focus();
                    });
                }
            } else {
                if (media.matches) {
                    sidebar.inert = true;
                    sidebar.setAttribute('aria-hidden', 'true');
                }
                if (main && 'inert' in main) {
                    main.inert = false;
                }
                updateScrollLock();
                if (returnFocus) {
                    openButton.focus();
                }
            }
        }

        /**
         * Synchronizes inert and visual state after a viewport breakpoint change.
         * @returns {void}
         */
        function handleMediaChange() {
            if (media.matches) {
                if (!state.sidebarOpen) {
                    sidebar.inert = true;
                    sidebar.setAttribute('aria-hidden', 'true');
                }
                return;
            }

            state.sidebarOpen = false;
            sidebar.classList.remove('is-open');
            sidebar.inert = false;
            sidebar.removeAttribute('aria-hidden');
            scrim.classList.remove('is-open');
            openButton.setAttribute('aria-expanded', 'false');
            openButton.setAttribute('aria-label', 'Open navigation');
            if (main && 'inert' in main) {
                main.inert = false;
            }
            updateScrollLock();
        }

        openButton.addEventListener('click', function () {
            setSidebar(!state.sidebarOpen, false);
        });

        if (closeButton) {
            closeButton.addEventListener('click', function () {
                setSidebar(false, true);
            });
        }

        scrim.addEventListener('click', function () {
            setSidebar(false, true);
        });

        sidebar.addEventListener('keydown', function (event) {
            if (state.sidebarOpen && media.matches) {
                trapFocus(sidebar, event);
            }
        });

        qsa('.ex-dashboard-brand-link, .sidebar-nav-list-link', sidebar).forEach(function (link) {
            link.addEventListener('click', function () {
                if (media.matches && state.sidebarOpen) {
                    setSidebar(false, true);
                }
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && state.sidebarOpen && !event.defaultPrevented && !activeMenu) {
                event.preventDefault();
                setSidebar(false, true);
            }
        });

        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handleMediaChange);
        } else if (typeof media.addListener === 'function') {
            media.addListener(handleMediaChange);
        }

        handleMediaChange();
    }

    /**
     * Wires the global search shortcut and prevents demo submissions.
     * @returns {void}
     */
    function initSearch() {
        var form = document.getElementById('global-search-form');
        var input = document.getElementById('global-search');

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
            });
        }

        if (!input) {
            return;
        }

        document.addEventListener('keydown', function (event) {
            if (state.modalOpen) {
                return;
            }

            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                input.focus();
                input.select();
            }
        });
    }

    /**
     * Reveals cards as they enter the viewport unless motion is reduced.
     * @returns {void}
     */
    function initReveal() {
        var elements = qsa('.ex-dashboard-reveal');
        if (!elements.length) {
            return;
        }

        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (reduced.matches || !('IntersectionObserver' in window)) {
            elements.forEach(function (element) {
                element.classList.add('is-revealed');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -30px 0px'
        });

        elements.forEach(function (element) {
            observer.observe(element);
        });
    }

    /**
     * Shows a transient status message in the bottom corner.
     * @param {string} message Message text.
     * @returns {void}
     */
    function showToast(message) {
        var toast = document.getElementById('dashboard-toast');
        if (!toast) {
            return;
        }

        var text = qs('.ex-dashboard-toast-text', toast);
        if (!text) {
            return;
        }

        text.textContent = message;
        toast.hidden = false;

        if (toastTimer) {
            window.clearTimeout(toastTimer);
        }

        toastTimer = window.setTimeout(function () {
            toast.hidden = true;
            toastTimer = null;
        }, 4200);
    }

    /**
     * Initializes every dashboard controller.
     * @returns {void}
     */
    function init() {
        initThemeToggle();
        initSidebar();
        initMenus();
        initWorkspaceSwitcher();
        initNotifications();
        initRowActions();
        initRevenueChart();
        initCompareToggle();
        initModal();
        initSearch();
        initReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
