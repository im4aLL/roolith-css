/**
 * Theme playground demo controller: wires the behaviors the framework leaves to
 * the application, so each preview component works while a theme is judged.
 *
 * Three behaviors live here: the password reveal toggle, the range fill that
 * tracks its value, and the world map hover tooltip. The map markup arrives from
 * an `include-fragment`, so the map setup waits for that fragment to load and
 * also handles the case where it finished before this file ran. The tooltip is
 * the framework `.block-svg-map-tooltip` element, so its colors follow the
 * preview scope. Nothing here is exposed globally.
 */
(function () {
    'use strict';

    const FRAGMENT_SELECTOR = '.doc-playground-map-fragment';

    const MAP_SELECTOR = '[data-doc-svg-map]';

    const TOOLTIP_SELECTOR = '[data-doc-svg-map-tooltip]';

    const CURSOR_OFFSET = 12;

    const EDGE_PADDING = 8;

    /**
     * Build the tooltip content for one country path. Only the attributes that
     * exist are rendered, so a path without traffic data still shows its name.
     * @param {SVGPathElement} path - Country path carrying the data attributes.
     * @returns {HTMLElement} Tooltip content wrapper.
     */
    function buildContent(path) {
        const content = document.createElement('div');
        content.className = 'block-svg-map-tooltip-content';

        const heading = document.createElement('div');
        heading.className = 'block-svg-map-tooltip-content-hl';
        heading.textContent = path.getAttribute('data-name') || '';
        content.appendChild(heading);

        [
            ['Pageviews', 'data-pageviews'],
            ['Unique', 'data-unique-visitors'],
            ['Visits', 'data-visits'],
        ].forEach(([label, attribute]) => {
            const value = path.getAttribute(attribute);
            if (!value) {
                return;
            }
            const line = document.createElement('div');
            line.className = 'block-svg-map-tooltip-content-text';
            line.textContent = `${label}: ${value}`;
            content.appendChild(line);
        });

        return content;
    }

    /**
     * Place the tooltip next to the cursor while keeping it inside the viewport.
     * @param {HTMLElement} tooltip - Tooltip element.
     * @param {number} clientX - Pointer x coordinate.
     * @param {number} clientY - Pointer y coordinate.
     * @returns {void}
     */
    function positionTooltip(tooltip, clientX, clientY) {
        const rect = tooltip.getBoundingClientRect();
        const left = Math.min(
            Math.max(EDGE_PADDING, clientX + CURSOR_OFFSET),
            window.innerWidth - rect.width - EDGE_PADDING,
        );
        const top = Math.min(
            Math.max(EDGE_PADDING, clientY + CURSOR_OFFSET),
            window.innerHeight - rect.height - EDGE_PADDING,
        );
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    /**
     * Show the tooltip for a country path at the current pointer position.
     * @param {HTMLElement} tooltip - Tooltip element.
     * @param {SVGPathElement} path - Country path carrying the data attributes.
     * @param {PointerEvent} event - Pointer event that triggered the update.
     * @returns {void}
     */
    function showTooltip(tooltip, path, event) {
        tooltip.replaceChildren(buildContent(path));
        tooltip.classList.add('show');
        positionTooltip(tooltip, event.clientX, event.clientY);
    }

    /**
     * Hide the tooltip.
     * @param {HTMLElement} tooltip - Tooltip element.
     * @returns {void}
     */
    function hideTooltip(tooltip) {
        tooltip.classList.remove('show');
    }

    /**
     * Wire every password field in the preview so its reveal button swaps the
     * input type and reports the new state to assistive technology.
     * @returns {void}
     */
    function initPasswordToggles() {
        document
            .querySelectorAll('.doc-playground-preview .form-field-password')
            .forEach((field) => {
                const input = field.querySelector('.form-input');
                const toggle = field.querySelector('.form-password-toggle');
                if (!input || !toggle || toggle.dataset.passwordReady === 'true') {
                    return;
                }
                toggle.dataset.passwordReady = 'true';
                const labelElement = field.querySelector('.form-label');
                const label = labelElement ? labelElement.textContent.trim() : 'password';
                toggle.addEventListener('click', () => {
                    const revealed = input.type === 'password';
                    input.type = revealed ? 'text' : 'password';
                    toggle.setAttribute('aria-pressed', String(revealed));
                    toggle.setAttribute(
                        'aria-label',
                        `${revealed ? 'Hide' : 'Show'} ${label.toLowerCase()}`,
                    );
                });
            });
    }

    /**
     * Keep every range fill in step with its value. The framework paints the
     * track from `--r-form-range-value` and ships no script for it, so the
     * preview updates the property on input.
     * @returns {void}
     */
    function initRanges() {
        document.querySelectorAll('.doc-playground-preview .form-range').forEach((range) => {
            if (range.dataset.rangeReady === 'true') {
                return;
            }
            range.dataset.rangeReady = 'true';

            const sync = () => {
                const min = Number(range.min) || 0;
                const max = Number(range.max) || 100;
                const value = Number(range.value);
                const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
                range.style.setProperty('--r-form-range-value', `${percent}%`);
            };

            range.addEventListener('input', sync);
            sync();
        });
    }

    /**
     * Attach the delegated pointer listeners once the map markup is in place.
     * @returns {void}
     */
    function initMap() {
        const map = document.querySelector(MAP_SELECTOR);
        const tooltip = document.querySelector(TOOLTIP_SELECTOR);
        if (!map || !tooltip || map.dataset.mapReady === 'true') {
            return;
        }
        map.dataset.mapReady = 'true';

        const pathFrom = (event) => {
            const target = event.target instanceof Element ? event.target : null;
            const path = target ? target.closest('path') : null;
            return path && map.contains(path) ? path : null;
        };

        map.addEventListener('pointerover', (event) => {
            const path = pathFrom(event);
            if (path) {
                showTooltip(tooltip, path, event);
            }
        });

        map.addEventListener('pointerout', (event) => {
            if (!pathFrom(event)) {
                return;
            }
            const next = event.relatedTarget instanceof Element ? event.relatedTarget : null;
            if (!next || !next.closest('path')) {
                hideTooltip(tooltip);
            }
        });

        map.addEventListener('pointermove', (event) => {
            if (tooltip.classList.contains('show')) {
                positionTooltip(tooltip, event.clientX, event.clientY);
            }
        });

        map.addEventListener('pointerdown', (event) => {
            const path = event.pointerType === 'touch' ? pathFrom(event) : null;
            if (path) {
                showTooltip(tooltip, path, event);
            }
        });

        ['pointerup', 'pointercancel'].forEach((type) => {
            map.addEventListener(type, (event) => {
                if (event.pointerType === 'touch') {
                    hideTooltip(tooltip);
                }
            });
        });

        map.addEventListener('pointerleave', () => {
            hideTooltip(tooltip);
        });

        window.addEventListener('scroll', () => hideTooltip(tooltip), { passive: true });
        window.addEventListener('resize', () => hideTooltip(tooltip));
    }

    const fragment = document.querySelector(FRAGMENT_SELECTOR);
    if (fragment) {
        if (fragment.classList.contains('is-loaded')) {
            initMap();
        }
        fragment.addEventListener('load', initMap);
    } else {
        initMap();
    }

    initPasswordToggles();
    initRanges();
})();
