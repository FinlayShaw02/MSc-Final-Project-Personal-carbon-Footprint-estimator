/**
 * ============================================================
 *  File: ThemeSelect.jsx
 *  Component: ThemeSelect
 *
 *  Description:
 *  Dropdown selector for switching application themes. Applies the chosen
 *  theme immediately and persists the preference. Full keyboard support.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  THEMES,        // list of available themes
  getSavedTheme, // retrieves last saved theme from localStorage
  applyTheme,    // applies chosen theme class to <html>
} from "../../theme/themes";

export default function ThemeSelect({ className = "", onChange }) {
  const [open, setOpen] = useState(false);             // dropdown open/closed state
  const [value, setValue] = useState(getSavedTheme()); // current theme value
  const [activeIndex, setActiveIndex] = useState(-1);  // highlighted option
  const rootRef = useRef(null);                        // wrapper for outside click detection
  const listRef = useRef(null);                        // <ul> element for focus and keyboard nav

  // Resolve currently selected theme object
  const selected = useMemo(
    () => THEMES.find((o) => o.value === value) || THEMES[0],
    [value]
  );

  // Apply theme when changed, and call optional onChange callback
  useEffect(() => {
    applyTheme(value);
    onChange?.(value);
  }, [value, onChange]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
    };
  }, [open]);

  // When dropdown opens, highlight current theme and focus the list
  useEffect(() => {
    if (open) {
      setActiveIndex(Math.max(0, THEMES.findIndex((o) => o.value === value)));
      listRef.current?.focus();
    }
  }, [open, value]);

  // Select a theme and close menu
  const choose = (opt) => {
    setValue(opt.value);
    setOpen(false);
  };

  // Keyboard events for the toggle button
  const onButtonKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  // Keyboard navigation inside the dropdown
  const onListKeyDown = (e) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0) choose(THEMES[activeIndex]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % THEMES.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + THEMES.length) % THEMES.length);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* Trigger button showing current theme */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="theme-listbox"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className="inline-flex items-center gap-2 rounded-xl border border-border
                   bg-surface px-3 py-1.5 text-fg shadow-subtle
                   hover:bg-surfaceVariant/70 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {/* Selected theme label */}
        <span className="font-medium">{selected.label}</span>

        {/* Dropdown arrow icon */}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.06l3.71-2.83a.75.75 0 1 1 .92 1.18l-4.24 3.24a.75.75 0 0 1-.92 0L5.21 8.41a.75.75 0 0 1 .02-1.2z" />
        </svg>
      </button>

      {/* Dropdown list of available themes */}
      {open && (
        <ul
          id="theme-listbox"
          role="listbox"
          tabIndex={-1}
          ref={listRef}
          onKeyDown={onListKeyDown}
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl
                     border border-border/70 shadow-lg outline-none
                     bg-surface/70 backdrop-blur-md backdrop-saturate-150
                     [@supports(backdrop-filter:blur(0))]:bg-surface/55"
        >
          {THEMES.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()} // prevent premature blur
                onClick={() => choose(opt)}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm
                            ${isActive ? "bg-surfaceVariant/70" : "bg-transparent"}
                            hover:bg-surfaceVariant`}
              >
                {/* Theme name */}
                <span>{opt.label}</span>

                {/* Checkmark for selected theme */}
                {isSelected && (
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.07a1 1 0 0 1-1.415 0L3.29 8.838a1 1 0 0 1 1.415-1.415l3.231 3.23 6.364-6.364a1 1 0 0 1 1.404 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
