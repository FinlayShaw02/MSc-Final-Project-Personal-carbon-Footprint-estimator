/**
 * ============================================================
 *  File: LoginForm.jsx
 *  Component: LoginForm
 *
 *  Description:
 *  A reusable login form component that authenticates users against
 *  the backend API. Handles user credential input, basic validation,
 *  and session persistence via PHP session cookies.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

const API_BASE = "http://localhost/carbon_app_api"; // Base URL for backend API
const WITH_CREDS = { credentials: "include" };      // Ensures PHP session cookie is sent/received

export default function LoginForm() {
  // State variables for form inputs and UI feedback
  const [email, setEmail] = useState("");          // Stores email input value
  const [password, setPassword] = useState("");    // Stores password input value
  const [isLoading, setIsLoading] = useState(false); // Indicates API request in progress
  const [error, setError] = useState("");          // Stores error message if login fails
  const navigate = useNavigate();                  // React Router navigation hook

  // Handles form submission and login logic
  const handleSubmit = async (e) => {
    e.preventDefault();        // Prevent default form reload
    setIsLoading(true);        // Show loading state
    setError("");              // Reset previous error message

    try {
      // Send credentials to backend login endpoint
      const res = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Send email/password as JSON
        ...WITH_CREDS, // Include credentials for PHP session handling
      });

      // Try parsing response JSON (even if server responds with an error)
      let data = null;
      try { data = await res.json(); } catch { /* ignore JSON parse errors */ }

      // Handle invalid response or failed authentication
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Login failed: ${res.status}`);
      }

      // Store user data locally for frontend use (session remains in cookie)
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect user to dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      // Display error message to user
      setError(err.message || "Login failed.");
    } finally {
      // Stop loading indicator regardless of outcome
      setIsLoading(false);
    }
  };

  // JSX: Login form UI
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email input field */}
      <InputField
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Password input field */}
      <InputField
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Error message display */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Submit button with loading state */}
      <Button type="submit" isLoading={isLoading} variant="primary">
        Log In
      </Button>

      {/* Signup link for users without an account */}
      <p className="text-sm text-center text-gray-600">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-green-700 hover:underline font-semibold">
          Sign up here
        </Link>
      </p>
    </form>
  );
}