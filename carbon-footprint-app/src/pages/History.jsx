/**
 * ============================================================
 *  File: History.jsx
 *  Component: History
 *
 *  Description:
 *  Displays a users recorded carbon-emitting activities with
 *  flexible date filtering, category selection, and two display
 *  modes - list and calendar. Provides summary totals, category
 *  breakdowns, and inline editing/deletion of entries.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */


import { useEffect, useMemo, useState } from "react";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import EditActivityModal from "../components/ui/EditActivityModal";
import FrostedSelect from "../components/ui/FrostedSelect";

import { useUnits } from "../context/UnitsContext";
import { convertFromKg, formatEmissions } from "../utils/formatEmissions";

/** ====== CONFIG ====== */
// Backend base URL and fetch options (cookies included).
const API_BASE = "http://localhost/carbon_app_api";
const WITH_CREDS = { credentials: "include" };

/** ====== DATE/TIME HELPERS ====== */
// Pad number to 2 chars (e.g., 7 -> "07").
const pad = (n) => String(n).padStart(2, "0");
// Convert Date -> "YYYY-MM-DD HH:mm:ss" for API/SQL-friendly timestamps.
const toSQL = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
};
// Convert Date -> "YYYY-MM-DD" for <input type="date" />.
const toInputDate = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
// Month boundaries (inclusive).
const startOfMonth = (dt = new Date()) => new Date(dt.getFullYear(), dt.getMonth(), 1, 0, 0, 0);
const endOfMonth   = (dt = new Date()) => new Date(dt.getFullYear(), dt.getMonth() + 1, 0, 23, 59, 59);
// Build a day window from "YYYY-MM-DD".
const dayRange = (yyyyMmDd) => {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return { from: new Date(y, m - 1, d, 0, 0, 0), to: new Date(y, m - 1, d, 23, 59, 59) };
};
// Day start/end helpers.
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
const endOfDay   = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
// Human-readable date-time formatter.
const fmtDT = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

/** ====== SEARCH -> DATE/RANGE PARSING ====== */
// Parse a single date-like token or keyword into {from,to} (or null if unrecognised).
function parseDateToken(raw) {
  if (!raw) return null;
  const t = raw.trim();

  // Keywords
  const low = t.toLowerCase();
  if (low === "today") {
    const d = new Date();
    return { from: startOfDay(d), to: endOfDay(d) };
  }
  if (low === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return { from: startOfDay(d), to: endOfDay(d) };
  }
  if (low === "this month") {
    const d = new Date();
    return { from: startOfMonth(d), to: endOfMonth(d) };
  }
  if (low === "last month") {
    const d = new Date();
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return { from: startOfMonth(prev), to: endOfMonth(prev) };
  }
  if (low === "last 7 days" || low === "last seven days") {
    const end = endOfDay(new Date());
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - 6);
    return { from: start, to: end };
  }

  // ISO date: 2025-08-09
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const [_, Y, M, D] = m.map(Number);
    const dt = new Date(Y, M - 1, D);
    if (!isNaN(dt)) return { from: startOfDay(dt), to: endOfDay(dt) };
  }

  // D/M/Y or D-M-Y or M/D/Y (ambiguous formats handled heuristically).
  m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    let a = Number(m[1]), b = Number(m[2]), y = Number(m[3]);
    let d, mo;
    if (a <= 12 && b > 12) { mo = a; d = b; } else { d = a; mo = b; }
    const dt = new Date(y, mo - 1, d);
    if (!isNaN(dt)) return { from: startOfDay(dt), to: endOfDay(dt) };
  }

  // Month name + year: "Aug 2025"
  m = t.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})$/i);
  if (m) {
    const monthIdx = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(m[1].toLowerCase());
    const y = Number(m[2]);
    const from = new Date(y, monthIdx, 1, 0, 0, 0);
    const to   = new Date(y, monthIdx + 1, 0, 23, 59, 59);
    return { from, to };
  }

  return null;
}

// Parse free-text into a date window; supports single dates/keywords or ranges ("..", " to ").
function parseSearchToRange(input) {
  if (!input) return null;
  const s = input.trim();

  // Range separators: ".." or " to "
  const sep = s.includes("..") ? ".." : s.toLowerCase().includes(" to ") ? " to " : null;
  if (sep) {
    const [a, b] = s.split(sep).map((x) => x.trim());
    const da = parseDateToken(a);
    const db = parseDateToken(b);
    if (da && db) {
      const from = da.from ?? da;
      const to   = db.to   ?? db;
      return { from, to };
    }
    return null;
  }

  return parseDateToken(s);
}

/** ====== API HELPERS ====== */
// GET with query params and common error formatting.
async function apiGet(path, params = {}) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}${path}?${qs.toString()}`, WITH_CREDS);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status}${text ? ` – ${text}` : ""}`);
  }
  return res.json();
}
// DELETE helper (path includes its own query string).
async function apiDelete(pathWithQuery) {
  const res = await fetch(`${API_BASE}${pathWithQuery}`, { method: "DELETE", ...WITH_CREDS });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Delete failed: ${res.status}${text ? ` – ${text}` : ""}`);
  }
  return res.json();
}
// PATCH helper with JSON body and shared error formatting.
async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...WITH_CREDS,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Update failed: ${res.status}${text ? ` – ${text}` : ""}`);
  }
  return res.json();
}

/** ====== COMPONENT ====== */
function History() {
  const { units } = useUnits(); // Global units (kg/lb) used across the app.

  // View/UX state (list vs calendar, loading/errors).
  const [view, setView] = useState("calendar");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Data sets for the page.
  const [activities, setActivities] = useState([]);
  const [daily, setDaily] = useState([]);
  const [summary, setSummary] = useState({ totalKg: 0, byCategory: [] });

  // Filters and search.
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [range, setRange] = useState(() => {
    const now = new Date();
    return { from: startOfMonth(now), to: endOfMonth(now) };
  });
  // Keep track of the month being viewed so we can return to it after drilling down to a day.
  const [monthView, setMonthView] = useState(() => {
    const now = new Date();
    return { from: startOfMonth(now), to: endOfMonth(now) };
  });

  // Modal targets (edit / delete).
  const [toEdit, setToEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  // Build category dropdown options from the server-provided summary (fallback below covers client-side sum).
  const categoryOptions = useMemo(() => {
    const names = summary.byCategory?.map((c) => c.category).filter(Boolean) || [];
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [summary]);

  // Fetch activities, summary, and daily series whenever filters change.
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErr("");

    const listParams = {
      from: toSQL(range.from),
      to: toSQL(range.to),
      ...(category ? { category } : {}),
      ...(q ? { q } : {}),
      limit: 200,
      offset: 0,
    };

    Promise.all([
      apiGet("/activities.php", listParams),
      apiGet("/summary.php", { from: toSQL(range.from), to: toSQL(range.to), ...(category ? { category } : {}) }),
      apiGet("/daily.php",   { from: toSQL(range.from), to: toSQL(range.to), ...(category ? { category } : {}) }),
    ])
      .then(([acts, sum, day]) => {
        if (ignore) return;
        setActivities(Array.isArray(acts) ? acts : []);
        setSummary(sum || { totalKg: 0, byCategory: [] });
        setDaily(Array.isArray(day) ? day : []);
      })
      .catch((e) => {
        if (!ignore) setErr(e.message || "Failed to load");
      })
      .finally(() => !ignore && setLoading(false));

    return () => { ignore = true; };
  }, [range.from, range.to, category, q]);

  // Client-side totals fallback in case summary endpoint is missing fields; uses current activities.
  const clientTotals = useMemo(() => {
    const byCategory = {};
    let total = 0;
    for (const a of activities) {
      const co2 = Number(a.emissions_kg_co2e ?? 0);
      total += co2;
      const key = a.category || "Uncategorised";
      byCategory[key] = (byCategory[key] || 0) + co2;
    }
    return { total, byCategory };
  }, [activities]);

  // Prefer server total, fall back to client sum if needed.
  const grandTotalKg = Number(summary?.totalKg ?? clientTotals.total);

  // Open delete modal and confirm handler (also refreshes dependent views after deletion).
  const openDelete = (a) => setToDelete(a);
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await apiDelete(`/delete.php?id=${toDelete.id}`);
      setActivities((prev) => prev.filter((x) => x.id !== toDelete.id));
      const [sum, day] = await Promise.all([
        apiGet("/summary.php", { from: toSQL(range.from), to: toSQL(range.to), ...(category ? { category } : {}) }),
        apiGet("/daily.php",   { from: toSQL(range.from), to: toSQL(range.to), ...(category ? { category } : {}) }),
      ]);
      setSummary(sum || { totalKg: 0, byCategory: [] });
      setDaily(Array.isArray(day) ? day : []);
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  // Open edit modal and save handler (PATCH + full refresh for consistency).
  const openEdit = (a) => setToEdit(a);
  const saveEdit = async (payload) => {
    try {
      await apiPatch("/update.php", payload);
      const listParams = {
        from: toSQL(range.from),
        to: toSQL(range.to),
        ...(category ? { category } : {}),
        ...(q ? { q } : {}),
        limit: 200,
        offset: 0,
      };
      const [acts, sum, day] = await Promise.all([
        apiGet("/activities.php", listParams),
        apiGet("/summary.php", { from: toSQL(range.from), to: toSQL(range.to), ...(category ? { category } : {}) }),
        apiGet("/daily.php",   { from: toSQL(range.from), to: toSQL(range.to), ...(category ? { category } : {}) }),
      ]);
      setActivities(Array.isArray(acts) ? acts : []);
      setSummary(sum || { totalKg: 0, byCategory: [] });
      setDaily(Array.isArray(day) ? day : []);
      setToEdit(null);
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  // Calendar interaction: click a day cell -> switch to list view scoped to that day.
  const openDay = (yyyyMmDd) => {
    setMonthView({ from: startOfMonth(range.from), to: endOfMonth(range.from) });
    setRange(dayRange(yyyyMmDd));
    setView("list");
  };
  // Back button: return to the last month view.
  const backToMonth = () => { setRange(monthView); setView("calendar"); };
  // Search input Enter handler: if the text parses as a date/range, apply it and switch to list.
  const onSearchEnter = (e) => {
    if (e.key !== "Enter") return;
    const parsed = parseSearchToRange(q);
    if (parsed) {
      setRange(parsed);
      setView("list");
      setQ("");
      e.preventDefault();
    }
  };

  return (
    <div className="p-4 space-y-4 text-fg">
      {/* Header + view toggle */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your History</h1>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${view === "list" ? "bg-primary text-primaryContrast" : "bg-surfaceVariant text-fg hover:opacity-80"}`}
            onClick={() => setView("list")}
            type="button"
          >
            List
          </button>
          <button
            className={`px-3 py-1 rounded ${view === "calendar" ? "bg-primary text-primaryContrast" : "bg-surfaceVariant text-fg hover:opacity-80"}`}
            onClick={() => setView("calendar")}
            type="button"
          >
            Calendar
          </button>
        </div>
      </div>

      <p className="text-muted">Review your past activities and cumulative CO₂e.</p>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* From */}
        <label className="flex flex-col">
          <span className="text-sm text-muted">From</span>
          <input
            type="date"
            className="border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            value={toInputDate(range.from)}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split("-").map(Number);
              const next = { ...range, from: new Date(y, m - 1, d, 0, 0, 0) };
              setRange(next);
              setMonthView({ from: startOfMonth(next.from), to: endOfMonth(next.from) });
            }}
          />
        </label>

        {/* To */}
        <label className="flex flex-col">
          <span className="text-sm text-muted">To</span>
          <input
            type="date"
            className="border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            value={toInputDate(range.to)}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split("-").map(Number);
              const next = { ...range, to: new Date(y, m - 1, d, 23, 59, 59) };
              setRange(next);
              setMonthView({ from: startOfMonth(next.from), to: endOfMonth(next.from) });
            }}
          />
        </label>

        {/* Category */}
        <label className="flex flex-col">
          <span className="text-sm text-muted">Category</span>
          <FrostedSelect
            value={category}
            onChange={setCategory}
            options={[
              { value: "", label: "All" },
              ...categoryOptions.map((c) => ({ value: c, label: c })),
            ]}
            // keeps heights aligned with inputs
            buttonClassName="h-10"
            menuClassName="max-h-64"
          />
        </label>

        {/* Search */}
        <label className="flex flex-col">
          <span className="text-sm text-muted">Search</span>
          <input
            type="text"
            className="border border-border rounded px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search by name, or type a date (e.g. 2025-08-09, 01/08/2025..15/08/2025, Aug 2025, today)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onSearchEnter}
          />
        </label>
      </div>

      {/* Totals */}
      <div className="rounded-xl border border-border p-4 bg-surface shadow-subtle">
        <div className="text-sm text-muted">Total emissions in range</div>
        <div className="text-3xl font-semibold">
          {formatEmissions(grandTotalKg, units)} CO₂e
        </div>

        {/* Category tiles (server summary first; fallback to client calc if needed) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(summary?.byCategory?.length
            ? summary.byCategory
            : Object.entries(clientTotals.byCategory).map(([category, total_kg]) => ({ category, total_kg }))
          ).map((row) => (
            <div
              key={row.category}
              className="flex flex-col items-start bg-surfaceVariant border border-border rounded-lg p-3 shadow-subtle"
            >
              <span className="text-sm font-medium break-words text-fg">{row.category}</span>
              <span className="text-lg font-semibold text-primary">
                {formatEmissions(Number(row.total_kg), units)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      {err && <div className="text-[rgb(var(--error-fg))] break-words">Request failed: {err}</div>}
      {loading && <div className="text-muted">Loading…</div>}

      {/* Back to month shortcut (only when viewing a single day in list mode). */}
      {view === "list" && range.from.toDateString() === range.to.toDateString() && (
        <div className="flex justify-end">
          <button
            className="mb-2 px-3 py-1 rounded bg-surfaceVariant hover:opacity-80"
            onClick={backToMonth}
            type="button"
          >
            ← Back to month
          </button>
        </div>
      )}

      {/* Content */}
      {view === "list" ? (
        <div className="space-y-3">
          {activities.length === 0 && !loading && (
            <div className="text-muted">No activities for this range.</div>
          )}

          {activities.map((a) => {
            const kg = Number(a.emissions_kg_co2e ?? 0);
            const efKgPerUnit = Number(a.emission_factor || 0);
            const efDisplay = convertFromKg(efKgPerUnit, units); // lb/unit if units==='lb'
            return (
              <div key={a.id} className="border border-border rounded-lg p-3 bg-surface shadow-subtle flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-fg">{a.activity_name || a.category}</div>
                  <div className="text-xs text-muted">{a.category}</div>
                  <div className="text-sm text-muted">
                    {fmtDT.format(new Date(a.occurred_at))} • {formatEmissions(kg, units)} CO₂e
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {Number(a.quantity)} {a.unit} × {efDisplay.toFixed(3)} {units}/{a.unit}
                  </div>
                  {a.meta && a.meta !== "null" && a.meta !== "[]" && (
                    <pre className="text-xs bg-surfaceVariant border border-border rounded p-2 mt-2 overflow-auto max-h-28">
                      {typeof a.meta === "string" ? a.meta : JSON.stringify(a.meta, null, 2)}
                    </pre>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 rounded bg-surfaceVariant hover:opacity-80"
                    onClick={() => openEdit(a)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-[rgb(var(--error-fg))]/15 text-[rgb(var(--error-fg))] hover:bg-[rgb(var(--error-fg))]/25"
                    onClick={() => openDelete(a)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 bg-surface shadow-subtle">
          {daily.length === 0 ? (
            <div className="text-muted">No entries for this range.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
              {daily.map((d) => {
                const totalKg = Number(d.total_kg || 0);
                // Heatmap level: 0 (none) -> 4 (highest) using simple kg thresholds.
                const level = totalKg === 0 ? 0 : totalKg < 1 ? 1 : totalKg < 5 ? 2 : totalKg < 10 ? 3 : 4;
                const shades = [
                  "bg-surfaceVariant",
                  "bg-primary/15",
                  "bg-primary/30",
                  "bg-primary/45",
                  "bg-primary/60",
                ];
                return (
                  <button
                    key={d.day}
                    onClick={() => openDay(d.day)}
                    className={`text-left rounded p-2 ${shades[level]} border border-border focus:outline-none focus:ring-1 focus:ring-primary`}
                    title="Click to view entries for this day"
                    type="button"
                  >
                    <div className="text-xs font-medium text-fg">{d.day}</div>
                    <div className="text-sm text-fg">{formatEmissions(totalKg, units)}</div>
                    <div className="text-xs text-muted">
                      {d.entries} entr{String(d.entries) === "1" ? "y" : "ies"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <EditActivityModal open={!!toEdit} activity={toEdit} onCancel={() => setToEdit(null)} onSave={saveEdit} />
      <ConfirmDeleteModal
        open={!!toDelete}
        itemLabel={toDelete?.activity_name || toDelete?.category || `#${toDelete?.id}`}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default History;

