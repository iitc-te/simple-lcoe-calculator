/**
 * app.js — Bootstrap and event wiring
 *
 * Initialisation order matters:
 *   1. io.load()        — restore data.in from localStorage (before sliders)
 *   2. io.loadFromUrl() — overlay URL query params (takes priority over storage)
 *   3. sliders.init()   — create sliders starting from data.in values
 *   4. Calculate()      — initial computation and display
 *   5. event bindings   — wire plain <input> changes
 *
 * Depends on: io.js, sliders.js, calculation.js
 */

jQuery(document).ready(function () {

    io.load();
    io.loadFromUrl();
    sliders.init();

    Calculate();

    jQuery('.v_in').on('input', function () {
        Calculate();
    });

    jQuery(document).on('click', '#btn-copy', function () {
        navigator.clipboard.writeText(jQuery('#share-url').val()).then(function () {
            jQuery('#btn-copy i').removeClass('bi-clipboard').addClass('bi-clipboard-check');
            setTimeout(function () {
                jQuery('#btn-copy i').removeClass('bi-clipboard-check').addClass('bi-clipboard');
            }, 2000);
        }).catch(function () {
            jQuery('#share-url').select();
        });
    });

});
