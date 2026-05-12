/**
 * sliders.js — noUiSlider initialisation
 *
 * Two-phase init pattern:
 *   Phase 1 creates every slider without attaching update handlers.
 *   Phase 2 attaches handlers only after all sliders exist.
 *   This prevents Calculate() from being called while sibling sliders are
 *   still uninitialised, which would crash on noUiSlider.get() calls.
 *
 * Slider start values are taken from data.in, so io.load() and io.loadFromUrl()
 * must be called before sliders.init().
 *
 * Depends on: data.js (data), calculation.js (Calculate), noUiSlider (global)
 */

var sliders = {

    /** Create all sliders, then bind update handlers. */
    init: function () {

        // Phase 1 — create sliders (no handlers yet)
        jQuery.each(data.rules, function (id, rule) {
            if (rule.slider) { sliders.create(id); }
        });

        // Phase 2 — bind handlers (all sliders now exist)
        jQuery.each(data.rules, function (id, rule) {
            if (rule.slider) {
                document.getElementById('slider-' + id).noUiSlider.on('update', function () {
                    Calculate();
                });
            }
        });

    },

    /**
     * Create a single noUiSlider for the given field id.
     * Decimal precision is derived from the rule's step value.
     */
    create: function (id) {

        var rule     = data.rules[id];
        var decimals = (rule.step % 1 !== 0) ? String(rule.step).split('.')[1].length : 0;

        noUiSlider.create(document.getElementById('slider-' + id), {
            start:    [ data.in[id] ],
            step:     rule.step,
            range:    { min: rule.min, max: rule.max },
            tooltips: true,
            format: {
                to:   function (v) { return parseFloat(v.toFixed(decimals)); },
                from: function (v) { return parseFloat(v); }
            }
        });

    }

};
