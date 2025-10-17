/**
 * ============================================================
 *  File: Login.jsx
 *  Component: Login
 *
 *  Description:
 *  Full-page layout for user authentication. Presents the `LoginForm`
 *  component centered on the screen with a minimal themed wrapper.
 *  Handles navigation and visual feedback after login.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    // Full-viewport container to center content, with app background color
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      {/* Card wrapper: responsive max widths + surface theme + border/shadow */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-surface text-fg p-6 md:p-10 rounded-xl border border-border shadow-subtle">
        {/* Page title */}
        <h1 className="text-3xl font-bold mb-6 text-center">Log In</h1>

        {/* Actual form component handles fields, validation, and submit */}
        <LoginForm />
      </div>
    </div>
  );
}
