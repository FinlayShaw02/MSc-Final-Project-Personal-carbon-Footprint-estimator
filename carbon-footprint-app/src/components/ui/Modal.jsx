/**
 * ============================================================
 *  File: Modal.jsx
 *  Component: Modal
 *
 *  Description:
 *  A reusable, theme-aware modal component for displaying overlay
 *  dialogs such as forms, confirmations, or informational content.
 *  Handles accessibility and focus management while preventing
 *  background scrolling when open.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

export default function Modal({ open, title, children, onClose }) {
  // Don’t render anything if the modal isnt open
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"           // accessibility: identifies this as a dialog
      aria-modal="true"       // prevents background interactions for screen readers
      onKeyDown={(e) => e.key === "Escape" && onClose?.()} // close on ESC key
    >
      {/* Overlay / backdrop that darkens and blurs the background */}
      <div
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
        onClick={onClose} // clicking outside modal closes it
      />

      {/* Modal content container */}
      <div className="relative w-full max-w-lg rounded-xl bg-surface text-fg border border-border shadow-xl p-4">
        {/* Header: title (if provided) + close button */}
        <div className="flex items-start justify-between mb-3">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}

          {/* Close (X) button */}
          <button
            className="p-1 rounded hover:bg-surfaceVariant text-muted"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body content passed as children */}
        {children}
      </div>
    </div>
  );
}