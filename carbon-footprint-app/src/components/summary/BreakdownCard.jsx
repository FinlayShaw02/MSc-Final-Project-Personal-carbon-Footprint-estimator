/**
 * ============================================================
 *  File: BreakdownCard.jsx
 *  Component: BreakdownCard
 *
 *  Description:
 *  A summary visualisation card that fetches emission breakdown data
 *  from the backend (`summary.php`) and renders it using the CO2PieChart
 *  component. Displays the total carbon footprint and category distribution
 *  within a selected date range.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import CO2PieChart from "../charts/CO2PieChart";

export default function BreakdownCard({
  from,
  to,
  initialCategory = "all",
  apiBase = "http://localhost/carbon_app_api",
  topN,
}) {
  // UI + data state
  const [category, setCategory] = useState(initialCategory); // current filter (e.g., "all" or a category)
  const [loading, setLoading] = useState(false);             // loading flag for fetch
  const [err, setErr] = useState(null);                      // error message if fetch fails
  const [data, setData] = useState({
    totalKg: 0,
    group: "category",     // "category" or "activity" (server-driven)
    categoryName: null,    // selected category label (server echo)
    items: [],             // array of { label, value } for chart
  });

  // Build query string from props/state
  const qs = useMemo(() => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (category != null) q.set("category", category);
    return q.toString();
  }, [from, to, category]);

  // Fetch summary data whenever apiBase or query string changes
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setErr(null);

    fetch(`${apiBase}/summary.php?${qs}`, {
      signal: ac.signal,
      credentials: "include", // include session cookie
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        // Normalise + guard against missing fields
        setData({
          totalKg: Number(j.totalKg ?? 0),
          group: j.group === "activity" ? "activity" : "category",
          categoryName: j.category || null,
          items: Array.isArray(j.items) ? j.items : [],
        });
      })
      .catch((e) => {
        if (e.name !== "AbortError") setErr(e.message || "Failed to load");
      })
      .finally(() => setLoading(false));

    // Cleanup to cancel in-flight request on unmount/dep change
    return () => ac.abort();
  }, [apiBase, qs]);

  // Optionally cap legend items shown in the chart and group the remainder into "Other"
  const chartItems = useMemo(() => {
    const items = Array.isArray(data.items) ? data.items : [];
    if (!topN || items.length <= topN) return items;
    const top = items.slice(0, topN);
    const otherTotal = items.slice(topN).reduce((s, r) => s + Number(r.value || 0), 0);
    if (otherTotal > 0) top.push({ label: "Other", value: otherTotal });
    return top;
  }, [data.items, topN]);

  // Prefer server-provided categoryName; fall back to local state when not "all"
  const selectedCategory =
    data.categoryName || (category && category !== "all" ? category : null);

  // Handlers to drill in/out by category (wired to CO2PieChart props)
  const handleSelectCategory = (label) => setCategory(label);
  const handleBack = () => setCategory("all");

  // Skeleton while loading
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 shadow-subtle">
        <div className="mb-3 h-5 w-56 rounded bg-surfaceVariant" />
        <div className="h-72 rounded bg-surfaceVariant animate-pulse" />
      </div>
    );
  }

  // Error state
  if (err) {
    return (
      <div className="rounded-xl border border-errorFg/20 bg-errorBg/20 p-4 text-errorFg">
        <div className="font-semibold mb-1">Couldn’t load breakdown</div>
        <div className="text-sm">{String(err)}</div>
      </div>
    );
  }

  // Main content
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-subtle">
      <CO2PieChart
        data={chartItems}
        group={data.group}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory} // clicking a legend/slice drills down
        onBack={data.group === "activity" ? handleBack : undefined} // show back only when drilled into activities
        units="kg"
        palette="okabe"
        sort="desc"
        innerRadius={0.6}
        size={280}
      />

      {/* Total for current range */}
      <div className="mt-3 text-xs text-muted">
        Total in range:{" "}
        <span className="tabular-nums font-medium text-fg">
          {Number(data.totalKg || 0).toFixed(3)} kg
        </span>
      </div>
    </div>
  );
}