/**
 * ============================================================
 *  File: CO2PieChart.jsx
 *  Component: CO2PieChart
 *
 *  Description:
 *  A responsive, accessible pie chart component visualising the percentage
 *  breakdown of a user's total carbon footprint by category. Displays labelled,
 *  colour coded slices with support for legends, tooltips, and modal expansion.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useCallback, useId, useMemo, useState } from "react";

function CO2PieChart({
  data = [],
  title,
  units = "kg",
  size = 260,            // overall SVG size (square)
  innerRadius = 0.58,    // donut inner radius as fraction of outer radius
  sort = "desc",         // sorting order for slices: "asc" | "desc" | anything (no sort)
  palette = "okabe",     // color palette name or custom array
  legendCols = 2,        // number of legend columns when below
  legendPosition = "bottom", // "bottom" or side (responsive to md breakpoint)
  maxLegend = 8,         // max items shown before "View all"
}) {
  const [active, setActive] = useState(null); // index of highlighted/hovered slice
  const [open, setOpen] = useState(false);    // modal visibility for full legend
  const a11yId = useId();                     // unique id for <title>/<desc> a11y ties


  const rows = useMemo(() => {
    // Normalise incoming data: keep only non-empty labels with non-negative values
    const clean = (Array.isArray(data) ? data : [])
      .map((d) => ({ label: String(d.label ?? ""), value: Number(d.value ?? 0) }))
      .filter((d) => d.label && d.value >= 0);

    // Optional stable sorts by numeric value
    if (sort === "asc") return [...clean].sort((a, b) => a.value - b.value);
    if (sort === "desc") return [...clean].sort((a, b) => b.value - a.value);
    return clean;
  }, [data, sort]);

  const total = rows.reduce((s, r) => s + r.value, 0); // sum of slice values
  const R = size / 2;                                  // outer radius
  const C = size / 2;                                  // center x/y
  const rInner = Math.max(0, Math.min(0.9, innerRadius)) * R; // clamp inner radius

  const colors = useMemo(() => getColors(palette, rows.length), [palette, rows.length]);

  // precompute donut slices
  const slices = useMemo(() => {
    // Convert each row to an arc path segment with a center-tip for tooltip placement
    if (!rows.length || total <= 0) return [];
    let a = -Math.PI / 2; // start at top (12 o'clock)
    return rows.map((r, i) => {
      const frac = r.value / total;
      const a0 = a;
      const a1 = a + frac * Math.PI * 2;
      a = a1;

      // Outer arc endpoints
      const x0 = C + R * Math.cos(a0);
      const y0 = C + R * Math.sin(a0);
      const x1 = C + R * Math.cos(a1);
      const y1 = C + R * Math.sin(a1);

      // Inner arc endpoints (reversed to close shape)
      const xi0 = C + rInner * Math.cos(a1);
      const yi0 = C + rInner * Math.sin(a1);
      const xi1 = C + rInner * Math.cos(a0);
      const yi1 = C + rInner * Math.sin(a0);

      const large = a1 - a0 > Math.PI ? 1 : 0; // large-arc-flag for > 180°

      // Construct donut slice path using two arcs + lines
      const path = [
        `M ${x0} ${y0}`,
        `A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`,
        `L ${xi0} ${yi0}`,
        `A ${rInner} ${rInner} 0 ${large} 0 ${xi1} ${yi1}`,
        "Z",
      ].join(" ");

      // Mid-angle for tooltip anchor (rough center of slice)
      const mid = (a0 + a1) / 2;
      const tipR = (R + rInner) / 2;
      const tipX = C + tipR * Math.cos(mid);
      const tipY = C + tipR * Math.sin(mid);

      return { label: r.label, value: r.value, frac, color: colors[i % colors.length], path, tipX, tipY };
    });
  }, [rows, total, C, R, rInner, colors]);

  // Keyboard navigation for slice focus (left/right arrows)
  const prev = useCallback(
    () => setActive((i) => (i == null ? 0 : (i - 1 + slices.length) % slices.length)),
    [slices.length]
  );
  const next = useCallback(
    () => setActive((i) => (i == null ? 0 : (i + 1) % slices.length)),
    [slices.length]
  );

  // layout control
  const legendBelow = legendPosition === "bottom";

  // split for "View all"
  const visibleRows = rows.slice(0, Math.max(0, maxLegend)); // legend subset
  const hiddenCount = Math.max(0, rows.length - visibleRows.length); // additional items count

  // theme-aware colors (from CSS variables)
  const c = {
    axis: "rgb(var(--muted-fg))",
    label: "rgb(var(--fg))",
    value: "rgb(var(--primary))",
    railFill: "rgb(var(--surface-variant))",
    railStroke: "rgb(var(--border))",
    sliceStroke: "rgb(var(--surface))",
    centerFill: "rgb(var(--surface))",
    emptyText: "rgb(var(--muted-fg) / 0.8)",
  };

  return (
    <div className="w-full">
      {title && <div className="mb-2 font-semibold text-fg">{title}</div>}

      <div className={`flex ${legendBelow ? "flex-col" : "flex-col md:flex-row md:items-start"} gap-5`}>
        {/* Chart */}
        <div className={legendBelow ? "self-center" : "shrink-0"}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-labelledby={`${a11yId}-title ${a11yId}-desc`}
          >
            {/* Accessible title/description for screen readers */}
            <title id={`${a11yId}-title`}>{title || "CO₂ breakdown pie chart"}</title>
            <desc id={`${a11yId}-desc`}>{`Total ${total.toFixed(2)} ${units}. ${rows.length} slices.`}</desc>

            {/* Empty state: draw a rail circle when no data or total is zero */}
            {(!slices.length || total === 0) && (
              <circle cx={C} cy={C} r={R - 1} fill={c.railFill} stroke={c.railStroke} />
            )}

            {/* Donut slices */}
            <g role="list">
              {slices.map((s, i) => (
                <path
                  role="listitem"
                  key={i}
                  d={s.path}
                  fill={active === i ? shade(s.color, -0.12) : s.color} // darken on active
                  stroke={c.sliceStroke}
                  strokeWidth={1}
                  tabIndex={0}
                  aria-label={`${s.label}: ${(s.frac * 100).toFixed(1)}% (${s.value.toFixed(2)} ${units})`}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") prev();
                    if (e.key === "ArrowRight") next();
                  }}
                />
              ))}
            </g>

            {/* Donut center with total */}
            {total > 0 && (
              <>
                <circle cx={C} cy={C} r={rInner - 1} fill={c.centerFill} />
                <text x={C} y={C - 2} textAnchor="middle" fontSize="12" fill={c.axis}>
                  Total
                </text>
                <text x={C} y={C + 14} textAnchor="middle" fontSize="14" fontWeight="600" fill={c.label}>
                  {total.toFixed(2)} {units}
                </text>
              </>
            )}

            {/* Floating tooltip near active slice (clamped to bounds) */}
            {active != null && slices[active] && (
              <Tooltip
                svgSize={size}
                x={slices[active].tipX}
                y={slices[active].tipY}
                label={slices[active].label}
                value={slices[active].value}
                pct={slices[active].frac * 100}
                units={units}
              />
            )}
          </svg>
        </div>

        {/* Legend (cap + View all) */}
        <Legend
          rows={visibleRows}
          total={total}
          colors={colors}
          units={units}
          cols={legendCols}
          below={legendBelow}
          active={active}
          setActive={setActive}
        />

        {/* Trigger to reveal the full list in a modal */}
        {hiddenCount > 0 && (
          <div className={legendBelow ? "mt-1" : "md:mt-0"}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-sm text-primary hover:underline underline-offset-2"
            >
              View all ({rows.length})
            </button>
          </div>
        )}
      </div>

      {/* Modal with full list */}
      {open && (
        <Modal onClose={() => setOpen(false)} title="All activities">
          <Legend
            rows={rows}
            total={total}
            colors={colors}
            units={units}
            cols={1}
            below
            active={active}
            setActive={setActive}
          />
        </Modal>
      )}
    </div>
  );
}

/** Legend with wrapping labels and clearer layout */
function Legend({ rows, total, colors, units, cols = 2, below = true, active, setActive }) {
  if (!rows.length) return <div className={`${below ? "mt-1" : ""} text-muted`}>No data</div>;

  // Responsive grid container: single column on small screens or when `cols === 1`
  const containerClass = below
    ? `grid gap-2 mt-1 ${cols === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`
    : "grid grid-cols-1 gap-2 min-w-[260px]";

  return (
    <ul className={containerClass} role="list">
      {rows.map((r, i) => {
        const pct = total ? (r.value / total) * 100 : 0;
        const isActive = active === i; // highlight currently hovered/focused item
        return (
          <li
            key={`${r.label}-${i}`}
            className={`rounded-md px-2 py-1.5 transition ${
              isActive ? "bg-surfaceVariant ring-1 ring-border" : "hover:bg-surfaceVariant"
            }`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            title={`${r.label} • ${r.value.toFixed(2)} ${units} (${pct.toFixed(1)}%)`}
          >
            <div className="flex items-start gap-2">
              {/* color swatch */}
              <span
                className="mt-1 inline-block w-3.5 h-3.5 rounded"
                style={{ background: colors[i % colors.length] }}
                aria-hidden="true"
              />
              {/* text content */}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-snug text-fg whitespace-normal break-words">
                  {r.label}
                </div>
                <div className="mt-0.5 text-xs text-muted flex items-center gap-2">
                  <span className="tabular-nums font-medium text-fg">
                    {r.value.toFixed(2)} {units}
                  </span>
                  <span className="text-muted">•</span>
                  <span className="tabular-nums text-muted">{pct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Simple modal */
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      {/* overlay to dismiss */}
      <div className="absolute inset-0 bg-bg/60" onClick={onClose} />
      {/* modal panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-surface text-fg border border-border rounded-xl shadow-subtle m-2 p-4 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{title}</h4>
          <button
            className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surfaceVariant"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Tooltip that avoids clipping the SVG edges */
function Tooltip({ svgSize, x, y, label, value, pct, units }) {
  const w = 180;
  const h = 56;
  // initial top-centered position near the slice tip
  let tx = Math.round(x - w / 2);
  let ty = Math.round(y - h - 10);
  // clamp within SVG bounds
  tx = Math.max(6, Math.min(svgSize - w - 6, tx));
  ty = Math.max(6, Math.min(svgSize - h - 6, ty));
  return (
    <g transform={`translate(${tx},${ty})`} pointerEvents="none">
      <rect width={w} height={h} rx="8" fill="rgb(var(--surface))" stroke="rgb(var(--border))" />
      <text x={10} y={19} fontSize="12" fill="rgb(var(--fg))">{label}</text>
      <text x={10} y={38} fontSize="12" fontWeight="600" fill="rgb(var(--primary))">
        {value.toFixed(2)} {units} • {pct.toFixed(1)}%
      </text>
    </g>
  );
}

/** Utilities */
function shade(hex, amt) {
  // Lighten/darken a hex color by adding a fraction of 255 to each channel
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return hex;
  const f = (v) => Math.max(0, Math.min(255, Math.round(parseInt(v, 16) + 255 * amt)));
  return "#" + [m[1], m[2], m[3]].map((v) => f(v).toString(16).padStart(2, "0")).join("");
}

function getColors(palette, n) {
  // Accept custom palette arrays directly
  if (Array.isArray(palette) && palette.length) return palette;

  // Procedural green ramp (light to dark)
  if (palette === "greens") {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const h = 140;              // green hue
      const s = 55 + Math.round(30 * (1 - t));
      const l = 30 + Math.round(50 * (1 - t)); // darker as i grows
      out.push(hslToHex(h, s, l));
    }
    return out;
  }

  // Okabe–Ito palette (kept as-is; theme controls surfaces/labels)
  const okabe = [
    "#009E73","#E69F00","#56B4E9","#F0E442",
    "#0072B2","#D55E00","#CC79A7","#000000",
    "#7FBC41","#8DD3C7","#B3B3B3","#984EA3",
  ];
  return Array.from({ length: n }, (_, i) => okabe[i % okabe.length]);
}

function hslToHex(h, s, l) {
  // Convert HSL (0-360, 0-100, 0-100) to hex color
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export { CO2PieChart };
export default CO2PieChart;
