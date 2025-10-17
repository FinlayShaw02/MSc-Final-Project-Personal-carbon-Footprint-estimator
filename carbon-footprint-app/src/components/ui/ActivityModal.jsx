/**
 * ============================================================
 *  File: ActivityModal.jsx
 *  Component: ActivityModal
 *
 *  Description:
 *  Modal for logging a specific activity with its emission factor.
 *  Displays activity details, collects user inputs, previews the
 *  calculated emissions in the user’s preferred units and submits
 *  a validated quantity back to the parent.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useState, useEffect, useMemo } from "react";
import { useUnits } from "../../context/UnitsContext";
import { convertFromKg, formatEmissions } from "../../utils/formatEmissions";

function ActivityModal({ activity, onSubmit, onClose, calculated }) {
  const { units } = useUnits(); // "kg" or "lb" (user-selected display units)
  const [inputs, setInputs] = useState({}); // dynamic input fields, keyed by userInputs or "quantity"

  useEffect(() => {
    // Reset input fields when the selected activity changes.
    // If activity defines multiple userInputs, initialise each as an empty string.
    // Otherwise, default to a single "quantity" field.
    const initial = {};
    if (activity.userInputs?.length > 0) {
      activity.userInputs.forEach((key) => (initial[key] = ""));
    } else {
      initial.quantity = "";
    }
    setInputs(initial);
  }, [activity]);

  // Generic change handler for all input fields
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Parse numeric quantity:
  // - If multiple inputs are provided, multiply them together
  // - Otherwise use the single "quantity" field
  const parsedQuantity = useMemo(() => {
    if (activity.userInputs?.length > 0) {
      return activity.userInputs.reduce((acc, key) => {
        const v = parseFloat(inputs[key] || 0);
        return acc * (isNaN(v) ? 0 : v);
      }, 1);
    }
    const q = parseFloat(inputs.quantity || 0);
    return isNaN(q) ? 0 : q;
  }, [activity.userInputs, inputs]);

  // Validate and submit numeric quantity to parent
  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = parsedQuantity;
    if (!quantity || quantity <= 0) return; // guard: require a positive value
    onSubmit(quantity);
  };

  // Emission factor is stored in kg per unit on the activity object
  const efKgPerUnit = Number(activity?.emissionFactor || 0);

  // Convert the emission factor to the user's display units for the UI (kg/unit -> lb/unit if needed)
  const factorDisplay = useMemo(() => {
    const v = convertFromKg(efKgPerUnit, units);
    return Number.isFinite(v) ? v.toFixed(4) : "0.0000";
  }, [efKgPerUnit, units]);

  // Live preview of total emissions in the chosen units, based on current inputs.
  // Keeps calculations in kg internally, then formats for display.
  const livePreview = useMemo(() => {
    const qty = parsedQuantity;
    if (!qty || !efKgPerUnit) return "";
    const totalKg = qty * efKgPerUnit; // core calculation in kg
    return formatEmissions(totalKg, units, 3);
  }, [parsedQuantity, efKgPerUnit, units]);

  return (
    <div className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-surface text-fg border border-border p-6 rounded-xl shadow-subtle max-w-sm w-full relative">
        {/* Close button (top-right) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-md px-2 py-1 text-muted hover:bg-surfaceVariant"
          aria-label="Close"
          type="button"
        >
          ×
        </button>

        {/* Activity title */}
        <h2 className="text-lg font-semibold mb-1">{activity.activity}</h2>

        {/* Unit + per-unit emission factor (displayed in selected units) */}
        <p className="text-sm text-muted mb-4">
          Unit: <strong className="text-fg">{activity.unit}</strong>{" "}
          <span className="text-primary font-medium">
            | {factorDisplay} {units} CO₂e / {activity.unit}
          </span>
        </p>

        {/* Dynamic form (one or many inputs based on activity.userInputs) */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {(activity.userInputs || ["quantity"]).map((inputName) => (
            <div key={inputName}>
              <label className="block text-sm font-medium mb-1 capitalise">
                {inputName.replace("_", " ")}
              </label>
              <input
                type="number"
                name={inputName}
                value={inputs[inputName] ?? ""}
                onChange={handleChange}
                step="any"
                min="0"
                required
                className="w-full border border-border rounded px-3 py-2 bg-surface text-fg
                           focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}

          {/* Preview total (shows live, or a post-submit value if parent passes `calculated`) */}
          {(calculated || livePreview) && (
            <div className="text-sm">
              ≈ <span className="font-semibold text-fg">{calculated || livePreview}</span>
            </div>
          )}

          {/* Actions: submit and cancel */}
          <div className="flex justify-between items-center mt-4">
            <button
              type="submit"
              className="bg-primary text-primaryContrast px-4 py-2 rounded hover:opacity-90"
            >
              Log Activity
            </button>
            <button
              onClick={onClose}
              type="button"
              className="text-sm text-muted hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivityModal;

