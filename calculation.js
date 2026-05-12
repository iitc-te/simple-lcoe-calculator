/**
 * calculation.js — LCOE computation
 *
 * Mathematical approach (identical to v1, refactored for clarity):
 *
 *   V1 runs separate NPV summation loops for O&M, fuel, and taxes, then
 *   divides each by npv_s (the annuity factor). V2 recognises that each
 *   operating-cost loop sums the same constant annual amount multiplied by
 *   1/r^k, so the result equals annual_cost × annuity. The two formulations
 *   are algebraically identical; v2 replaces three redundant loops with one.
 *
 * Depends on: data.js (data), chart.js (chart), io.js (io)
 */

var calc = {

    /**
     * Validate all data.in values against their rules.
     * Returns true when every field passes its rule.valid() predicate.
     */
    validate: function () {
        var ok = true;
        jQuery.each(data.rules, function (key, rule) {
            var v = data.in[key];
            if (isNaN(v) || !rule.valid(v)) {
                ok = false;
                return false; // break jQuery.each
            }
        });
        return ok;
    },

    /**
     * Compute LCOE from data.in and write all results to data.out.
     *
     * Key variables:
     *   c       installed capacity (1 kW normalised unit)
     *   o       annual output (kWh) = capacity × capacity-factor × 8 760 h
     *   r       annual discount factor = 1 + dRate/100
     *   npv_c   NPV of CAPEX spread evenly over cDurat construction years
     *   annuity NPV of $1/year received during the oDurat operating years
     *           (discounted back through the construction period as well)
     *   rr      discounted annual revenue requirement ($/year)
     *   rr1     LCOE = rr / annual output ($/kWh → $/MWh × 1000)
     */
    run: function () {

        var cDurat  = data.in.cDurat;
        var cCosts  = data.in.cCosts;
        var oDurat  = data.in.oDurat;
        var oCapaf  = data.in.oCapaf;
        var fCosts  = data.in.fCosts;
        var vCosts1 = data.in.vCosts1;
        var vCosts2 = data.in.vCosts2;
        var vCosts3 = data.in.vCosts3;
        var dRate   = data.in.dRate;

        var c = 1;                          // installed capacity, kW
        var o = 0.01 * oCapaf * c * 8760;  // annual output, kWh
        var r = 1 + 0.01 * dRate;          // annual discount factor

        /* Annual operating costs ($/year) — constant, independent of discounting */

        var annual_om   = fCosts * c + 0.001 * vCosts1 * o;
        var annual_fuel = 0.001 * vCosts2 * o;
        var annual_tax  = 0.001 * vCosts3 * o;

        /* NPV of CAPEX: equal instalments paid at end of each construction year */

        var npv_c = 0;
        for (var k = 1; k <= cDurat; k += 1) {
            npv_c += (cCosts * c / cDurat) / Math.pow(r, k);
        }

        /* Annuity factor: NPV of $1/year over the operating period */

        var annuity = 0;
        for (k = cDurat + 1; k <= cDurat + oDurat; k += 1) {
            annuity += 1 / Math.pow(r, k);
        }

        /* Discounted LCOE ($/MWh) */

        var rr  = (annuity > 0) ? (npv_c + (annual_om + annual_fuel + annual_tax) * annuity) / annuity : 0;
        var rr1 = (o > 0)       ? rr / o : 0;

        data.out.rr1 = 1000 * rr1;  // $/kWh → $/MWh

        /* Undiscounted LCOE (equivalent to setting dRate = 0):
           npv_c  collapses to cCosts; annuity collapses to oDurat */

        var rr0   = cCosts * c / oDurat + annual_om + annual_fuel + annual_tax;
        var rr0_1 = (o > 0) ? rr0 / o : 0;

        data.out.rr0 = 1000 * rr0_1;  // $/kWh → $/MWh

        /* Cost-component shares of the discounted annual revenue requirement (%) */

        var capex_annual = (annuity > 0) ? npv_c / annuity : 0;

        data.out.pct_capex = (rr > 0) ? capex_annual / rr * 100 : 0;
        data.out.pct_om    = (rr > 0) ? annual_om    / rr * 100 : 0;
        data.out.pct_fuel  = (rr > 0) ? annual_fuel  / rr * 100 : 0;
        data.out.pct_tax   = (rr > 0) ? annual_tax   / rr * 100 : 0;

    },

    /** Write data.out to the DOM result field and redraw the chart. */
    display: function () {
        jQuery('#rr1').val(
            (data.out.rr1 !== null) ? data.out.rr1.toFixed(2) : '-'
        );
        chart.draw();
    }

};

/**
 * Calculate — top-level orchestrator called on every input change.
 * Order: read DOM → validate → compute → display → persist → share URL.
 */
function Calculate() {
    io.readInputs();
    if (calc.validate()) {
        calc.run();
    } else {
        data.out.rr1       = null;
        data.out.rr0       = null;
        data.out.pct_capex = null;
        data.out.pct_om    = null;
        data.out.pct_fuel  = null;
        data.out.pct_tax   = null;
    }
    calc.display();
    io.save();
    io.updateShareUrl();
}
