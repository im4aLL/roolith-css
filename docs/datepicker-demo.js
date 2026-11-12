/**
 * Datepicker page: initializes the vendored js-datepicker library on the demo field.
 *
 * The page loads `vendor/datepicker.min.js` and this file with `defer`, in that
 * order, so the library global and the demo input both exist when this runs. The
 * library appends its panel to the input's parent, which is the
 * `.form-datepicker-js` wrapper the framework stylesheet targets. The guards keep
 * the script inert when the page has no demo field or the library fails to load.
 *
 * @returns {void}
 */
function initDatepickerDemo() {
    const input = document.querySelector('.form-datepicker-js .form-input');

    if (!input || typeof window.datepicker !== 'function') {
        return;
    }

    window.datepicker(input);
}

initDatepickerDemo();
