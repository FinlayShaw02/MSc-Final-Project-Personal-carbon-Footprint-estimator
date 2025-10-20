/**
 * ============================================================
 *  File: CategoryBarChart.jsx
 *  Component: CategoryBarChart
 *
 *  Description:
 *  Responsive SVG bar chart component with automatic orientation:
 *  horizontal on desktop/tablet and vertical on mobile. Accepts
 *  category/value pairs and renders ranked bars with optional gridlines.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * CategoryBarChart
 * - Horizontal on desktop/tablet
 * - Vertical on mobile (auto)
 * Accepts [{ category/label, value }]
 */
function CategoryBarChart({
  data = [],
  title,
  units = "kg",
  minHeight = 220,
  orientation = "auto",
  maxBarsMobile = 8,
  showGrid = false,          // ← new: gridlines disabled by default
}) {
  const wrapRef = useRef(null);      // Container ref used to measure available width
  const [w, setW] = useState(360);   // Measured width of the chart container

  useEffect(() => {
    // Watch container size and update `w` responsively
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect?.width || 360;
      setW(Math.max(260, Math.floor(width))); // Clamp to a sensible minimum width
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect(); // Clean up observer on unmount
  }, []);

  const isMobile = w < 520; // Simple breakpoint based on measured width
  const vertical = orientation === "vertical" || (orientation === "auto" && isMobile);
  // `vertical` toggles layout; otherwise horizontal on larger screens

  
  const rowsAll = useMemo(() => {
    // Normalise incoming data, coerce to strings/numbers, remove invalid rows, sort desc by value
    return (Array.isArray(data) ? data : [])
      .map((d) => ({
        name: String(d.category ?? d.label ?? ""),
        value: Number(d.value ?? 0),
      }))
      .filter((d) => d.name && isFinite(d.value))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const rows = useMemo(() => {
    // On mobile/vertical, limit number of bars for readability
    if (!vertical) return rowsAll;
    return rowsAll.slice(0, maxBarsMobile);
  }, [rowsAll, vertical, maxBarsMobile]);

  /* ===== Layout ===== */
  const topPad = 20;
  const bottomPad = vertical ? 68 : 28; // space for 2 line labels on mobile
  const leftPad = 30;  // give labels more breathing room
  const rightPad = 18;

  const innerW = w - leftPad - rightPad; // drawable width inside paddings
  const gap = 10;                         // gap between bars (horizontal layout)
  const baseBarH = Math.max(
    14,
    Math.floor((minHeight - topPad - bottomPad) / Math.max(1, rows.length) - gap)
  ); // compute bar height based on available vertical space + row count

  const H = vertical
    ? Math.max(minHeight, 240) // enforce a taller min height for vertical layout
    : Math.max(minHeight, topPad + bottomPad + rows.length * (baseBarH + gap));
  const innerH = H - topPad - bottomPad; // drawable height inside paddings

  const maxV = Math.max(1, ...rows.map((r) => r.value)); // avoid division by zero

  /* ===== Theme-aware colors ===== */
  const gridColor = "rgb(var(--border) / 0.45)";
  const railColor = "rgb(var(--surface-variant))";
  const barColor = "rgb(var(--primary))";
  const labelColor = "rgb(var(--fg))";
  const valueColor = "rgb(var(--primary))";
  const pillBg = "rgb(var(--surface-variant))";
  const axisColor = "rgb(var(--muted-fg))";
  const emptyColor = "rgb(var(--muted-fg) / 0.7)";

  return (
    <div ref={wrapRef} className="w-full">
      {title && <div className="mb-2 font-semibold text-fg">{title}</div>}

      {/* Accessible SVG chart with responsive width/height */}
      <svg
        width={w}
        height={H}
        className="block max-w-full h-auto"
        role="img"
        aria-label={`Emissions (${units})`}
      >
        {/* Axis/title caption */}
        <text x={leftPad} y={topPad - 6} fontSize="10" fill={axisColor}>
          Emissions ({units})
        </text>

        {/* Horizontal layout */}
        {!vertical && (
          <HorizontalBars
            rows={rows}
            innerW={innerW}
            innerH={innerH}
            topPad={topPad}
            leftPad={leftPad}
            railColor={railColor}
            gridColor={gridColor}
            barColor={barColor}
            labelColor={labelColor}
            valueColor={valueColor}
            pillBg={pillBg}
            emptyColor={emptyColor}
            maxV={maxV}
            baseBarH={baseBarH}
            gap={gap}
            units={units}
            showGrid={showGrid}
          />
        )}

        {/* Vertical layout (mobile) */}
        {vertical && (
          <VerticalBars
            rows={rows}
            innerW={innerW}
            innerH={innerH}
            topPad={topPad}
            leftPad={leftPad}
            railColor={railColor}
            gridColor={gridColor}
            barColor={barColor}
            labelColor={labelColor}
            valueColor={valueColor}
            emptyColor={emptyColor}
            maxV={maxV}
            units={units}
            showGrid={showGrid}
          />
        )}
      </svg>
    </div>
  );
}

function HorizontalBars({
  rows, innerW, innerH, topPad, leftPad,
  railColor, gridColor, barColor, labelColor, valueColor, pillBg, emptyColor,
  maxV, baseBarH, gap, units, showGrid
}) {
  return (
    <g transform={`translate(${leftPad},${topPad})`}>
      {/* Optional vertical grid lines */}
      {showGrid &&
        [0.25, 0.5, 0.75, 1].map((t, i) => {
          const x = t * innerW;
          return <line key={`vg-${i}`} x1={x} x2={x} y1={0} y2={innerH} stroke={gridColor} />;
        })}

      {/* Empty state */}
      {rows.length === 0 && (
        <text x={innerW / 2} y={innerH / 2} textAnchor="middle" fontSize="12" fill={emptyColor}>
          No data
        </text>
      )}

      {/* Bars */}
      {rows.map((r, i) => {
        const y = i * (baseBarH + gap);
        const wBar = (r.value / maxV) * innerW;

        const name = pretty(r.name);
        const amount = `${r.value.toFixed(2)} ${units}`;

        const cy = y + baseBarH / 2; // center of bar
        const textColor = "white";

        const fontSize = Math.max(10, Math.min(13, Math.floor(baseBarH * 0.6)));
        const leftTextX = 12;            // padding from bar start
        const rightTextX = innerW - 12;  // padding from bar end

        return (
          <g key={`${r.name}-${i}`}>
            {/* rail (full-length background) */}
            <rect x={0} y={y} width={innerW} height={baseBarH} rx="8" fill={railColor} />

            {/* filled (true) value */}
            <rect x={0} y={y} width={Math.max(0, wBar)} height={baseBarH} rx="8" fill={barColor} />

            {/* category name (left side) */}
            <text
              x={leftTextX}
              y={cy}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={fontSize}
              fill={textColor}
              style={{ pointerEvents: "none" }}
            >
              {name}
            </text>

            {/* value (right side) */}
            <text
              x={rightTextX}
              y={cy}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={fontSize}
              className="tabular-nums"
              fill={textColor}
              style={{ pointerEvents: "none" }}
            >
              {amount}
            </text>
          </g>
        );
      })}
    </g>
  );
}


function VerticalBars({
  rows, innerW, innerH, topPad, leftPad,
  railColor, gridColor, barColor, labelColor, valueColor, emptyColor, maxV, units, showGrid
}) {
  return (
    <g transform={`translate(${leftPad},${topPad})`}>
      {/* Optional horizontal grid lines */}
      {showGrid &&
        [0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = innerH - t * innerH;
          return <line key={`hg-${i}`} x1={0} x2={innerW} y1={y} y2={y} stroke={gridColor} />;
        })}

      {/* Empty state */}
      {rows.length === 0 && (
        <text x={innerW / 2} y={innerH / 2} textAnchor="middle" fontSize="12" fill={emptyColor}>
          No data
        </text>
      )}

      {/* Bars + labels */}
      {rows.length > 0 && (() => {
        const gapX = Math.max(8, Math.floor(innerW * 0.02)); // spacing between columns
        const colW = Math.max(26, Math.floor((innerW - gapX * (rows.length - 1)) / rows.length)); // column width
        const fontSize = 11;
        const maxChars = Math.max(4, Math.floor(colW / (fontSize * 0.62))); // approximate character fit per line
        const maxLines = 2; // cap labels to 2 lines

        return rows.map((r, i) => {
          const x = i * (colW + gapX);
          const hBar = Math.max(2, Math.round((r.value / maxV) * innerH)); // bar height proportional to max
          const y = innerH - hBar;

          const full = pretty(r.name);
          const lines = wrapWords(full, maxChars, maxLines); // word-wrap label into 1-2 lines

          return (
            <g key={`${r.name}-${i}`} transform={`translate(${x},0)`}>
              {/* full column rail */}
              <rect x={0} y={0} width={colW} height={innerH} rx="4" fill={railColor} />
              {/* bar fill */}
              <rect x={0} y={y} width={colW} height={hBar} rx="4" fill={barColor} />

              {/* value above bar */}
              <text
                x={colW / 2}
                y={Math.max(y - 6, 10)}
                textAnchor="middle"
                fontSize="11"
                className="tabular-nums"
                fill={valueColor}
              >
                {r.value.toFixed(1)}
              </text>

              {/* multi-line label under bar */}
              <text
                x={colW / 2}
                y={innerH + 14}
                textAnchor="middle"
                fontSize={fontSize}
                fill={labelColor}
              >
                {lines.map((ln, j) => (
                  <tspan key={j} x={colW / 2} dy={j === 0 ? 0 : fontSize + 2}>
                    {ln}
                  </tspan>
                ))}
              </text>
              <title>{full} • {r.value.toFixed(2)} {units}</title>
            </g>
          );
        });
      })()}
    </g>
  );
}

/* helpers */
function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s; // add ellipsis if exceeding n
}
function pretty(s) {
  return s.replace(/_/g, " ").replace(/\s+/g, " ").trim(); // normalise underscores/spacing
}
function wrapWords(text, maxCharsPerLine, maxLines) {
  // Greedy word-wrapper: splits text into up to `maxLines` lines respecting `maxCharsPerLine`
  const words = pretty(text).split(" ");
  const lines = [];
  let cur = "";

  for (const w of words) {
    if ((cur + (cur ? " " : "") + w).length <= maxCharsPerLine) {
      cur = cur ? cur + " " + w : w;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break; // stop early if last line is next
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);

  const used = lines.join(" ").length;
  const leftover = text.length > used; // whether some text didn't fit
  if (leftover) {
    lines[lines.length - 1] = truncate(lines[lines.length - 1], maxCharsPerLine);
  }
  return lines;
}

export { CategoryBarChart };
export default CategoryBarChart;


