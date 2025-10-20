/**
 * ============================================================
 *  File: InputField.jsx
 *  Component: InputField
 *
 *  Description:
 *  A reusable, themed text input component with an optional label
 *  and inline error message support. Used throughout forms for
 *  consistent styling and accessibility.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import React from "react";

const InputField = ({
  label,         // optional field label displayed above the input
  name,          // input name/id for form handling
  type = "text", // input type
  value,         // controlled input value
  onChange,      // callback for handling user input
  placeholder,   // optional placeholder text
  error,         // optional error message string
}) => {
  return (
    <div className="mb-4">
      {/* Render label if provided */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-fg mb-1"
        >
          {label}
        </label>
      )}

      {/* Text input element */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-md bg-surface text-fg border 
                    focus:outline-none focus:ring-1 focus:ring-primary ${
          error ? "border-[rgb(var(--error-fg))]" : "border-border"
        }`}
      />

      {/* Optional inline error message */}
      {error && (
        <p className="text-sm text-[rgb(var(--error-fg))] mt-1">{error}</p>
      )}
    </div>
  );
};

export default InputField;
