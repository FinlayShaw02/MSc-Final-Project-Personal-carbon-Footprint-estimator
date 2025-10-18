/**
 * ============================================================
 *  File: ConfirmDeleteModal.jsx
 *  Component: ConfirmDeleteModal
 *
 *  Description:
 *  A simple confirmation modal that prompts the user before
 *  deleting an entry or item. Provides Cancel and Delete actions
 *  with clear, accessible styling.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import Modal from "./Modal";

export default function ConfirmDeleteModal({
  open,                 // boolean - whether the modal is visible
  itemLabel = "this item", // label of the item being deleted (e.g., “activity”)
  onCancel,             // callback when user cancels or closes
  onConfirm,            // callback when user confirms delete
}) {
  return (
    // Reuses shared <Modal> component for consistent styling/behavior
    <Modal open={open} title="Delete entry" onClose={onCancel}>
      {/* Confirmation message */}
      <p className="text-fg">
        Are you sure you want to delete <b>{itemLabel}</b>? This cannot be undone.
      </p>

      {/* Action buttons aligned to the right */}
      <div className="mt-4 flex justify-end gap-2">
        {/* Cancel button - closes modal without action */}
        <button
          className="px-3 py-1 rounded bg-surfaceVariant text-fg hover:opacity-80"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>

        {/* Confirm button - triggers permanent delete */}
        <button
          className="px-3 py-1 rounded bg-[rgb(var(--error-fg))] text-primaryContrast hover:opacity-90"
          onClick={onConfirm}
          type="button"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
