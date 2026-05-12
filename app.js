/**
 * app.js — Bootstrap and event wiring
 *
 * Initialisation order matters:
 *   1. io.load()        — restore data.in from localStorage (before sliders)
 *   2. io.loadFromUrl() — overlay URL query params (takes priority over storage)
 *   3. sliders.init()   — create sliders starting from data.in values
 *   4. Calculate()      — initial computation and display
 *   5. event bindings   — wire plain <input> changes and the copy-link button
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
        var url = jQuery('#share-url').val();
        navigator.clipboard.writeText(url).then(function () {
            var btn = jQuery('#btn-copy');
            btn.html('<i class="bi bi-clipboard-check"></i> Copied!');
            setTimeout(function () {
                btn.html('<i class="bi bi-clipboard"></i> Copy link');
            }, 2000);
        }).catch(function () {
            /* Clipboard API unavailable (non-HTTPS or denied): select the field
               so the user can copy manually. */
            jQuery('#share-url').select();
        });
    });

});
