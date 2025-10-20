/**
 * ============================================================
 *  File: EmissionsLineGraph.jsx
 *  Component: EmissionsLineGraph
 *
 *  Description:
 *  A responsive SVG line chart component visualising emissions over time.
 *  Displays temporal trends in carbon output with axis labels, tooltips,
 *  and shaded area under the curve for improved visual context.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useMemo, useState } from "react";

/* Helpers to format dates for labels/tooltips */
const pad = (n) => String(n).padStart(2, "0");
const fmtISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtShort = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

/**
 * Normalise incoming data into sorted { d: Date, y: number } points.
 * Accepts objects with x date and y value fields, filters invalid rows,
 * and sorts chronologically.
 */
function normaliseData(data) {
  return (Array.isArray(data) ? data : [])
    .map((p) => {
      const dateStr = p.x ?? p.date;
      const y = Number(p.y ?? p.value ?? 0);
      const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
      return isFinite(d) && !isNaN(y) ? { d, y } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.d - b.d);
}

/**
 * Generate tick values between min and max.
 * Falls back to repeated min if range is degenerate.
 */
function niceTicks(min, max, count = 4) {
  if (max <= min) return Array(count + 1).fill(min);
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => min + i * step);
}

export function EmissionsLineGraph({ data, title, units = "kg", height = 260 }) {
  const [hover, setHover] = useState(null); // index of hovered point (for tooltip)

  /* ----- data processing ----- */
  const { points, xMin, xMax, yMin, yMax } = useMemo(() => {
    const pts = normaliseData(data);
    if (!pts.length) return { points: [], xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

    const minX = pts[0].d.getTime();
    const maxX = pts[pts.length - 1].d.getTime();
    let minY = Math.min(...pts.map((p) => p.y));
    let maxY = Math.max(...pts.map((p) => p.y));

    // pad Y for breathing room (10% or at least 1)
    const padY = (maxY - minY) * 0.1 || 1;
    minY = Math.max(0, minY - padY);
    maxY = maxY + padY;

    return { points: pts, xMin: minX, xMax: maxX, yMin: minY, yMax: maxY };
  }, [data]);

  /* ----- layout ----- */
  const W = 720; // internal viewBox width
  const H = height;
  // margins; extra right padding prevents last x-label clipping
  const M = { top: 24, right: 28, bottom: 30, left: 44 };

  const innerW = W - M.left - M.right; // drawable width
  const innerH = H - M.top - M.bottom; // drawable height

  // Simple linear scales from data space to SVG space
  const xScale = (t) =>
    innerW === 0 || xMax === xMin ? 0 : ((t - xMin) / (xMax - xMin)) * innerW;
  const yScale = (v) =>
    innerH === 0 || yMax === yMin ? innerH : innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  /* ----- path ----- */
  // Build an "M x,y L x,y ..." path for the polyline connecting points
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => {
        const x = xScale(p.d.getTime());
        const y = yScale(p.y);
        return `${i ? "L" : "M"}${x},${y}`;
      })
      .join(" ");
  }, [points, xMin, xMax, yMin, yMax, innerW, innerH]);

  /* ----- ticks ----- */
  const yTicks = niceTicks(yMin, yMax, 4); // 5 y-ticks 

  // Only render first & last x-ticks 
  const xTicks = useMemo(() => {
    if (!points.length) return [];
    if (points.length === 1) return [{ i: 0, p: points[0] }];
    return [
      { i: 0, p: points[0] },
      { i: points.length - 1, p: points[points.length - 1] },
    ];
  }, [points]);

  /* ----- theme colors ----- */
  const c = {
    gridY: "rgb(var(--border))",
    gridX: "rgb(var(--surface-variant))",
    axis: "rgb(var(--muted-fg))",
    label: "rgb(var(--fg))",
    line: "rgb(var(--primary))",
    under: "rgb(var(--primary) / 0.08)",
    point: "rgb(var(--primary))",
    tipBg: "rgb(var(--surface))",
    tipBorder: "rgb(var(--border))",
    tipTitle: "rgb(var(--fg))",
    tipValue: "rgb(var(--primary))",
  };

  return (
    <div className="w-full">
      {/* Optional chart title */}
      {title && <div className="mb-2 font-semibold text-fg">{title}</div>}

      {/* Responsive SVG using viewBox to scale */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {/* plotting area */}
        <g transform={`translate(${M.left},${M.top})`}>
          {/* Y grid + labels */}
          {yTicks.map((t, i) => {
            const y = yScale(t);
            return (
              <g key={`y${i}`}>
                <line x1={0} x2={innerW} y1={y} y2={y} stroke={c.gridY} />
                <text
                  x={-8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize="10"
                  fill={c.axis}
                >
                  {t.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* X grid + labels (first & last only) */}
          {xTicks.map(({ i, p }) => {
            const x = xScale(p.d.getTime());
            const isFirst = i === 0;
            const isLast = i === points.length - 1;

            const anchor = isFirst ? "start" : isLast ? "end" : "middle";
            const tx = isFirst ? x + 2 : isLast ? x - 2 : x; // small nudge to keep text inside plot

            return (
              <g key={`x${i}`}>
                <line x1={x} x2={x} y1={0} y2={innerH} stroke={c.gridX} />
                <text
                  x={tx}
                  y={innerH + 16}
                  textAnchor={anchor}
                  fontSize="11"
                  fontWeight="600"
                  fill={c.axis}
                >
                  {fmtShort.format(p.d)}
                </text>
              </g>
            );
          })}

          {/* line */}
          <path d={pathD} fill="none" stroke={c.line} strokeWidth="2" />

          {/* area under line (only when multiple points) */}
          {points.length > 1 && (() => {
            const lastX = xScale(points[points.length - 1].d.getTime());
            const firstX = xScale(points[0].d.getTime());
            return (
              <path
                d={`${pathD} L ${lastX},${innerH} L ${firstX},${innerH} Z`}
                fill={c.under}
              />
            );
          })()}

          {/* points + hover target */}
          {points.map((p, i) => {
            const x = xScale(p.d.getTime());
            const y = yScale(p.y);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={hover === i ? 4 : 3} fill={c.point} />
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            );
          })}

          {/* tooltip */}
          {hover != null && points[hover] && (() => {
            const p = points[hover];
            const x = xScale(p.d.getTime());
            const y = yScale(p.y);
            const boxW = 140, boxH = 48;
            const boxX = Math.min(Math.max(0, x - boxW / 2), innerW - boxW);
            const boxY = Math.max(0, y - 8 - boxH);
            return (
              <g transform={`translate(${boxX},${boxY})`} pointerEvents="none">
                <rect width={boxW} height={boxH} rx="6" fill={c.tipBg} stroke={c.tipBorder} />
                <text x={8} y={18} fontSize="11" fill={c.tipTitle}>
                  {fmtShort.format(p.d)} ({fmtISO(p.d)})
                </text>
                <text x={8} y={34} fontSize="12" fontWeight="600" fill={c.tipValue}>
                  {p.y.toFixed(3)} {units}
                </text>
              </g>
            );
          })()}
        </g>

        {/* axis title */}
        <text x={M.left} y={M.top - 8} fontSize="10" fill={c.axis}>
          Emissions ({units})
        </text>
      </svg>
    </div>
  );
}

export default EmissionsLineGraph;
