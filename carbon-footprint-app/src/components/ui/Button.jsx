/**
 * ============================================================
 *  File: Button.jsx
 *  Component: Button
 *
 *  Description:
 *  A reusable, theme aware button component supporting multiple
 *  visual variants and a loading state. Used across forms, modals,
 *  and interactive UI elements for consistent styling.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import React from "react";
import classNames from "classnames";

export default function Button({
  children,
  variant = "primary",  // visual style of button ("primary", "secondary", "danger", "ghost")
  isLoading = false,     // shows spinner when true
  disabled = false,      // disables button interaction
  onClick,
  type = "button",
  className,
  ...props               // allows passing extra props (e.g., aria-label, data-*)
}) {
  const isDisabled = Boolean(isLoading) || Boolean(disabled); // disable if either loading or disabled

  // Base styling common to all button types
  const base =
    "px-4 py-2 rounded-lg font-semibold transition-all w-full " +
    "focus:outline-none focus:ring-1 focus:ring-primary";

  // Normal visual variants — color schemes using theme tokens
  const variants = {
    primary:
      "bg-primary text-primaryContrast border border-primary hover:opacity-90",
    secondary:
      "bg-surface text-fg border border-border hover:bg-surfaceVariant",
    danger:
      "bg-[rgb(var(--error-fg))] text-primaryContrast hover:opacity-90", // solid danger
    ghost:
      "bg-transparent text-fg hover:bg-surfaceVariant", // no fill until hover
  };

  // Disabled state styles for each variant — maintain contrast but block interaction
  const disabledVariants = {
    primary:
      "bg-primary text-primaryContrast opacity-60 cursor-not-allowed",
    secondary:
      "bg-surface text-muted border border-border opacity-60 cursor-not-allowed",
    danger:
      "bg-[rgb(var(--error-fg))] text-primaryContrast opacity-60 cursor-not-allowed",
    ghost:
      "text-muted opacity-60 cursor-not-allowed",
  };

  // Spinner icon shown while loading
  // Uses current text color (border-current) for consistent theme appearance
  const spinner =
    "animate-spin mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classNames(
        base,
        isDisabled ? disabledVariants[variant] : variants[variant], // choose normal vs disabled style
        className // allow custom user className overrides
      )}
      {...props}
    >
      {/* Optional loading spinner (appears before label text) */}
      {isLoading && <span className={spinner} aria-hidden="true" />}

      {/* Button label or children content */}
      {children}
    </button>
  );
}
