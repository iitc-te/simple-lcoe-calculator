/**
 * io.js — DOM ↔ data bridge and persistence
 *
 * Responsibilities:
 *   readInputs()     read every UI control into data.in
 *   writeInputs()    write data.in back to plain <input> elements (not sliders)
 *   save()           persist data.in to localStorage
 *   load()           restore data.in from localStorage (called before sliders.init)
 *   loadFromUrl()    overlay data.in with validated query-string params
 *   updateShareUrl() rebuild the shareable URL from current data.in
 *
 * Depends on: data.js (data), appl_iden (global set in index.htm)
 */

var io = {

    /**
     * Read every UI control into data.in.
     * Slider fields are read via the noUiSlider API; plain inputs via jQuery.
     */
    readInputs: function () {
        jQuery.each(data.rules, function (key, rule) {
            var raw = rule.slider
                ? document.getElementById('slider-' + key).noUiSlider.get()
                : jQuery('#' + key).val();
            data.in[key] = (rule.parse === 'int') ? parseInt(raw, 10) : parseFloat(raw);
        });
    },

    /**
     * Write data.in values back to plain <input> DOM elements.
     * Slider fields are intentionally skipped — sliders read data.in directly
     * via their start value in sliders.init(). Call this after load() and
     * loadFromUrl() so the DOM reflects whatever was restored into data.in.
     */
    writeInputs: function () {
        jQuery.each(data.rules, function (key, rule) {
            if (!rule.slider) {
                jQuery('#' + key).val(data.in[key]);
            }
        });
    },

    /**
     * Persist data.in to localStorage.
     * Silently skips when storage is unavailable (private browsing, quota exceeded).
     */
    save: function () {
        try {
            localStorage.setItem(appl_iden, JSON.stringify(data.in));
        } catch (e) { /* storage unavailable — silently skip */ }
    },

    /**
     * Restore data.in from localStorage.
     * Falls back silently to compiled defaults when:
     *   - no entry exists, JSON is malformed, a key is missing, or a value is out of range.
     * Must be called before sliders.init() so sliders start on the saved values.
     */
    load: function () {
        var stored;
        try {
            stored = localStorage.getItem(appl_iden);
        } catch (e) { return; }

        if (!stored) { return; }

        var parsed;
        try {
            parsed = JSON.parse(stored);
        } catch (e) { return; }

        if (!parsed) { return; }

        var valid = true;
        jQuery.each(data.rules, function (key, rule) {
            var v = parsed[key];
            if (v === undefined || isNaN(v) || !rule.valid(v)) {
                valid = false;
                return false; // break jQuery.each
            }
        });

        if (!valid) { return; }

        data.in = parsed;
    },

    /**
     * Overlay data.in with validated query-string parameters.
     * Unknown keys and out-of-range values are silently ignored.
     * Call after load() so URL params take priority over saved state.
     */
    loadFromUrl: function () {
        var params = new URLSearchParams(window.location.search);
        params.forEach(function (value, key) {
            if (!data.rules[key]) { return; }
            var rule = data.rules[key];
            var v = (rule.parse === 'int') ? parseInt(value, 10) : parseFloat(value);
            if (!isNaN(v) && rule.valid(v)) {
                data.in[key] = v;
            }
        });
    },

    /**
     * Rebuild the shareable URL from current data.in and show the share box.
     * Hides the share box when data.out.rr1 is null (invalid inputs).
     */
    updateShareUrl: function () {
        var box = jQuery('#share-box');

        if (data.out.rr1 === null) { box.addClass('d-none'); return; }

        var params = new URLSearchParams();
        jQuery.each(data.in, function (key, value) { params.set(key, value); });
        var url = window.location.origin + window.location.pathname + '?' + params.toString();

        jQuery('#share-url').val(url);
        box.removeClass('d-none');
    }

};
