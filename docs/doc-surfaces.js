/**
 * Docs transient surfaces: modals, drawers, combo boxes, and popovers, including
 * the trigger state each one restores when it closes.
 *
 * Pages must load `/doc-surfaces.js` before `/doc.js`. Both files are classic
 * scripts sharing the global scope, so `doc.js` relies on `initSurfaces`,
 * `openModal`, `closeModal`, `openDrawer`, `closeDrawer`, `closeComboBoxes`,
 * `toggleComboBox`, `togglePopover`, and `closePopovers` being declared here.
 * Keeping the declarations global is what lets `doc.js` own click and Escape
 * ordering while the surface behavior lives in this file. The one dependency in
 * the other direction is `updateScrollableTables`, which this file re-runs after
 * a surface becomes visible so newly measurable table wrappers regain their
 * keyboard scroll stop.
 */

let lastModalTrigger = null;

let lastDrawerTrigger = null;

let lastPopoverTrigger = null;

let surfacesInitialized = false;

/**
 * Re-run the scrollable table gate immediately after a surface becomes
 * visible. A table inside a hidden surface measures as zero width, so its
 * wrapper loses focusability on the initial gate and would never regain it,
 * because opening a surface does not fire a resize. The class change has already
 * applied the visible layout, and reading `scrollWidth` flushes pending layout,
 * so the wrapper is measured at its real width right away and the gate is called
 * synchronously, with no animation frame needed. Every surface that can reveal a
 * table calls this, including the accordion and tab toggles in `doc.js`.
 * @returns {void}
 */
function refreshScrollableTables() {
    updateScrollableTables();
}

/**
 * Open the modal targeted by a trigger, remember the trigger for focus return, and move
 * focus into the dialog so keyboard and screen reader users land inside it. The function
 * also gives `.modal-content` a `tabindex` of -1 when the markup has none, so the content
 * box can take focus. It re-runs the scrollable table gate after making the modal visible,
 * and a modal without `.modal-content` still opens and re-gates but receives no focus.
 * @param {HTMLElement} trigger - Element carrying `data-doc-modal`.
 * @returns {void}
 */
function openModal(trigger) {
    const selector = trigger.getAttribute('data-doc-modal');
    const modal = selector ? document.querySelector(selector) : null;
    if (!modal) {
        return;
    }
    lastModalTrigger = trigger;
    modal.classList.add('active');
    refreshScrollableTables();
    const content = modal.querySelector('.modal-content');
    if (!content) {
        return;
    }
    if (!content.hasAttribute('tabindex')) {
        content.setAttribute('tabindex', '-1');
    }
    content.focus();
}

/**
 * Close a modal and return focus to the element that opened it, when that element
 * is still in the document. Backdrop, close button, and Escape all use this path.
 * @param {HTMLElement} modal - Modal root element.
 * @returns {void}
 */
function closeModal(modal) {
    modal.classList.remove('active');
    if (lastModalTrigger && document.body.contains(lastModalTrigger)) {
        lastModalTrigger.focus();
    }
    lastModalTrigger = null;
}

/**
 * Open the drawer container targeted by a trigger.
 * @param {HTMLElement} trigger - Element carrying `data-doc-drawer`.
 * @returns {void}
 */
function openDrawer(trigger) {
    const selector = trigger.getAttribute('data-doc-drawer');
    const container = selector ? document.querySelector(selector) : null;
    if (!container) {
        return;
    }
    lastDrawerTrigger = trigger;
    container.classList.add('open');
    refreshScrollableTables();
}

/**
 * Close a drawer container and return focus to the element that opened it, when
 * that element is still in the document.
 * @param {HTMLElement} container - Drawer container element.
 * @returns {void}
 */
function closeDrawer(container) {
    container.classList.remove('open');
    if (lastDrawerTrigger && document.body.contains(lastDrawerTrigger)) {
        lastDrawerTrigger.focus();
    }
    lastDrawerTrigger = null;
}

/**
 * Close every open combo box menu.
 * @returns {boolean} Whether at least one combo box was open.
 */
function closeComboBoxes() {
    let closed = false;
    document.querySelectorAll('.combo-box.open').forEach((combo) => {
        combo.classList.remove('open');
        closed = true;
    });
    return closed;
}

/**
 * Toggle one combo box menu and close any other open combo box.
 * @param {HTMLElement} trigger - Element carrying `data-doc-combo-box`.
 * @returns {void}
 */
function toggleComboBox(trigger) {
    const combo = trigger.closest('.combo-box');
    if (!combo) {
        return;
    }
    const willOpen = !combo.classList.contains('open');
    closeComboBoxes();
    combo.classList.toggle('open', willOpen);
    refreshScrollableTables();
}

/**
 * Mark one popover trigger as expanded and every other popover trigger as collapsed.
 * @param {HTMLElement | null} trigger - Trigger of the open popover, or `null` when none is open.
 * @returns {void}
 */
function markPopoverOpen(trigger) {
    document.querySelectorAll('[data-doc-popover]').forEach((button) => {
        button.setAttribute('aria-expanded', button === trigger ? 'true' : 'false');
    });
}

/**
 * Toggle the popover targeted by a trigger, closing any other open popover first.
 * @param {HTMLElement} trigger - Element carrying `data-doc-popover`.
 * @returns {void}
 */
function togglePopover(trigger) {
    const selector = trigger.getAttribute('data-doc-popover');
    const popover = selector ? document.querySelector(selector) : null;
    if (!popover) {
        return;
    }
    const willOpen = !popover.classList.contains('active');
    closePopovers(false);
    popover.classList.toggle('active', willOpen);
    lastPopoverTrigger = willOpen ? trigger : null;
    markPopoverOpen(willOpen ? trigger : null);
    if (willOpen) {
        refreshScrollableTables();
    }
}

/**
 * Close every open popover and optionally return focus to its trigger.
 * @param {boolean} restoreFocus - Whether to move focus back to the trigger.
 * @returns {boolean} Whether at least one popover was open.
 */
function closePopovers(restoreFocus) {
    const open = document.querySelectorAll('.popover.active');
    open.forEach((popover) => popover.classList.remove('active'));
    markPopoverOpen(null);
    if (!open.length) {
        lastPopoverTrigger = null;
        return false;
    }
    if (restoreFocus && lastPopoverTrigger && document.body.contains(lastPopoverTrigger)) {
        lastPopoverTrigger.focus();
    }
    lastPopoverTrigger = null;
    return true;
}

/**
 * Reflect the popovers already open in the markup onto their triggers, so
 * `aria-expanded` starts truthful and Escape still knows which trigger to focus.
 * Repeated calls are ignored so the scan and trigger bookkeeping run once.
 * @returns {void}
 */
function initSurfaces() {
    if (surfacesInitialized) {
        return;
    }
    surfacesInitialized = true;

    document.querySelectorAll('[data-doc-popover]').forEach((trigger) => {
        const selector = trigger.getAttribute('data-doc-popover');
        const panel = selector ? document.querySelector(selector) : null;
        const isActive = Boolean(panel) && panel.classList.contains('active');
        trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        if (isActive) {
            lastPopoverTrigger = trigger;
        }
    });
}
