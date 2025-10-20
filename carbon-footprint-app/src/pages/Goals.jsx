/**
 * ============================================================
 *  File: Goals.jsx
 *  Component: Goals
 *
 *  Description:
 *  Create & manage personal emission caps.
 *  Includes inline validation and a modal for delete confirm.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { listGoals, createGoal, deleteGoal } from "../services/goals";
import { useUnits } from "../context/UnitsContext";
import { formatEmissions, LB_PER_KG } from "../utils/formatEmissions";
import allActivities from "../data/Activities/allActivities";
import FrostedSelect from "../components/ui/FrostedSelect";

// Base API URL for this file only.
const API_BASE = "http://localhost/carbon_app_api";
const WITH_CREDS = { credentials: "include" };

// --- Date/format helpers ------------------------------------------------------
const pad = (n) => String(n).padStart(2, "0");
const toSQL = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

function startEndOf(period, base = new Date()) {
  if (period === "week") {
    const d = new Date(base);
    const weekday = (d.getDay() + 6) % 7; // Mon=0..Sun=6
    const from = new Date(d);
    from.setDate(d.getDate() - weekday);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }
  if (period === "year") {
    const from = new Date(base.getFullYear(), 0, 1, 0, 0, 0, 0);
    const to = new Date(base.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { from, to };
  }
  const from = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

async function fetchSummary({ from, to, category }) {
  const qs = new URLSearchParams({
    from: toSQL(from),
    to: toSQL(to),
    ...(category ? { category } : {}),
  });
  const res = await fetch(`${API_BASE}/summary.php?${qs.toString()}`, WITH_CREDS);
  if (!res.ok) throw new Error("Failed to load summary");
  return res.json(); // { totalKg, byCategory: [...] }
}

// --- Tiny modal component -----------------------------------------------------
function ConfirmModal({ open, title, children, onCancel, onConfirm, dangerText = "Delete" }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
    >
      {/* backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* dialog */}
      <div
        className="relative w-[95vw] max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold mb-2 text-fg">{title}</h2>
        <div className="text-sm text-muted mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded border border-border hover:bg-surfaceVariant"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded bg-[rgb(var(--error-fg))] text-black/90 hover:opacity-90"
            onClick={onConfirm}
          >
            {dangerText}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Accessible progress bar --------------------------------------------------
function ProgressBar({ percent, currentKg, targetKg, overCap, units }) {
  const p = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const barColor = overCap ? "bg-[rgb(var(--error-fg))]" : "bg-[rgb(var(--primary))]";
  const railColor = overCap ? "bg-[rgb(var(--error-fg))]/20" : "bg-surfaceVariant";

  const diffKg = Math.max(0, (currentKg ?? 0) - (targetKg ?? 0));
  const overCapText = overCap ? `Over cap by ${formatEmissions(diffKg, units)} CO₂e` : "";

  return (
    <div className="w-full">
      <div
        className={`relative h-3 sm:h-3.5 w-full ${railColor} rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.max(1, targetKg || 1)}
        aria-valuenow={Math.min(currentKg || 0, targetKg || 0)}
        aria-valuetext={`${formatEmissions(currentKg || 0, units)} of ${formatEmissions(targetKg || 0, units)}`}
        aria-label="Emissions progress towards target"
      >
        <div
          className={`h-full ${barColor} rounded-full transition-[width] duration-500 will-change-auto`}
          style={{ width: `${p}%`, minWidth: p > 0 ? "2px" : 0 }}
        />
        <div className="absolute inset-y-0 right-0 w-[2px] bg-border" aria-hidden title="Target" />
      </div>

      <div className="mt-1 flex justify-between text-[10px] leading-tight text-muted">
        <span>0%</span><span>50%</span><span>100%</span>
      </div>

      {overCap && (
        <div className="mt-1 text-xs text-[rgb(var(--error-fg))]">
          {overCapText}
        </div>
      )}
    </div>
  );
}


export default function Goals() {
  const { units } = useUnits();

  const categoryOptions = useMemo(() => {
    const set = new Set(allActivities.map((a) => a.category).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, []);

  const periodSelectOptions = useMemo(
    () => [
      { value: "week", label: "per week" },
      { value: "month", label: "per month" },
      { value: "year", label: "per year" },
    ],
    []
  );
  const categorySelectOptions = useMemo(
    () => categoryOptions.map((c) => ({ value: c, label: c === "all" ? "All categories" : c })),
    [categoryOptions]
  );

  // --- Local state ------------------------------------------------------------
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    period: "month",
    category: "all",
    target_value: "",
  });
  const [saving, setSaving] = useState(false);

  // feedback UI
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // { name, period, target_value }

  // modal state
  const [confirmId, setConfirmId] = useState(null);

  // Cache totals by (`period::category||*`)
  const [totalsKg, setTotalsKg] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await listGoals();
        setGoals(Array.isArray(list) ? list : []);
      } catch (e) {
        setErr(e?.message || "Failed to load goals");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const toFetch = [];
      for (const g of goals) {
        const key = `${g.period}::${g.category || "*"}`;
        if (!(key in totalsKg)) {
          toFetch.push({ period: g.period, category: g.category || null, key });
        }
      }
      if (!toFetch.length) return;

      const updates = {};
      await Promise.all(
        toFetch.map(async ({ period, category, key }) => {
          try {
            const { from, to } = startEndOf(period);
            const data = await fetchSummary({ from, to, category });
            updates[key] = Number(data?.totalKg || 0);
          } catch {
            updates[key] = 0;
          }
        })
      );
      setTotalsKg((prev) => ({ ...prev, ...updates }));
    })();
  }, [goals, totalsKg]);

  const setField = (k, v) => {
    setFieldErrors((fe) => ({ ...fe, [k]: undefined }));
    setForm((f) => ({ ...f, [k]: v }));
  };

  // --- Validation -------------------------------------------------------------
  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter a goal name.";
    if (!form.period) errs.period = "Select week, month, or year.";
    const v = parseFloat(form.target_value);
    if (form.target_value === "" || Number.isNaN(v)) {
      errs.target_value = "Please enter a number.";
    } else if (v < 0) {
      errs.target_value = "Target must be ≥ 0.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // --- Create goal ------------------------------------------------------------
  async function onCreate(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!validateForm()) return;

    const v = parseFloat(form.target_value);
    const target_kg = units === "lb" ? v / LB_PER_KG : v;
    const category = form.category === "all" ? null : form.category;

    try {
      setSaving(true);
      await createGoal({
        name: form.name.trim(),
        period: form.period,
        category,
        target_kg,
        is_active: 1,
      });

      const list = await listGoals();
      setGoals(Array.isArray(list) ? list : []);

      setForm({
        name: "",
        period: form.period,
        category: form.category,
        target_value: "",
      });

      const key = `${form.period}::${category || "*"}`;
      setTotalsKg((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });

      setFormSuccess("Goal added.");
    } catch (e) {
      setFormError(e?.message || "Failed to create goal.");
    } finally {
      setSaving(false);
    }
  }

  // --- Delete (modal) ---------------------------------------------------------
  function openConfirm(id) {
    setFormError("");
    setFormSuccess("");
    setConfirmId(id);
  }

  async function confirmDelete() {
    const id = confirmId;
    if (!id) return;
    try {
      await deleteGoal(id);
      setGoals((g) => g.filter((x) => x.id !== id));
      setFormSuccess("Goal deleted.");
    } catch (e) {
      setFormError(e?.message || "Failed to delete goal.");
    } finally {
      setConfirmId(null);
    }
  }

  // --- Goal cards -------------------------------------------------------------
  const goalCards = useMemo(() => {
    return goals.map((g) => {
      const key = `${g.period}::${g.category || "*"}`;
      const totalKg = totalsKg[key] ?? 0;
      const targetKg = Number(g.target_kg);

      // compute raw percent, clamp copy for the bar
      const rawPct =
        targetKg > 0 ? (totalKg / targetKg) * 100 : (totalKg > 0 ? Infinity : 0);
      const pctForBar = Number.isFinite(rawPct)
        ? Math.max(0, Math.min(100, rawPct))
        : 100; // show full bar if target is 0 but there are emissions
      const overCap = Number.isFinite(rawPct) ? rawPct > 100 : totalKg > 0;

      const pctText = Number.isFinite(rawPct)
        ? Math.min(999, Math.max(0, Math.round(rawPct)))
        : "100+";

      return (
        <div key={g.id} className="border border-border rounded p-4 bg-surface shadow-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-fg">{g.name}</div>
              <div className="text-xs text-muted">
                <span className="capitalize">{g.period}</span> cap •{" "}
                {g.category ? (
                  <span className="inline-block px-1.5 py-0.5 rounded bg-surfaceVariant">{g.category}</span>
                ) : (
                  "All categories"
                )}
              </div>
            </div>
            <button
              className="text-[rgb(var(--error-fg))] text-sm hover:underline"
              onClick={() => openConfirm(g.id)}
              type="button"
              aria-label={`Delete goal ${g.name}`}
            >
              Delete
            </button>
          </div>

          <div className="text-sm text-fg">
            Target: <strong>{formatEmissions(targetKg, units)}</strong> / {g.period}
          </div>
          <div className="text-sm text-fg">
            This {g.period}: <strong>{formatEmissions(totalKg, units)}</strong>
            {g.category ? ` in ${g.category}` : ""}
          </div>

          {/* Progress visual */}
          <ProgressBar
            percent={pctForBar}
            currentKg={totalKg}
            targetKg={targetKg}
            overCap={overCap}
            units={units} 
          />

          <div className={`text-xs ${overCap ? "text-[rgb(var(--error-fg))]" : "text-[rgb(var(--primary))]"}`}>
            {pctText}% of cap used
          </div>
        </div>
      );
    });
  }, [goals, totalsKg, units]);

  // Find the goal being deleted
  const goalToDelete = confirmId ? goals.find((g) => g.id === confirmId) : null;

  return (
    <div className="p-4 max-w-3xl mx-auto text-fg">
      <h1 className="text-2xl font-bold mb-2">Your Goals</h1>
      <p className="text-muted mb-4">
        Create caps per <em>period</em> and <em>category</em>, or across <em>all activities</em>.
      </p>

      {/* Top feedback banners */}
      {formError && (
        <div className="mb-4 rounded border border-[rgb(var(--error-fg))]/30 bg-[rgb(var(--error-fg))]/10 p-3 text-[rgb(var(--error-fg))]">
          {formError}
        </div>
      )}
      {formSuccess && (
        <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 p-3 text-green-300">
          {formSuccess}
        </div>
      )}

      {/* Create-goal form */}
      <form onSubmit={onCreate} className="border border-border rounded p-4 mb-6 bg-surface shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Name */}
          <div className="sm:col-span-5">
            <label className="block text-sm text-muted mb-1">Goal name</label>
            <input
              className={`w-full h-10 border rounded px-3 bg-surface text-fg focus:outline-none focus:ring-1 ${
                fieldErrors.name
                  ? "border-[rgb(var(--error-fg))]/60 focus:ring-[rgb(var(--error-fg))]"
                  : "border-border focus:ring-primary"
              }`}
              placeholder="Goal name (e.g., Monthly transport)"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
            <p className={`mt-1 text-xs h-4 ${fieldErrors.name ? "text-[rgb(var(--error-fg))] visible" : "invisible"}`}>
              {fieldErrors.name || "placeholder"}
            </p>
          </div>

          {/* Period */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-muted mb-1">Period</label>
            <FrostedSelect
              value={form.period}
              onChange={(v) => setField("period", v)}
              options={periodSelectOptions}
              placeholder="per month"
              triggerClassName={`h-10 ${fieldErrors.period ? "border-[rgb(var(--error-fg))]/60" : ""}`}
            />
            <p className={`mt-1 text-xs h-4 ${fieldErrors.period ? "text-[rgb(var(--error-fg))] visible" : "invisible"}`}>
              {fieldErrors.period || "placeholder"}
            </p>
          </div>

          {/* Category */}
          <div className="sm:col-span-3">
            <label className="block text-sm text-muted mb-1">Category</label>
            <FrostedSelect
              value={form.category}
              onChange={(v) => setField("category", v)}
              options={categorySelectOptions}
              placeholder="All categories"
              triggerClassName="h-10"
            />
            <p className="mt-1 text-xs h-4 invisible">placeholder</p>
          </div>

          {/* Target */}
          <div className="sm:col-span-2">
            <label className="block text-sm text-muted mb-1">Target ({units})</label>
            <input
              className={`w-full h-10 border rounded px-3 bg-surface text-fg focus:outline-none focus:ring-1 ${
                fieldErrors.target_value
                  ? "border-[rgb(var(--error-fg))]/60 focus:ring-[rgb(var(--error-fg))]"
                  : "border-border focus:ring-primary"
              }`}
              inputMode="decimal"
              placeholder={`Target (${units})`}
              value={form.target_value}
              onChange={(e) => setField("target_value", e.target.value)}
            />
            <p
              className={`mt-1 text-xs h-4 ${
                fieldErrors.target_value ? "text-[rgb(var(--error-fg))] visible" : "invisible"
              }`}
            >
              {fieldErrors.target_value || "placeholder"}
            </p>
          </div>

          {/* Submit */}
          <div className="sm:col-span-12">
            <button
              className="bg-primary text-primaryContrast px-4 py-2 rounded disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving…" : "Add goal"}
            </button>
          </div>
        </div>
      </form>

      {/* List or empty/loading/error states */}
      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : err ? (
        <div className="text-[rgb(var(--error-fg))]">Error: {err}</div>
      ) : goals.length === 0 ? (
        <div className="text-muted">No goals yet, create your first one above.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{goalCards}</div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!confirmId}
        title="Delete goal?"
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        dangerText="Delete"
      >
        {goalToDelete ? (
          <>
            This will permanently remove <b>{goalToDelete.name}</b> (
            <span className="capitalize">{goalToDelete.period}</span>
            {", "}
            {goalToDelete.category || "All categories"}). This action cannot be undone.
          </>
        ) : (
          "Are you sure you want to delete this goal?"
        )}
      </ConfirmModal>
    </div>
  );
}
