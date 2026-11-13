/**
 * Toggles the translucent state on the fixed header once the page scrolls.
 * @returns {void}
 */
function initHeaderState() {
    const header = document.querySelector('[data-header]');
    if (!header) {
        return;
    }

    let frame = 0;

    /**
     * Applies the current scroll state to the header.
     * @returns {void}
     */
    function syncHeaderState() {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
        frame = 0;
    }

    /**
     * Schedules one header state update per animation frame.
     * @returns {void}
     */
    function requestHeaderState() {
        if (frame) {
            return;
        }
        frame = window.requestAnimationFrame(syncHeaderState);
    }

    window.addEventListener('scroll', requestHeaderState, { passive: true });
    syncHeaderState();
}

/**
 * Wires the mobile menu, including focus handling, Escape, outside clicks and scroll lock.
 * @returns {void}
 */
function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.getElementById('site-menu');
    if (!toggle || !menu) {
        return;
    }

    const header = toggle.closest('header');
    const pageRegions = [document.getElementById('main'), document.querySelector('footer')].filter(
        (region) => region instanceof HTMLElement,
    );
    let returnFocus = null;

    /**
     * Reports whether the mobile menu is currently expanded.
     * @returns {boolean} True when the menu is open.
     */
    function isMenuOpen() {
        return toggle.getAttribute('aria-expanded') === 'true';
    }

    /**
     * Opens or closes the mobile menu and keeps focus and scroll lock in sync.
     * @param {boolean} open - Whether the menu should be open.
     * @returns {void}
     */
    function setMenuOpen(open) {
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        menu.hidden = !open;
        document.body.classList.toggle('ex-multipurpose-scroll-locked', open);
        pageRegions.forEach((region) => {
            region.inert = open;
        });

        if (open) {
            returnFocus = document.activeElement;
            const firstLink = menu.querySelector('a[href], button:not([disabled])');
            if (firstLink instanceof HTMLElement) {
                firstLink.focus();
            }
            return;
        }

        if (returnFocus instanceof HTMLElement && typeof returnFocus.focus === 'function') {
            returnFocus.focus();
        }
        returnFocus = null;
    }

    /**
     * Handles Escape and keeps Tab focus cycling between the toggle and the menu.
     * @param {KeyboardEvent} event - The keydown event on the document.
     * @returns {void}
     */
    function trapMenuFocus(event) {
        if (!isMenuOpen()) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            setMenuOpen(false);
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const focusable = [toggle, ...menu.querySelectorAll('a[href], button:not([disabled])')];
        if (!focusable.length) {
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!focusable.includes(document.activeElement)) {
            event.preventDefault();
            first.focus();
            return;
        }

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return;
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    toggle.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

    menu.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        if (target === menu || target.closest('a[href]')) {
            setMenuOpen(false);
        }
    });

    document.addEventListener('keydown', trapMenuFocus);

    document.addEventListener('click', (event) => {
        if (!isMenuOpen()) {
            return;
        }
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        if (!menu.contains(target) && !(header && header.contains(target))) {
            setMenuOpen(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && isMenuOpen()) {
            setMenuOpen(false);
        }
    });
}

/**
 * Wires the studio tabs, including roving tabindex and arrow key navigation.
 * @returns {void}
 */
function initTabs() {
    const root = document.querySelector('[data-tabs]');
    if (!root) {
        return;
    }

    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) {
        return;
    }

    const panels = tabs
        .map((tab) => document.getElementById(tab.getAttribute('aria-controls') || ''))
        .filter((panel) => panel instanceof HTMLElement);

    if (panels.length !== tabs.length) {
        return;
    }

    /**
     * Selects one tab and reveals its panel.
     * @param {number} index - The tab index to select.
     * @param {boolean} moveFocus - Whether to move keyboard focus to the tab.
     * @returns {void}
     */
    function selectTab(index, moveFocus) {
        const nextIndex = (index + tabs.length) % tabs.length;

        tabs.forEach((tab, tabIndex) => {
            const selected = tabIndex === nextIndex;
            tab.setAttribute('aria-selected', selected ? 'true' : 'false');
            tab.setAttribute('tabindex', selected ? '0' : '-1');
            tab.classList.toggle('active', selected);

            const panel = panels[tabIndex];
            panel.classList.toggle('active', selected);
            panel.hidden = !selected;
        });

        if (moveFocus) {
            tabs[nextIndex].focus();
        }
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(index, false));

        tab.addEventListener('keydown', (event) => {
            const key = event.key;
            const navigates = key === 'ArrowRight' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowUp';
            if (!navigates && key !== 'Home' && key !== 'End') {
                return;
            }

            event.preventDefault();

            if (key === 'Home') {
                selectTab(0, true);
                return;
            }

            if (key === 'End') {
                selectTab(tabs.length - 1, true);
                return;
            }

            const forward = key === 'ArrowRight' || key === 'ArrowDown';
            selectTab(index + (forward ? 1 : -1), true);
        });
    });
}

/**
 * Wires the testimonial carousel buttons, dots, counter and arrow keys.
 * @returns {void}
 */
function initCarousel() {
    const root = document.querySelector('[data-carousel]');
    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll('[data-slide]'));
    if (slides.length < 2) {
        return;
    }

    const previous = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');
    const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
    const currentLabel = root.querySelector('[data-carousel-current]');

    let current = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (current < 0) {
        current = 0;
    }

    /**
     * Shows one slide and syncs the slides, dots, counter and hidden states.
     * @param {number} index - The slide index to show.
     * @returns {void}
     */
    function showSlide(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === current;
            slide.classList.toggle('is-active', active);
            slide.hidden = !active;
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        dots.forEach((dot, dotIndex) => {
            const active = dotIndex === current;
            dot.classList.toggle('is-active', active);
            if (active) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });

        if (currentLabel) {
            currentLabel.textContent = String(current + 1).padStart(2, '0');
        }
    }

    if (previous) {
        previous.addEventListener('click', () => showSlide(current - 1));
    }

    if (next) {
        next.addEventListener('click', () => showSlide(current + 1));
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    root.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }
        event.preventDefault();
        showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
    });

    showSlide(current);
}

/**
 * Wires the monthly and yearly pricing switch and updates every price and label.
 * @returns {void}
 */
function initPricing() {
    const toggle = document.querySelector('[data-billing-toggle]');
    const amounts = Array.from(document.querySelectorAll('[data-price-monthly][data-price-yearly]'));
    if (!toggle || !amounts.length) {
        return;
    }

    const cadences = Array.from(document.querySelectorAll('[data-price-cadence]'));
    const labels = Array.from(document.querySelectorAll('[data-billing-label]'));
    const status = document.querySelector('[data-billing-status]');

    /**
     * Renders the price set and labels for the current billing mode.
     * @returns {void}
     */
    function renderBilling() {
        const yearly = toggle.checked;

        amounts.forEach((amount) => {
            const value = yearly ? amount.getAttribute('data-price-yearly') : amount.getAttribute('data-price-monthly');
            if (value) {
                amount.textContent = value;
            }
        });

        cadences.forEach((cadence) => {
            cadence.textContent = yearly ? 'per month, billed yearly' : 'per month, billed monthly';
        });

        labels.forEach((label) => {
            const active = label.getAttribute('data-billing-label') === (yearly ? 'yearly' : 'monthly');
            label.classList.toggle('is-active', active);
            label.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (status) {
            status.textContent = yearly ? 'Showing yearly prices with 20 percent off.' : 'Showing monthly prices.';
        }
    }

    toggle.addEventListener('change', renderBilling);

    labels.forEach((label) => {
        label.addEventListener('click', () => {
            const yearly = label.getAttribute('data-billing-label') === 'yearly';
            if (toggle.checked === yearly) {
                return;
            }
            toggle.checked = yearly;
            renderBilling();
        });
    });

    renderBilling();
}

/**
 * Wires the FAQ accordion so only one answer is visible at a time.
 * @returns {void}
 */
function initAccordion() {
    const root = document.querySelector('[data-accordion]');
    if (!root) {
        return;
    }

    const items = Array.from(root.querySelectorAll('.accordion-item'));
    if (!items.length) {
        return;
    }

    /**
     * Sets one accordion item open or closed and syncs ARIA state.
     * @param {Element} item - The accordion item.
     * @param {boolean} open - Whether the item should be open.
     * @returns {void}
     */
    function setItemOpen(item, open) {
        const button = item.querySelector('.accordion-item-title');
        const panel = item.querySelector('.accordion-item-body');
        if (!(button instanceof HTMLElement) || !(panel instanceof HTMLElement)) {
            return;
        }

        item.classList.toggle('active', open);
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
    }

    items.forEach((item) => {
        const button = item.querySelector('.accordion-item-title');
        if (!(button instanceof HTMLElement)) {
            return;
        }

        button.addEventListener('click', () => {
            const willOpen = !item.classList.contains('active');
            items.forEach((other) => setItemOpen(other, other === item && willOpen));
        });
    });

    items.forEach((item, index) => setItemOpen(item, index === 0));
}

/**
 * Reveals marked elements as they enter the viewport, unless motion is reduced.
 * @returns {void}
 */
function initReveal() {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!elements.length) {
        return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('is-revealed'));
        return;
    }

    document.body.classList.add('ex-multipurpose-reveal-ready');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    );

    elements.forEach((element) => observer.observe(element));
}

/**
 * Initializes every page controller after the document has been parsed.
 * @returns {void}
 */
function initPage() {
    initHeaderState();
    initMobileMenu();
    initTabs();
    initCarousel();
    initPricing();
    initAccordion();
    initReveal();
}

initPage();
