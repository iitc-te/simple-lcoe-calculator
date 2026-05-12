/**
 * chart.js — D3 v7 visualisation
 *
 * Draws two horizontal stacked bar charts inside #chart:
 *   1. Discounting Impact — undiscounted vs. discount effect shares
 *   2. Cost Breakdown     — CAPEX / O&M / Fuel / Tax shares
 *
 * Each bar owns its own 2-column legend rendered below it.
 * The SVG height is computed dynamically from the number of legend rows.
 * Percentage labels are shown inside segments wider than 28 px.
 *
 * chart.draw() is called from calc.display() after every Calculate().
 * It exits immediately when data.out.rr1 is null (invalid inputs).
 *
 * Depends on: data.js (data), D3 v7 (global d3)
 */

var chart = {

    /* Tableau 10 — capex:Blue  om:Teal  fuel:Orange  tax:Yellow
                     undisc:Green  disc:Grey                      */
    palette: {
        capex:  '#4E79A7',
        om:     '#76B7B2',
        fuel:   '#F28E2B',
        tax:    '#EDC948',
        undisc: '#59A14F',
        disc:   '#BAB0AC'
    },

    /** Clear the #chart element and redraw from current data.out values. */
    draw: function () {

        var el = document.getElementById('chart');
        d3.select(el).selectAll('*').remove();

        if (data.out.rr1 === null) { return; }

        /* Layout constants */
        var LABEL_H = 20;
        var BAR_H   = 40;
        var LEG_GAP = 8;   // gap between bar bottom and its legend
        var LEG_ROW = 16;  // height per legend row
        var COL_GAP = 24;  // gap between the two bar groups
        var W       = el.offsetWidth;

        var undisc_pct = Math.min((data.out.rr0 / data.out.rr1) * 100, 100);

        /* Bar definitions */
        var bars = [
            {
                label: 'Cost breakdown',
                segs: [
                    { pct: data.out.pct_capex, key: 'capex' },
                    { pct: data.out.pct_om,    key: 'om'    },
                    { pct: data.out.pct_fuel,  key: 'fuel'  },
                    { pct: data.out.pct_tax,   key: 'tax'   }
                ],
                legend: [
                    { key: 'capex', label: 'CAPEX' },
                    { key: 'om',    label: 'O&M'   },
                    { key: 'fuel',  label: 'Fuel'  },
                    { key: 'tax',   label: 'Taxes' }
                ]
            },
            {
                label: 'Effect of discounting',
                segs: [
                    { pct: undisc_pct,         key: 'undisc' },
                    { pct: 100 - undisc_pct,   key: 'disc'   }
                ],
                legend: [
                    { key: 'undisc', label: 'Undiscounted costs'    },
                    { key: 'disc',   label: 'Effect of discounting' }
                ]
            }
        ];

        /* Compute y position and total height of each bar group */
        var curY = 8;
        bars.forEach(function (bar) {
            var legRows = Math.ceil(bar.legend.length / 2);
            bar.labelY = curY;
            bar.barY   = curY + LABEL_H;
            bar.legY   = curY + LABEL_H + BAR_H + LEG_GAP;
            bar.groupH = LABEL_H + BAR_H + LEG_GAP + legRows * LEG_ROW;
            curY += bar.groupH + COL_GAP;
        });

        var totalH = curY - COL_GAP + 8;

        var svg = d3.select(el).append('svg')
            .attr('width',  W)
            .attr('height', totalH);

        var x = d3.scaleLinear().domain([0, 100]).range([0, W]);

        /* Draw each bar group */
        bars.forEach(function (bar) {

            svg.append('text')
                .attr('x',           0)
                .attr('y',           bar.labelY + 13)
                .attr('fill',        '#6b7280')
                .attr('font-size',   '11px')
                .attr('font-weight', '600')
                .text(bar.label);

            var cumPct = 0;
            bar.segs.forEach(function (seg) {
                if (seg.pct <= 0) { cumPct += seg.pct; return; }

                var bx = x(cumPct);
                var bw = x(cumPct + seg.pct) - bx;

                svg.append('rect')
                    .attr('x',      bx)
                    .attr('y',      bar.barY)
                    .attr('width',  bw)
                    .attr('height', BAR_H)
                    .attr('fill',   chart.palette[seg.key]);

                if (bw > 28) {
                    svg.append('text')
                        .attr('x',                 bx + bw / 2)
                        .attr('y',                 bar.barY + BAR_H / 2)
                        .attr('text-anchor',       'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('fill',              '#fff')
                        .attr('font-size',         '11px')
                        .text(seg.pct.toFixed(1) + '%');
                }

                cumPct += seg.pct;
            });

            /* Legend — 2-column layout */
            var colW = W / 2;
            bar.legend.forEach(function (item, i) {
                if (chart.palette[item.key] === undefined) { return; }
                var lx = (i % 2) * colW;
                var ly = bar.legY + Math.floor(i / 2) * LEG_ROW;

                svg.append('rect')
                    .attr('x',      lx)
                    .attr('y',      ly)
                    .attr('width',  10)
                    .attr('height', 10)
                    .attr('fill',   chart.palette[item.key]);

                svg.append('text')
                    .attr('x',         lx + 15)
                    .attr('y',         ly + 9)
                    .attr('fill',      '#6b7280')
                    .attr('font-size', '10px')
                    .text(item.label);
            });

        });
    }

};
