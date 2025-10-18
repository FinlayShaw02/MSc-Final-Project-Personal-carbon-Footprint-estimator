/**
 * ============================================================
 *  File: Gamification.jsx
 *  Page: Leaderboards / Gamification
 *
 *  Description:
 *  Shows emissions leaderboards over selectable ranges (7d, 30d, MTD, YTD, or
 *  custom) for either Friends or Global scope. Ranks users by “filled daily
 *  average” and surfaces supporting metrics (total, active days, active-day avg).
 *
 *  Units:
 *  Uses UnitsContext (kg/lb) to convert *displayed* figures. Backend stays kg.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import { useUnits } from "../context/UnitsContext"; // 👈 add this

/* ---------- helpers ---------- */
const DAY_MS = 86400000;

// Format Date -> "YYYY-MM-DD" (for inputs and API params)
const fmtDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

// Pure add days helper (doesn't mutate original)
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Number formatters (keep generic; unit-aware wrappers come later)
const nf2 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const nf3 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3, minimumFractionDigits: 3 });

/* ---------- UI bits ---------- */
function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-sm transition ${
        active
          ? "bg-primary text-primaryContrast border-transparent shadow-subtle"
          : "bg-surfaceVariant border-border hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

function ScopeChip({ scope }) {
  const isFriends = scope === "friends";
  return (
    <span
      className={`ml-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-sm ${
        isFriends
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-surfaceVariant border-border text-fg"
      }`}
      aria-label={isFriends ? "Friends leaderboard" : "Global leaderboard"}
    >
      <span aria-hidden>{isFriends ? "👥" : "🌍"}</span>
      {isFriends ? "Friends" : "Global"}
    </span>
  );
}

function Modal({ open, title, children, onCancel, onConfirm, confirmText = "Apply" }) {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    document.addEventListener("keydown", onKey);
    const prev = document.activeElement;
    const first = boxRef.current?.querySelector(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    first?.focus?.();
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <div
        ref={boxRef}
        className="w-[min(92vw,520px)] rounded-2xl border border-border bg-surface shadow-lg p-4"
      >
        <h3 id="modal-title" className="font-semibold text-fg mb-3">
          {title}
        </h3>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-border hover:bg-surfaceVariant"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg border border-transparent bg-primary text-primaryContrast hover:opacity-90"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Unit-aware tooltip
function InfoTip({ activeAvg, prevActiveAvg, unitLabel }) {
  if (activeAvg == null && prevActiveAvg == null) return null;
  const lines = [
    activeAvg != null ? `Active-days avg: ${nf3.format(activeAvg)} ${unitLabel}/day` : null,
    prevActiveAvg != null ? `Prev window: ${nf3.format(prevActiveAvg)} ${unitLabel}/day` : null,
    `Filled avg = total ÷ window days`,
  ].filter(Boolean);
  const title = lines.join("\n");
  return (
    <span className="ml-1 text-muted cursor-help select-none" title={title} aria-label={title}>
      ⓘ
    </span>
  );
}

function Medal({ rank }) {
  const map = { 1: "🥇", 2: "🥈", 3: "🥉" };
  return map[rank] ? <span className="text-xl leading-none">{map[rank]}</span> : null;
}

function Progress({ value, max }) {
  const pct = Math.max(0, Math.min(100, (Number(value || 0) / Math.max(1, Number(max || 1))) * 100));
  return (
    <div
      className="h-2 w-32 rounded-full bg-border overflow-hidden"
      role="progressbar"
      aria-valuenow={Number(value || 0)}
      aria-valuemin={0}
      aria-valuemax={Number(max || 1)}
      aria-label="Active days progress"
    >
      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

// One leaderboard row card (rank + name + metrics)
// Accept unit-aware formatters via props
function Row({ rank, name, metrics, fmtMass, fmtPerDay, unitLabel }) {
  const { total, avg_filled, active_days, window_days, active_avg, prev_active_avg } = metrics;

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-subtle">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 min-w-[2.5rem]">
          <span className="text-sm font-semibold tabular-nums text-muted">{rank}</span>
          <Medal rank={rank} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-fg truncate">{name || "-"}</h3>

          {/* bottom stats row */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
            <div className="sm:col-span-1">
              <div className="text-xs text-muted">Total</div>
              <div className="font-semibold tabular-nums">{fmtMass(total)}</div>
            </div>

            <div className="sm:col-span-1">
              <div className="text-xs text-muted">
                Avg/day (filled){" "}
                <InfoTip
                  activeAvg={active_avg != null ? active_avg : null}
                  prevActiveAvg={prev_active_avg != null ? prev_active_avg : null}
                  unitLabel={unitLabel}
                />
              </div>
              <div className="tabular-nums">{fmtPerDay(avg_filled)}</div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <div className="text-xs text-muted">Active days</div>
              <Progress value={active_days} max={window_days} />
              <div className="tabular-nums text-sm text-muted">
                {active_days}/{window_days}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- API mapping ---------- */
const API = {
  _periodFromSpan(start, end) {
    const ms = new Date(end) - new Date(start);
    const days = Math.max(1, Math.floor(ms / DAY_MS) + 1);
    if (days >= 330) return "year";
    if (days >= 25) return "month";
    return "week";
  },

  _normaliseRows(res) {
    const rows = Array.isArray(res?.rows) ? res.rows : (Array.isArray(res) ? res : []);
    const daysFromMeta = Number(res?.range?.days ?? 0);

    return rows.map((r, i) => {
      const window_days = Number(r.window_days ?? r.period_days ?? r.days ?? daysFromMeta ?? 0);
      const total_kg = Number(r.total_kg ?? r.total ?? 0);
      const active_days = Number(r.active_days ?? r.active ?? 0);
      const avgFilled = window_days > 0 && Number.isFinite(total_kg) ? total_kg / window_days : 0;

      return {
        user_id: Number(r.user_id ?? r.id ?? 0),
        name: r.name ?? r.email ?? "Unknown",
        rank: Number(r.rank ?? i + 1),
        total: total_kg,            // stored in kg
        avg_filled: avgFilled,      // kg/day
        active_days,
        window_days,
        active_avg: r.avg_active_day != null ? Number(r.avg_active_day) : null,           // kg/day
        prev_active_avg: r.prev_avg_active_day != null ? Number(r.prev_avg_active_day) : null, // kg/day
      };
    });
  },

  async leaderboard({ scope, start, end }) {
    try {
      const res1 = await api.get("/leaderboard.php", {
        params: { scope, start, end, min_active_days: 1 },
      });
      if (res1 && typeof res1 === "object") {
        const rows = this._normaliseRows(res1);
        if (rows.length > 0 || res1?.range) return rows;
      }
    } catch (e) {
      console.warn("leaderboard start/end request failed:", e);
    }

    const period = this._periodFromSpan(start, end);
    try {
      const res2 = await api.get("/leaderboard.php", {
        params: { scope, period, min_active_days: 1 },
      });
      if (res2 && typeof res2 === "object") {
        return this._normaliseRows(res2);
      }
    } catch (e2) {
      console.warn("leaderboard period fallback failed:", e2);
    }

    return [];
  },
};

/* ---------- Page ---------- */
export default function Gamification() {
  const { units } = useUnits(); // 👈 read current units ("kg" | "lb")

  // conversion factor from kg -> display units
  const { massFactor, unitLabel } = useMemo(() => {
    if (units === "lb") return { massFactor: 2.20462262185, unitLabel: "lb" };
    return { massFactor: 1, unitLabel: "kg" };
  }, [units]);

  // Unit-aware display formatters
  const fmtMass = useMemo(
    () => (n) => `${nf2.format(Number(n || 0) * massFactor)} ${unitLabel}`,
    [massFactor, unitLabel]
  );
  const fmtPerDay = useMemo(
    () => (n) => `${nf3.format(Number(n || 0) * massFactor)} ${unitLabel}/day`,
    [massFactor, unitLabel]
  );

  const [scope, setScope] = useState("friends"); // friends | global
  const [range, setRange] = useState("ytd");     // 7d | 30d | mtd | ytd | custom

  const today = useMemo(() => new Date(), []);
  const [start, setStart] = useState(fmtDate(new Date(today.getFullYear(), 0, 1)));
  const [end, setEnd] = useState(fmtDate(today));

  const [customOpen, setCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState(start);
  const [customEnd, setCustomEnd] = useState(end);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    if (range === "7d") {
      setStart(fmtDate(addDays(now, -6)));
      setEnd(fmtDate(now));
    } else if (range === "30d") {
      setStart(fmtDate(addDays(now, -29)));
      setEnd(fmtDate(now));
    } else if (range === "mtd") {
      setStart(fmtDate(new Date(y, m, 1)));
      setEnd(fmtDate(now));
    } else if (range === "ytd") {
      setStart(fmtDate(new Date(y, 0, 1)));
      setEnd(fmtDate(now));
    }
  }, [range]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const data = await API.leaderboard({ scope, start, end });
        if (!cancel) setRows(data);
      } catch (e) {
        if (!cancel) setToast({ type: "error", msg: e?.message || "Failed to load leaderboard." });
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [scope, start, end]);

  const titleDates = useMemo(() => {
    if (range === "7d") return "Last 7 days";
    if (range === "30d") return "Last 30 days";
    if (range === "mtd") return "Month to date";
    if (range === "ytd") return "Year to date";
    return `${start} -> ${end}`;
  }, [range, start, end]);

  const applyCustom = () => {
    if (!customStart || !customEnd) {
      setToast({ type: "error", msg: "Please select both start and end dates." });
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setToast({ type: "error", msg: "Start date must be before end date." });
      return;
    }
    setStart(customStart);
    setEnd(customEnd);
    setRange("custom");
    setCustomOpen(false);
  };

  const emptyMessage = useMemo(() => {
    return scope === "global"
      ? "No public profiles with activity in this range yet."
      : "No data for you or your friends in this range.";
  }, [scope]);

  return (
    <div className="p-4 text-fg max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">
          Leaderboards
          <ScopeChip scope={scope} />
        </h1>

        <div className="flex items-center gap-2 ml-auto">
          <Pill active={scope === "friends"} onClick={() => setScope("friends")}>Friends</Pill>
          <Pill active={scope === "global"} onClick={() => setScope("global")}>Global</Pill>
        </div>

        <div className="w-full flex flex-wrap items-center gap-2 mt-2">
          <Pill active={range === "7d"} onClick={() => setRange("7d")}>7d</Pill>
          <Pill active={range === "30d"} onClick={() => setRange("30d")}>30d</Pill>
          <Pill active={range === "mtd"} onClick={() => setRange("mtd")}>MTD</Pill>
          <Pill active={range === "ytd"} onClick={() => setRange("ytd")}>YTD</Pill>
          <Pill active={range === "custom"} onClick={() => setCustomOpen(true)}>Custom…</Pill>

          <span className="text-xs px-2 py-1 rounded-full border border-border bg-surfaceVariant ml-auto">
            {titleDates}
          </span>
        </div>
      </header>

      {/* Main list area */}
      {loading ? (
        <div className="text-muted text-sm border border-border rounded-2xl p-4 bg-surface shadow-subtle">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-muted text-sm border border-border rounded-2xl p-4 bg-surface shadow-subtle">
          {emptyMessage}
        </div>
      ) : (
        <section className="space-y-3">
          {rows.map((r) => {
            // Convert kg -> display units once here for each row
            const massTotal = r.total * massFactor; // kg -> units
            const filledPerDay = r.avg_filled * massFactor; // (kg/day) -> (units/day)
            const activePerDay = r.active_avg != null ? r.active_avg * massFactor : null;
            const prevActivePerDay = r.prev_active_avg != null ? r.prev_active_avg * massFactor : null;

            return (
              <Row
                key={r.user_id || `${r.name}-${r.rank}`}
                rank={r.rank}
                name={r.name}
                metrics={{
                  total: massTotal,
                  avg_filled: filledPerDay,
                  active_days: r.active_days,
                  window_days: r.window_days,
                  active_avg: activePerDay,
                  prev_active_avg: prevActivePerDay,
                }}
                fmtMass={fmtMass}
                fmtPerDay={fmtPerDay}
                unitLabel={unitLabel}
              />
            );
          })}
        </section>
      )}

      {/* Custom date picker modal */}
      <Modal
        open={customOpen}
        title="Pick a custom date range"
        onCancel={() => setCustomOpen(false)}
        onConfirm={applyCustom}
        confirmText="Apply range"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">Start date</span>
            <input
              type="date"
              value={customStart}
              max={fmtDate(new Date())}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">End date</span>
            <input
              type="date"
              value={customEnd}
              max={fmtDate(new Date())}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 bg-surface text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
        </div>
        <p className="text-xs text-muted mt-3">
          We rank by <strong>filled daily average</strong> in this window (inactive days are filled using
          your active day average for the same window). Hover the ⓘ to see active day averages.
        </p>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50" role="status" aria-live="polite">
          <div
            className={`px-3 py-2 text-sm rounded-lg border shadow-subtle ${
              toast.type === "error"
                ? "text-[rgb(var(--error-fg))] bg-[rgb(var(--error-bg))] border-[rgb(var(--error-fg))]/25"
                : "text-[rgb(var(--success-fg))] bg-[rgb(var(--success-bg))] border-[rgb(var(--success-fg))]/20"
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
