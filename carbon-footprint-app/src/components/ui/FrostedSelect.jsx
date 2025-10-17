/**
 * ============================================================
 *  File: FrostedSelect.jsx
 *  Component: FrostedSelect
 *
 *  Description:
 *  Accessible custom select component with a frosted (blurred) dropdown
 *  panel. Supports keyboard navigation, ARIA roles/ids, outside click
 *  dismissal, and optional trigger-width matching for consistent layouts.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */


import { useEffect, useLayoutEffect, useMemo, useRef, useState, useId } from "react";

export default function FrostedSelect({
  value,                  // current selected value
  onChange,               // callback(newValue)
  options = [],           // array of strings or { value, label }
  placeholder = "Select…",
  disabled = false,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  matchTriggerWidth = true,  // whether dropdown should match button width
  placement = "bottom-left", // "bottom-left" | "bottom-right"
}) {
  // Normalise options to { value, label }
  const norm = useMemo(
    () =>
      (options || []).map((o) =>
        typeof o === "string"
          ? { value: o, label: o }
          : { value: o.value, label: o.label ?? String(o.value) }
      ),
    [options]
  );

  const [open, setOpen] = useState(false);  // dropdown open/closed
  const [active, setActive] = useState(-1); // keyboard-highlighted index

  // Refs
  const wrapRef = useRef(null); // root wrapper (for outside-click detection)
  const btnRef = useRef(null);  // trigger button
  const listRef = useRef(null); // listbox element

  // Unique ids for a11y
  const listboxId = useId();
  const optionIdBase = useId();

  // Compute selected option object
  const selected = useMemo(
    () => norm.find((o) => o.value === value) ?? null,
    [value, norm]
  );

  // Compute menu width to match trigger if requested
  const [menuWidth, setMenuWidth] = useState(undefined);
  useLayoutEffect(() => {
    if (!matchTriggerWidth) return;
    if (btnRef.current) setMenuWidth(btnRef.current.offsetWidth);
  }, [open, matchTriggerWidth, norm.length, value]);

  // Close on outside click / touch
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
    };
  }, [open]);

  // When opening: init active index + focus list for keyboard nav
  useEffect(() => {
    if (!open) return;
    if (norm.length === 0) {
      setActive(-1);
    } else {
      const idx = Math.max(0, norm.findIndex((o) => o.value === value));
      setActive(idx >= 0 ? idx : 0);
    }
    // Focus the list so that arrow keys work immediately
    listRef.current?.focus({ preventScroll: true });
  }, [open, value, norm]);

  // Ensure the active option is visible when it changes
  useEffect(() => {
    if (!open || active < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-option-idx="${active}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Choose an option: notify parent and close
  function choose(opt) {
    onChange?.(opt.value);
    setOpen(false);
  }

  // Trigger key handling (open with Enter/Space/ArrowDown)
  function onButtonKeyDown(e) {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  // Listbox key handling (Escape, arrows, Home/End, Enter/Space to select)
  function onListKeyDown(e) {
    if (e.key === "Escape") return setOpen(false);
    if (!norm.length) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (active >= 0) choose(norm[active]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % norm.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + norm.length) % norm.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(norm.length - 1);
    }
  }

  // Align dropdown to left/right edge of trigger
  const alignClass =
    placement === "bottom-right" ? "right-0" : "left-0";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className={[
          "inline-flex w-full h-10 items-center justify-between gap-2",
          "rounded-lg border border-border bg-surface text-fg text-sm",
          "px-3 shadow-subtle transition-colors",
          "hover:bg-surfaceVariant/70 focus:outline-none focus:ring-1 focus:ring-primary",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          buttonClassName,
        ].join(" ")}
      >
        {/* Selected label or placeholder */}
        <span className={selected ? "truncate" : "text-muted truncate"}>
          {selected ? selected.label : placeholder}
        </span>
        {/* Chevron icon */}
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.06l3.71-2.83a.75.75 0 1 1 .92 1.18l-4.24 3.24a.75.75 0 0 1-.92 0L5.21 8.41a.75.75 0 0 1 .02-1.2z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            active >= 0 ? `${optionIdBase}-${active}` : undefined
          }
          ref={listRef}
          onKeyDown={onListKeyDown}
          style={matchTriggerWidth && menuWidth ? { width: menuWidth } : undefined}
          className={[
            "absolute z-50 mt-2 max-h-72 overflow-auto rounded-xl",
            "border border-border/70 outline-none shadow-lg",
            // frosted background (with a graceful fallback)
            "bg-surface/70 backdrop-blur-md backdrop-saturate-150",
            "[@supports(backdrop-filter:blur(0))]:bg-surface/55",
            alignClass,
            "focus:outline-none",
            menuClassName,
          ].join(" ")}
        >
          {/* Empty state */}
          {norm.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">No options</li>
          ) : (
            // Render options
            norm.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isActive = idx === active;
              return (
                <li
                  key={`${opt.value}-${idx}`}
                  id={`${optionIdBase}-${idx}`}
                  data-option-idx={idx}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => choose(opt)}
                  className={[
                    "flex cursor-pointer items-center justify-between px-3 py-2 text-sm",
                    isActive ? "bg-surfaceVariant/70" : "bg-transparent",
                    "hover:bg-surfaceVariant text-fg",
                  ].join(" ")}
                >
                  <span className="truncate">{opt.label}</span>
                  {/* Checkmark for selected option */}
                  {isSelected && (
                    <svg
                      className="h-4 w-4 text-primary ml-2 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.07a1 1 0 0 1-1.415 0L3.29 8.838a1 1 0 0 1 1.415-1.415l3.231 3.23 6.364-6.364a1 1 0 0 1 1.404 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
