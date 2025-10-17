/**
 * ============================================================
 *  File: LogActivity.jsx
 *  Component: LogActivity
 *
 *  Description:
 *  Browse and log carbon-emitting activities (transport, energy,
 *  food, water, waste, general). Users can filter by category,
 *  search by name, enter a quantity in a modal, and persist the
 *  entry to the backend. Shows a live CO₂e preview that respects
 *  the global units setting (kg ↔ lb).
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useMemo, useState } from "react";
import allActivities from "../data/Activities/allActivities";
import ActivityModal from "../components/ui/ActivityModal";
import { api } from "../services/api"; // centralised wrapper (sends credentials + token)
import { useUnits } from "../context/UnitsContext";
import { convertFromKg, formatEmissions } from "../utils/formatEmissions";

// Map top-level UI categories -> underlying activity category slugs in the dataset.
// Used to filter the large activities list into approachable groups.
const categoryGroups = {
  travel: ["business_travel_air", "business_travel_sea", "passenger_vehicles", "delivery_vehicles"],
  electricity: ["uk_electricity", "uk_electricity_for_evs"],
  waste: ["waste_disposal"],
  water: ["water_supply"],
  food: ["food"],
  home: ["homeworking", "hotel_stay"],
  general: ["general"],
};

function LogActivity() {
  const { units } = useUnits(); // global units (kg or lb) from context

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null); // current card opened in modal
  const [quantity, setQuantity] = useState(""); // user input in modal
  const [calculated, setCalculated] = useState(null); // cached formatted total after successful submit
  const [saving, setSaving] = useState(false); // disable modal submit while posting
  const [notice, setNotice] = useState(null); // global toast-ish banner: { type, message }

  // Top row category pill options
  const topLevelCategories = ["all", ...Object.keys(categoryGroups)];

  // Filter master activities list by chosen category + search term
  const filteredActivities = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return allActivities.filter((activity) => {
      const inCategory =
        selectedCategory === "all" ||
        categoryGroups[selectedCategory]?.includes(activity.category);
      const matchesSearch = activity.activity.toLowerCase().includes(q);
      return inCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Live preview of total emissions based on current quantity (uses global units)
  const livePreview = useMemo(() => {
    if (!selectedActivity) return "";
    const qty = Number(quantity);
    const efKgPerUnit = Number(selectedActivity.emissionFactor); // kg CO2e per unit
    if (!qty || !efKgPerUnit) return "";
    const totalKg = qty * efKgPerUnit;
    return formatEmissions(totalKg, units, 3);
  }, [selectedActivity, quantity, units]);

  // Submit handler from modal
  const handleSubmit = async (qty) => {
    if (!selectedActivity) return;

    // Construct payload; server calculates & stores in kg
    const payload = {
      // Do NOT send user_id; backend should read session/current_user_id()
      activity_id: selectedActivity.id,
      activity_name: selectedActivity.activity,
      category: selectedActivity.category,
      type: selectedActivity.type || "general",
      unit: selectedActivity.unit,
      emission_factor: Number(selectedActivity.emissionFactor), // kg per unit (stored in kg server-side)
      quantity: Number(qty),
      occurred_at: new Date().toISOString().slice(0, 19).replace("T", " "), // MySQL DATETIME
      meta: {},
    };

    // Precompute pretty display string for success banner
    const totalKg = payload.quantity * payload.emission_factor;
    const pretty = formatEmissions(totalKg, units, 3);

    setSaving(true);
    setNotice(null);

    try {
      const data = await api.post("/log_activity.php", payload);
      if (data?.success) {
        setCalculated(pretty); // lock in the exact value that was submitted
        setNotice({ type: "success", message: "Activity logged successfully" });
      } else {
        throw new Error(data?.error || "Unknown error from server");
      }
    } catch (err) {
      // Friendly message for auth issues; otherwise show server/unknown error
      const msg = err?.message || "Failed to log activity";
      if (/unauthorised|401/i.test(msg)) {
        setNotice({ type: "error", message: "Please sign in to log activities." });
      } else {
        setNotice({ type: "error", message: msg });
      }
    } finally {
      setSaving(false);
    }
  };

  // When an activity card is chosen, reset modal inputs/state
  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setQuantity("");
    setCalculated(null);
    setNotice(null);
  };

  // Close modal and clear temporary state
  const handleCloseModal = () => {
    setSelectedActivity(null);
    setQuantity("");
    setCalculated(null);
    setSaving(false);
  };

  return (
    <div className="w-full text-fg">
      {/* Sticky Header with category pills, search, and notice */}
        <div
          className="
            sticky top-[56px] md:top-0 z-25 relative isolate
            bg-surface/95 backdrop-blur-md border-b border-border px-6 pt-6 pb-4 shadow-subtle
            [@supports(backdrop-filter:blur(0))]:bg-surface/90
            after:content-[''] after:block after:h-3
          "
        >
        <h1 className="text-2xl font-bold mb-2">Log Activity</h1>
        <p className="text-muted mb-4">Track your CO₂ emissions from daily actions.</p>

        {/* Category filter pills — resets search and modal selections when switching */}
        <div className="flex flex-wrap gap-2 mb-2">
          {topLevelCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
                selectedCategory === cat
                  ? "bg-primary text-primaryContrast border-transparent"
                  : "bg-surfaceVariant text-fg border-border hover:opacity-80"
              }`}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedActivity(null);
                setSearchTerm("");
                setQuantity("");
                setCalculated(null);
                setNotice(null);
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Search by activity label; clears modal state to avoid stale previews */}
        <input
          type="text"
          placeholder="Search for an activity..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedActivity(null);
            setQuantity("");
            setCalculated(null);
            setNotice(null);
          }}
          className="w-full border border-border rounded px-3 py-2 text-sm shadow-subtle
                     bg-surface text-fg placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Global notice for success or errors from the last submission */}
        {notice && (
          <div
            className={`mt-3 text-sm px-3 py-2 rounded border ${
              notice.type === "success"
                ? "text-[rgb(var(--success-fg))] bg-[rgb(var(--success-bg))] border-border"
                : "text-[rgb(var(--error-fg))] bg-[rgb(var(--error-bg))] border-border"
            }`}
          >
            {notice.message}
          </div>
        )}
      </div>

      {/* Activity grid — keyboard accessible (Enter/Space) and shows selected styling */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1 px-4 sm:px-6 mt-4 mb-10">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
          <div
            key={activity.id}
            role="button"
            tabIndex={0}
            aria-pressed={selectedActivity?.id === activity.id}
            onClick={() => handleActivityClick(activity)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActivityClick(activity);
              }
            }}
            className={
              `activity-card p-3 text-center flex flex-col items-center justify-center
              shadow-subtle h-28 sm:h-32 md:h-36
              ${selectedActivity?.id === activity.id ? "activity-card--selected" : ""}`
            }
          >
            {/* Name only; icons/images can be layered via CSS if desired */}
            <p className="text-xs sm:text-sm md:text-base font-medium leading-tight text-center break-words overflow-hidden text-ellipsis max-w-full max-h-full">
              {activity.activity}
            </p>
          </div>
          ))
        ) : (
          <p className="text-muted text-sm col-span-full px-6">No activities found.</p>
        )}
      </div>

      {/* Activity modal — handles quantity input and submit; shows live or finalised emission calc */}
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          quantity={quantity}
          setQuantity={setQuantity}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          calculated={calculated ?? livePreview} // prefer final saved value; else live preview
          saving={saving}
          emissionFactorDisplay={
            selectedActivity?.emissionFactor != null
              ? convertFromKg(Number(selectedActivity.emissionFactor), units).toFixed(3)
              : null
          }
          units={units}
        />
      )}
    </div>
  );
}

export default LogActivity;
