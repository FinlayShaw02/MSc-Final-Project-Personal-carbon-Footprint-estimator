/**
 * ============================================================
 *  File: Onboarding.jsx
 *  Component: Onboarding
 *
 *  Description:
 *  Introductory welcome screen shown to unauthenticated users.
 *  Presents the app’s mission and offers clear navigation paths
 *  to log in or sign up.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Onboarding() {
  // Hook from react-router-dom used to programmatically navigate between routes
  const navigate = useNavigate();

  return (
    // Full-page container: centers onboarding content both vertically and horizontally
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      {/* Content wrapper with max width and centered text */}
      <div className="w-full max-w-md text-center">
        {/* App title */}
        <h1 className="text-4xl font-bold mb-4 text-fg">Welcome to EcoTrack</h1>

        {/* Introductory description of the apps purpose */}
        <p className="text-muted mb-8">
          Track your personal carbon footprint, set reduction goals, and
          discover simple tips to reduce your impact. One activity at a time.
        </p>

        {/* Action buttons for navigation to login or signup pages */}
        <div className="flex flex-col gap-4">
          {/* Primary button navigates to the login page */}
          <Button variant="primary" onClick={() => navigate("/login")}>
            Log In
          </Button>

          {/* Secondary button navigates to the signup page */}
          <Button variant="secondary" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}