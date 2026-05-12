/**
 * data.js — Central application state
 *
 * All modules read from and write to this single object.
 *
 *   data.in    — current input values (written by io, read by calc)
 *   data.out   — computed outputs (written by calc, read by chart and io)
 *   data.rules — per-field metadata: parsing type, slider range, and
 *                the validity predicate used by calc.validate()
 *
 * Rule properties:
 *   parse  {string}   "int" | "float" — how to coerce the raw DOM string
 *   min    {number}   lower bound (inclusive for sliders; used by valid())
 *   max    {number}   upper bound (inclusive)
 *   step   {number}   slider step; present only when slider: true
 *   slider {boolean}  true → field is a noUiSlider; false → plain <input>
 *   valid  {function} returns true when the parsed value is in-range
 */

var data = {

    in: {
        cDurat:  7,
        cCosts:  4013,
        oDurat:  60,
        oCapaf:  85,
        fCosts:  99.1,
        vCosts1: 1,
        vCosts2: 9.33,
        vCosts3: 0,
        dRate:   7
    },

    out: {
        rr1:       null,   // LCOE $/MWh (discounted)
        rr0:       null,   // LCOE $/MWh (undiscounted, dRate = 0)
        pct_capex: null,   // CAPEX share of annualised cost (%)
        pct_om:    null,   // O&M share (%)
        pct_fuel:  null,   // Fuel share (%)
        pct_tax:   null    // Tax share (%)
    },

    rules: {
        cDurat:  { parse: 'int',   min: 1,   max: 25,    step: 1,   slider: true,  valid: function (v) { return v > 0  && v <= 25;    } },
        cCosts:  { parse: 'float', min: 1,   max: 10000,                           valid: function (v) { return v > 0  && v <= 10000; } },
        oDurat:  { parse: 'int',   min: 2,   max: 100,   step: 1,   slider: true,  valid: function (v) { return v > 1  && v <= 100;   } },
        oCapaf:  { parse: 'float', min: 0.1, max: 100,   step: 0.1, slider: true,  valid: function (v) { return v > 0  && v <= 100;   } },
        fCosts:  { parse: 'float', min: 0,   max: 1000,                            valid: function (v) { return v >= 0 && v <= 1000;  } },
        vCosts1: { parse: 'float', min: 0,   max: 1000,                            valid: function (v) { return v >= 0 && v <= 1000;  } },
        vCosts2: { parse: 'float', min: 0,   max: 1000,                            valid: function (v) { return v >= 0 && v <= 1000;  } },
        vCosts3: { parse: 'float', min: 0,   max: 1000,                            valid: function (v) { return v >= 0 && v <= 1000;  } },
        dRate:   { parse: 'float', min: 0.1, max: 25,    step: 0.1, slider: true,  valid: function (v) { return v > 0  && v <= 25;    } }
    }

};
