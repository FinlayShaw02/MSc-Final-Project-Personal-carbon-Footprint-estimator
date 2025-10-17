/**
 * ============================================================
 *  File: Summary.jsx
 *  Screen: Summary (themed + FrostedSelect)
 *
 *  Description:
 *  Visualises your emissions for a chosen date range with:
 *    - Daily trend line (EmissionsLineGraph)
 *    - Breakdown pie + ranked bars
 *      • Category = “All”  -> breakdown by category
 *      • Category = <name> -> breakdown by activity within that category
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { CO2PieChart } from "../components/charts/CO2PieChart";
import { EmissionsLineGraph } from "../components/charts/EmissionsLineGraph";
import { CategoryBarChart } from "../components/charts/CategoryBarChart";
import { useUnits } from "../context/UnitsContext";
import { convertFromKg, formatEmissions } from "../utils/formatEmissions";
import FrostedSelect from "../components/ui/FrostedSelect";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost/carbon_app_api";
const WITH_CREDS = { credentials: "include" };

/* ---------- Date helpers ---------- */
// Pad numbers like 3 -> "03"
const pad = (n) => String(n).padStart(2, "0");
// Convert a Date to "YYYY-MM-DD HH:MM:SS" for API queries
const toSQL = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
};
// Default month range (first to last day, full-day bounds)
const startOfMonth = (dt = new Date()) => new Date(dt.getFullYear(), dt.getMonth(), 1, 0, 0, 0);
const endOfMonth = (dt = new Date()) => new Date(dt.getFullYear(), dt.getMonth() + 1, 0, 23, 59, 59);
// Pretty day label (e.g., "Jan 5")
const fmtDay = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

/* ---------- API helpers ---------- */
// Summary groups by category by default; when a category filter is selected, group by activity.
async function fetchSummary({ from, to, category }) {
  const group = category ? "activity" : "category";
  const qs = new URLSearchParams({
    from: toSQL(from),
    to: toSQL(to),
    group,
    ...(category ? { category } : {}),
  });
  const res = await fetch(`${API_BASE}/summary.php?${qs}`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load summary");
  return res.json(); // { totalKg, group, items }
}

// Daily totals for the range (optionally filtered by category)
async function fetchDaily({ from, to, category }) {
  const qs = new URLSearchParams({
    from: toSQL(from),
    to: toSQL(to),
    ...(category ? { category } : {}),
  });
  const res = await fetch(`${API_BASE}/daily.php?${qs}`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load daily");
  return res.json(); // [{ day, entries, total_kg }]
}

// Load all goals (used to highlight monthly cap progress)
async function fetchGoals() {
  const res = await fetch(`${API_BASE}/goals.php`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json();
}

// Fetch distinct category names for dropdown, for the current date range.
async function fetchCategoriesForRange({ from, to }) {
  const qs = new URLSearchParams({ from: toSQL(from), to: toSQL(to), group: "category" });
  const res = await fetch(`${API_BASE}/summary.php?${qs}`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load categories");
  const data = await res.json();
  const names = (data.items || []).map((row) => row.label).filter(Boolean);
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

/* ---------- Component ---------- */
export default function Summary() {
  const { units } = useUnits(); // Global unit preference (kg or lb)

  // Filters: date range and category ("" means All)
  const [range, setRange] = useState(() => ({ from: startOfMonth(), to: endOfMonth() }));
  const [category, setCategory] = useState(""); // '' = All

  // Data loaded from API
  const [totalKg, setTotalKg] = useState(0);
  const [group, setGroup] = useState("category");  // "category" | "activity" (driven by selection)
  const [items, setItems] = useState([]);          // breakdown rows: [{ label, value }]
  const [daily, setDaily] = useState([]);          // daily totals: [{ day, total_kg }]
  const [goals, setGoals] = useState([]);          // all user goals

  // Aux UI state
  const [categories, setCategories] = useState([]); // dropdown choices for Category
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load goals once (best-effort; errors ignored here)
  useEffect(() => {
    fetchGoals().then(setGoals).catch(() => {});
  }, []);

  // Update category dropdown when date range changes
  useEffect(() => {
    let cancelled = false;
    fetchCategoriesForRange({ from: range.from, to: range.to })
      .then((names) => !cancelled && setCategories(names))
      .catch(() => !cancelled && setCategories([]));
    return () => { cancelled = true; };
  }, [range.from, range.to]);

  // Load summary (breakdown + total) and daily series when filters change
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setErr("");

    Promise.all([
      fetchSummary({ from: range.from, to: range.to, category: category || null }),
      fetchDaily({ from: range.from, to: range.to, category: category || null }),
    ])
      .then(([sum, day]) => {
        if (cancel) return;
        setTotalKg(Number(sum?.totalKg || 0));
        setGroup(sum?.group === "activity" ? "activity" : "category");
        setItems(Array.isArray(sum?.items) ? sum.items : []);
        setDaily(Array.isArray(day) ? day : []);
      })
      .catch((e) => !cancel && setErr(e.message || "Failed to load"))
      .finally(() => !cancel && setLoading(false));

    return () => { cancel = true; };
  }, [range.from, range.to, category]);

  // Dropdown options for Category (prepend "All")
  const categoryOptions = useMemo(
    () => [{ value: "", label: "All" }, ...categories.map((c) => ({ value: c, label: c }))],
    [categories]
  );

  // Convert breakdown values to the user’s unit (kg -> lb if needed) for charts
  const breakdownForCharts = useMemo(
    () =>
      (items || []).map((row) => ({
        label: row.label || "—",
        value: convertFromKg(Number(row.value || 0), units),
      })),
    [items, units]
  );

  // Convert daily totals to the user’s unit
  const dailySeries = useMemo(
    () =>
      (daily || []).map((d) => ({
        x: d.day,
        label: fmtDay.format(new Date(d.day)),
        y: convertFromKg(Number(d.total_kg || 0), units),
      })),
    [daily, units]
  );

  // Determine which monthly goals apply (global or category-specific)
  const activeMonthGoals = useMemo(() => {
    const isActiveMonthly = (g) => (g?.period || "month") === "month" && Number(g?.is_active) === 1;
    return goals.filter((g) => isActiveMonthly(g) && (category ? g.category === category : !g.category));
  }, [goals, category]);

  // Pick the strictest (lowest) monthly cap to highlight and compute progress
  const goalHighlight = useMemo(() => {
    if (!activeMonthGoals.length) return null;
    const best = [...activeMonthGoals].sort((a, b) => Number(a.target_kg) - Number(b.target_kg))[0];
    const used = totalKg; // totals for the selected range and category scope
    const pct = best.target_kg > 0 ? Math.min(100, (used / Number(best.target_kg)) * 100) : 0;
    return {
      name: best.name,
      pct,
      targetDisplay: formatEmissions(Number(best.target_kg), units),
      usedDisplay: formatEmissions(used, units),
    };
  }, [activeMonthGoals, totalKg, units]);

  // Titles adapt to grouping (category vs activity)
  const breakdownTitle =
    group === "activity"
      ? `Breakdown by activity${category ? ` in ${category}` : ""}`
      : "Breakdown by category";
  const barsTitle =
    group === "activity" ? "Top activities in range" : "Top categories in range";

  return (
    <div className="p-4 text-fg">
      {/* Header + Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
        <h1 className="text-2xl font-bold">Your Summary</h1>

        {/* Date pickers + category dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <label className="flex flex-col">
            <span className="text-sm text-muted">From</span>
            <input
              type="date"
              className="border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
              value={`${range.from.getFullYear()}-${pad(range.from.getMonth() + 1)}-${pad(range.from.getDate())}`}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setRange((r) => ({ ...r, from: new Date(y, m - 1, d, 0, 0, 0) }));
              }}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-muted">To</span>
            <input
              type="date"
              className="border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
              value={`${range.to.getFullYear()}-${pad(range.to.getMonth() + 1)}-${pad(range.to.getDate())}`}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setRange((r) => ({ ...r, to: new Date(y, m - 1, d, 23, 59, 59) }));
              }}
            />
          </label>

          <div className="flex flex-col">
            <span className="text-sm text-muted">Category</span>
            <FrostedSelect
              className="w-full"
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              placeholder="All"
            />
          </div>
        </div>
      </div>

      {/* Totals & Goal progress bar */}
      <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-muted">Total emissions in range</div>
            <div className="text-3xl font-semibold">
              {formatEmissions(totalKg, units)} CO₂e{category ? ` in ${category}` : ""}
            </div>
          </div>

          {/* Optional monthly goal highlight (only if there’s an active monthly goal) */}
          {goalHighlight && (
            <div className="min-w-[240px]">
              <div className="text-sm text-muted mb-1">Monthly goal: <span className="text-fg font-medium">{goalHighlight.name}</span></div>
              <div className="h-2 bg-surfaceVariant rounded">
                <div className="h-2 bg-primary rounded" style={{ width: `${goalHighlight.pct}%` }} />
              </div>
              <div className="text-xs mt-1">
                {goalHighlight.pct.toFixed(0)}% of cap · Used {goalHighlight.usedDisplay} / Target {goalHighlight.targetDisplay}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row: pie + bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Pie breakdown */}
        <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle">
          <h3 className="font-semibold mb-2">{breakdownTitle}</h3>
          <CO2PieChart data={breakdownForCharts} units={units} size={280} innerRadius={0.6} />
        </div>

        {/* Horizontal bars for top categories/activities */}
        <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle">
          <CategoryBarChart
            title={barsTitle}
            data={breakdownForCharts.slice(0, 10)}
            units={units}
            minHeight={260}
            orientation="horizontal"
            maxBarsMobile={8}
            showGrid={false}
          />
        </div>
      </div>

      {/* Daily trend line */}
      <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle">
        <h3 className="font-semibold mb-2">Emissions over time</h3>
        <EmissionsLineGraph data={dailySeries} units={units} height={240} />
      </div>

      {/* Status messages */}
      {err && <div className="mt-3 text-[rgb(var(--error-fg))]">{err}</div>}
      {loading && <div className="mt-3 text-muted">Loading…</div>}
    </div>
  );
}

