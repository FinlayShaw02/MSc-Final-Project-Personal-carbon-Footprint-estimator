/**
 * ============================================================
 *  File: Signup.jsx
 *  Component: Signup
 *
 *  Description:
 *  Full-page registration screen for new users. Displays and wraps
 *  the `RegisterForm` component, providing consistent layout and
 *  theming with other auth pages (e.g., Login.jsx).
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import RegisterForm from "../components/auth/RegisterForm";

export default function Signup() {
  return (
    // Full-screen layout centered vertically and horizontally
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      {/* Card container for the signup form */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-surface p-6 md:p-10 rounded-xl shadow-lg">
        {/* Page title */}
        <h1 className="text-3xl font-bold mb-6 text-center text-fg">
          Sign Up
        </h1>
        {/* Reusable registration form component */}
        <RegisterForm />
      </div>
    </div>
  );
}