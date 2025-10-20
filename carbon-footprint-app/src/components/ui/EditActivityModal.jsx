/**
 * ============================================================
 *  File: EditActivityModal.jsx
 *  Component: EditActivityModal
 *
 *  Description:
 *  A modal that allows users to edit the quantity of a previously logged
 *  activity. Displays contextual information (activity name, category,
 *  unit, and emission factor) in a read only summary for clarity.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useState } from "react";
import Modal from "./Modal";

export default function EditActivityModal({ open, activity, onCancel, onSave }) {
  const [qty, setQty] = useState(""); // user edited quantity value
  const [err, setErr] = useState(""); // validation error message

  useEffect(() => {
    // When modal opens or a new activity is loaded, initialise the input and clear errors
    if (open && activity) {
      setQty(activity?.quantity ?? "");
      setErr("");
    }
  }, [open, activity]);

  // Validate and submit the new quantity to the parent handler
  const submit = async () => {
    setErr("");
    const n = Number(qty);
    // Guard: ensure value is a valid non negative number
    if (Number.isNaN(n) || n < 0) {
      setErr("Quantity must be a non-negative number.");
      return;
    }
    // Call parent provided save handler with updated quantity
    await onSave({ id: activity.id, quantity: n });
  };

  // Dont render anything if no activity object provided
  if (!activity) return null;

  return (
    <Modal open={open} title="Edit activity" onClose={onCancel}>
      {/* Read-only context block so users know what record theyre editing */}
      <div className="space-y-2 mb-3">
        <div className="text-sm text-muted">
          <span className="font-medium text-fg">
            {activity.activity_name || "Activity"}
          </span>
          {activity.category ? (
            <>
              {" "}&middot; <span className="text-fg/80">{activity.category}</span>
            </>
          ) : null}
        </div>

        {/* Unit and emission factor details */}
        <div className="text-xs text-muted">
          Unit: <span className="font-mono text-fg">{activity.unit}</span>{" "}
          &nbsp;|&nbsp; EF:{" "}
          <span className="font-mono text-fg">
            {Number(activity.emission_factor)}
          </span>{" "}
          kg/{activity.unit}
        </div>
      </div>

      {/* Editable quantity field */}
      <label className="flex flex-col">
        <span className="text-sm text-fg">Quantity ({activity.unit})</span>
        <input
          className="border border-border rounded px-3 py-2 bg-surface text-fg
                     focus:outline-none focus:ring-1 focus:ring-primary"
          type="number"
          step="0.001"
          min="0"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </label>

      {/* Inline error display */}
      {err && <div className="mt-3 text-[rgb(var(--error-fg))]">{err}</div>}

      {/* Footer buttons: cancel and save */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-surfaceVariant text-fg hover:opacity-80"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded bg-primary text-primaryContrast hover:opacity-90"
          onClick={submit}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

