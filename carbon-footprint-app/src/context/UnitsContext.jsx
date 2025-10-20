/**
 * ============================================================
 *  File: UnitsContext.jsx
 *  Context: UnitsProvider / useUnits
 *
 *  Description:
 *  Provides a global context for managing and converting between
 *  metric ("kg") and imperial ("lb") units throughout the app.
 *  Automatically changes based on the user’s profile or localStorage,
 *  and exposes helpers for conversion and switching.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile } from "../services/profile";

// Create a React context to hold the current unit system ("kg" or "lb")
const unitsContext = createContext(undefined);

export function UnitsProvider({ children }) {
  // Initialize state from localStorage or default to kilograms
  const [units, setUnits] = useState(() => {
    const v = localStorage.getItem("units");
    return v === "lb" ? "lb" : "kg";
  });

  // fetch the user profile and updates units based off API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await getProfile(); // fetch user profile from backend
        // Determine valid unit type from profile data
        const u = profile?.units === "lb" ? "lb" : profile?.units === "kg" ? "kg" : null;
        // Update state and persist if valid
        if (mounted && u) {
          setUnits(u);
          localStorage.setItem("units", u);
        }
      } catch {
        /* Ignore network or auth errors silently */
      }
    })();
    return () => { mounted = false; }; // avoid updates if unmounted
  }, []);

  // Update local state and persist new units selection
  const changeUnits = (u) => {
    const v = u === "lb" ? "lb" : "kg";
    setUnits(v);
    localStorage.setItem("units", v);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    units,                // current selected units ("kg" | "lb")
    changeUnits,          // function to change units
    isMetric: units === "kg", // convenience flag for metric usage
    toKg: (n) => (units === "kg" ? n : n * 0.45359237), // convert from current to kg
    toLb: (n) => (units === "lb" ? n : n / 0.45359237), // convert from current to lb
  }), [units]);

  // Provide the units context
  return <unitsContext.Provider value={value}>{children}</unitsContext.Provider>;
}

export function useUnits() {
  // Hook for consuming the context
  const ctx = useContext(unitsContext);
  if (!ctx) throw new Error("useUnits must be used within <UnitsProvider>");
  return ctx;
}

// Optionally export the context directly if external access is absolutely necessary
export { unitsContext };

