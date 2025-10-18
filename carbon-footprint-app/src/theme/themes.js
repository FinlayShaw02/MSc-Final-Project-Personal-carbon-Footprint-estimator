/**
 * ============================================================
 *  File: themes.js
 *  Location: /src/theme/
 *
 *  Description:
 *  Provides the global theme registry and helper functions for
 *  applying, persisting, and syncing the selected color theme.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */


/* ---------- Theme registry ---------- */
/**
 * All available themes for the app.
 * Each entry defines:
 * - `value`: CSS class applied to <html>
 * - `label`: Display name for dropdowns/selectors
 * - `scheme`: "light" or "dark" to set color scheme
 */
export const THEMES = [
  { value: "light",          label: "Light",         scheme: "light" },
  { value: "theme-dark",     label: "Dark",          scheme: "dark"  },
  { value: "theme-blue",     label: "Blue",          scheme: "dark"  },
  { value: "theme-contrast", label: "High contrast", scheme: "dark"  },
  { value: "theme-green",    label: "Green",         scheme: "dark"  },
  { value: "theme-gray",     label: "Gray",          scheme: "dark"  },
];

/**
 * Extract only theme class names (excluding “light” and “system”)
 * these are the classes toggled on <html>.
 */
export const THEME_CLASSES = THEMES
  .map(t => t.value)
  .filter(v => v !== "light" && v !== "system");


/* ---------- Persistence + system helpers ---------- */

/**
 * Get the saved theme from localStorage.
 * Defaults to "light" if not set.
 */
export function getSavedTheme() {
  return localStorage.getItem("theme") || "light";
}

/**
 * Detects the user’s OS-level color scheme preference.
 * Returns either "dark" or "light".
 */
export function resolveSystemScheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Updates the CSS `color-scheme` property on <html>.
 * This ensures native elements (e.g., form controls) match theme brightness.
 */
export function setColorSchemeOnHtml(scheme) {
  document.documentElement.style.colorScheme = scheme;
}


/* ---------- Apply theme to <html> ---------- */
/**
 * Applies the selected theme by:
 * - Removing old theme classes
 * - Adding the new one if necessary
 * - Setting the proper `color-scheme`
 * - Saving preference to localStorage
 */
export function applyTheme(theme) {
  const html = document.documentElement;

  // Remove all existing theme classes first
  THEME_CLASSES.forEach(cls => html.classList.remove(cls));

  if (theme === "system") {
    // System mode: follow OS preference dynamically
    setColorSchemeOnHtml(resolveSystemScheme());
  } else if (theme === "light") {
    // Default light mode  no theme class needed
    setColorSchemeOnHtml("light");
  } else {
    // Apply a custom theme class (e.g., theme-dark, theme-blue)
    html.classList.add(theme);
    const meta = THEMES.find(t => t.value === theme);
    setColorSchemeOnHtml(meta?.scheme === "dark" ? "dark" : "light");
  }

  // Persist choice for next session
  localStorage.setItem("theme", theme);
}
