/**
 * ============================================================
 *  File: Dashboard.jsx
 *  Component: Dashboard
 *
 *  Description:
 *  Authenticated landing page showing a weekly overview: category breakdown,
 *  daily emissions trend, monthly goal progress and recent activity.
 *  Fetches data from the backend and renders CO₂ visualisations.
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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost/carbon_app_api";
const WITH_CREDS = { credentials: "include" };

/* ---------- Date helpers (week = Mon..Sun) ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toSQL = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(
    dt.getMinutes()
  )}:${pad(dt.getSeconds())}`;
};
function startOfWeek(date = new Date()) {
  // Compute Monday 00:00 of the given week
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfWeek(date = new Date()) {
  // Compute Sunday 23:59:59.999 of the given week
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}
const fmtDay = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/* ---------- API helpers ---------- */
async function fetchSummary({ from, to }) {
  // Weekly category summary (server groups by category)
  const qs = new URLSearchParams({ from: toSQL(from), to: toSQL(to), group: "category" });
  const res = await fetch(`${API_BASE}/summary.php?${qs}`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load summary");
  return res.json();
}
async function fetchDaily({ from, to }) {
  // Daily totals series for the range
  const qs = new URLSearchParams({ from: toSQL(from), to: toSQL(to) });
  const res = await fetch(`${API_BASE}/daily.php?${qs}`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load daily");
  return res.json();
}
async function fetchGoals() {
  // Goals list (monthly cap, etc.)
  const res = await fetch(`${API_BASE}/goals.php`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json();
}
/** Optional — if your backend exposes it. Silently ignored if 404. */
async function fetchRecent(limit = 5) {
  // Most recent activities for quick list
  try {
    const res = await fetch(`${API_BASE}/recent.php?limit=${limit}`, WITH_CREDS);
    if (!res.ok) throw new Error("no recent");
    return res.json();
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const { units } = useUnits(); // user’s preferred units (“kg” or “lb”)
  const [range, setRange] = useState(() => ({ from: startOfWeek(), to: endOfWeek() }));

  // Data buckets
  const [sum, setSum] = useState({ totalKg: 0, items: [] });
  const [daily, setDaily] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recent, setRecent] = useState(null); // null hides card; [] shows empty state

  // UI state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load all datasets when date range changes
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setErr("");

    Promise.all([
      fetchSummary({ from: range.from, to: range.to }),
      fetchDaily({ from: range.from, to: range.to }),
      fetchGoals(),
      fetchRecent(5),
    ])
      .then(([s, d, g, r]) => {
        if (cancel) return;
        setSum({ totalKg: Number(s?.totalKg || 0), items: Array.isArray(s?.items) ? s.items : [] });
        setDaily(Array.isArray(d) ? d : []);
        setGoals(Array.isArray(g) ? g : []);
        setRecent(r);
      })
      .catch((e) => !cancel && setErr(e.message || "Failed to load"))
      .finally(() => !cancel && setLoading(false));

    return () => {
      cancel = true;
    };
  }, [range.from, range.to]);

  /* ---------- Derived metrics ---------- */
  const weekDays = useMemo(() => {
    // Build the 7 dates for Mon..Sun of the selected week
    const days = [];
    const s = new Date(range.from);
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      days.push(d);
    }
    return days;
  }, [range.from]);

  const dailySeries = useMemo(() => {
    // Align API daily data to all 7 days and convert units for chart
    const map = new Map(daily.map((r) => [r.day, Number(r.total_kg || 0)]));
    return weekDays.map((d) => {
      const isoStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const valKg = map.get(isoStr) || 0;
      return {
        x: isoStr,
        label: fmtDay.format(d),
        y: convertFromKg(valKg, units),
      };
    });
  }, [daily, weekDays, units]);

  // Headline numbers
  const totalWeekKg = sum.totalKg;
  const totalWeekDisplay = formatEmissions(totalWeekKg, units);
  const avgPerDayDisplay = formatEmissions(totalWeekKg / 7, units);

  const bestDay = useMemo(() => {
    // Find the lowest-emission day up to today (no peeking into the future)
    const today = new Date();
    const upper = new Date(Math.min(range.to.getTime(), today.setHours(23, 59, 59, 999)));
    const fromISO = iso(range.from);
    const upperISO = iso(upper);
    const candidates = (Array.isArray(daily) ? daily : []).filter(
      (d) => d.day >= fromISO && d.day <= upperISO
    );
    if (candidates.length === 0) return null;
    const best = candidates.reduce((a, b) =>
      Number(b.total_kg || 0) < Number(a.total_kg || 0) ? b : a
    );
    const d = new Date(best.day);
    const val = convertFromKg(Number(best.total_kg || 0), units);
    return { label: fmtDay.format(d), valueDisplay: `${val.toFixed(2)} ${units}` };
  }, [daily, range.from, range.to, units]);

  const pieData = useMemo(
    // Category slices converted to user units for the pie + bar charts
    () => (sum.items || []).map((r) => ({ label: r.label || "Other", value: convertFromKg(Number(r.value || 0), units) })),
    [sum.items, units]
  );

  // Monthly goal (overall cap, no per-category)
  const monthlyGoal = useMemo(() => {
    const active = (g) => (g?.period || "month") === "month" && Number(g?.is_active) === 1 && !g.category;
    const best = [...goals].filter(active).sort((a, b) => Number(a.target_kg) - Number(b.target_kg))[0];
    if (!best) return null;
    const pct = best.target_kg > 0 ? Math.min(100, (totalWeekKg / Number(best.target_kg)) * 100) : 0;
    return {
      name: best.name,
      pct,
      usedDisplay: formatEmissions(totalWeekKg, units),
      targetDisplay: formatEmissions(Number(best.target_kg), units),
    };
  }, [goals, totalWeekKg, units]);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto w-full max-w-screen-md px-4 py-6 md:py-8">
        {/* Greeting */}
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted">
            Week of{" "}
            <strong className="text-fg">
              {range.from.toLocaleDateString()} – {range.to.toLocaleDateString()}
            </strong>
          </p>
        </header>

        {/* Quick metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Card title="Total CO₂ this week">
            <div className="text-2xl font-semibold">{totalWeekDisplay}</div>
          </Card>
          <Card title="Avg per day">
            <div className="text-2xl font-semibold">{avgPerDayDisplay}</div>
          </Card>
          <Card title="Best day">
            <div className="text-2xl font-semibold">
              {bestDay ? `${bestDay.label} · ${bestDay.valueDisplay}` : "—"}
            </div>
          </Card>
        </section>

        {/* Goal */}
        {monthlyGoal && (
          <section className="rounded-xl border border-border p-4 mb-4 bg-surface shadow-subtle">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-muted">Monthly goal</div>
                <div className="font-semibold">{monthlyGoal.name}</div>
                <div className="text-sm text-muted mt-1">
                  Used: <strong className="text-fg">{monthlyGoal.usedDisplay}</strong> / Target:{" "}
                  <strong className="text-fg">{monthlyGoal.targetDisplay}</strong>
                </div>
              </div>
              {/* Simple progress bar */}
              <div className="min-w-[160px]">
                <div className="h-2 bg-surfaceVariant rounded">
                  <div className="h-2 bg-primary rounded" style={{ width: `${monthlyGoal.pct}%` }} />
                </div>
                <div className="text-xs text-primary mt-1">{monthlyGoal.pct.toFixed(0)}% of cap</div>
              </div>
            </div>
          </section>
        )}

        {/* Charts: Pie + Top categories (2-col) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle">
            <h3 className="font-semibold mb-2">Breakdown by category</h3>
            {/* Donut of category shares (in user units) */}
            <CO2PieChart data={pieData} units={units} size={280} innerRadius={0.6} />
          </div>

          <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle">
            {/* Horizontal bar chart of the same category data */}
            <CategoryBarChart
              title="Top categories in range"
              data={pieData.map((d) => ({ label: d.label, value: d.value }))}
              units={units}
              minHeight={260}
              orientation="horizontal"   // left -> right bars
              maxBarsMobile={8}
              showGrid={false}
            />
          </div>
        </section>

        {/* Emissions (full width) */}
        <section className="rounded-xl border border-border p-4 mb-4 bg-surface shadow-subtle">
          <h3 className="font-semibold mb-2">Emissions over this week</h3>
          {/* Line graph for daily totals (Mon..Sun) */}
          <EmissionsLineGraph data={dailySeries} units={units} height={220} />
        </section>

        {/* Recent (optional) */}
        {recent && (
          <section className="rounded-xl border border-border p-4 mb-6 bg-surface shadow-subtle">
            <h3 className="font-semibold mb-2">Recent activity</h3>
            {recent.length === 0 ? (
              <div className="text-sm text-muted">Nothing logged yet this week.</div>
            ) : (
              <ul className="space-y-2">
                {recent.map((r, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <div className="truncate">
                      <span className="font-medium text-fg">{r.activity_name || "Activity"}</span>
                      <span className="text-muted"> · {r.category || "—"}</span>
                    </div>
                    <div className="text-fg tabular-nums">
                      {formatEmissions(Number(r.emissions_kg_co2e || 0), units)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* States */}
        {loading && <div className="text-muted">Loading…</div>}
        {err && <div className="text-[rgb(var(--error-fg))]">Error: {err}</div>}
      </div>
    </div>
  );
}

/* ---------- Tiny card wrapper ---------- */
function Card({ title, children }) {
  // Simple card used for the three headline metrics
  return (
    <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle">
      <div className="text-sm text-muted mb-1">{title}</div>
      {children}
    </div>
  );
}
