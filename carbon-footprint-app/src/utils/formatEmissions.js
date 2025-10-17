/**
 * ============================================================
 *  File: formatEmissions.js
 *  Location: /src/utils/
 *
 *  Description:
 *  Utility functions for converting and formatting CO₂ emissions
 *  between kilograms (kg) and pounds (lb).  
 *  Provides consistent numeric formatting across the app for
 *  charts, summaries, and activity listings.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */


/* ---------- Conversion constant ---------- */
/**
 * Conversion multiplier:
 *  1 kilogram (kg) = 2.2046226218 pounds (lb)
 */
export const LB_PER_KG = 2.2046226218;


/* ---------- Conversion ---------- */
/**
 * Converts a value in kilograms to the selected unit system.
 *
 * @param {number} valueKg  - Emission value in kilograms.
 * @param {"kg"|"lb"} units - User’s preferred measurement unit.
 * @returns {number} Converted value (kg -> lb if necessary).
 */
export function convertFromKg(valueKg, units) {
  if (valueKg == null || isNaN(valueKg)) return 0;
  return units === "lb" ? valueKg * LB_PER_KG : valueKg;
}


/* ---------- Formatting ---------- */
/**
 * Formats an emission value as a string with unit suffix.
 *
 * @param {number} valueKg  - Value in kilograms (base unit).
 * @param {"kg"|"lb"} units - Output unit system.
 * @param {number} [digits=3] - Number of decimal places to show.
 * @returns {string} Example: "12.345 kg" or "27.221 lb"
 */
export function formatEmissions(valueKg, units, digits = 3) {
  const v = convertFromKg(valueKg, units);
  return `${v.toFixed(digits)} ${units}`;
}
