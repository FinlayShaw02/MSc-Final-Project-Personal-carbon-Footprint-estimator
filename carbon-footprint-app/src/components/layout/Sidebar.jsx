/**
 * ============================================================
 *  File: Sidebar.jsx
 *  Component: Sidebar
 *
 *  Description:
 *  A responsive, theme aware sidebar navigation component used across
 *  authenticated layouts. Supports mobile drawer toggle and a persistent
 *  sidebar view on desktop devices.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import classNames from "classnames";

/* Navigation link configuration */
const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Log Activity", path: "/log-activity" },
  { name: "History", path: "/history" },
  { name: "Goals", path: "/goals" },
  { name: "Summary", path: "/summary" },
  { name: "Profile", path: "/profile" },
  { name: "Friends", path: "/friends" },
  { name: "Leaderboard", path: "/gamification" },
  { name: "Educational", path: "/education" },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate(); // for redirecting after logout

  // Clears user session and redirects to login page
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Overlay for mobile - shown behind the sidebar when open */}
      <div
        className={classNames(
          "fixed inset-0 bg-bg/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-200",
          { hidden: !isOpen } // hides overlay when sidebar closed
        )}
        onClick={onClose} // clicking overlay closes drawer
      />

      {/* Sidebar panel (slides in/out on mobile, fixed on desktop) */}
      <aside
        className={classNames(
          "fixed top-0 left-0 h-full w-64 bg-surface text-fg border-r border-border shadow-subtle z-40 transform transition-transform duration-200",
          {
            "-translate-x-full": !isOpen, // hidden offscreen (mobile)
            "translate-x-0": isOpen,       // visible when open
            "md:translate-x-0 md:block": true, // always visible on md+
          }
        )}
      >
        {/* Sidebar header / app title */}
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-primary">EcoTrack</h2>
        </div>

        {/* Navigation links */}
        <nav className="px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose} // closes sidebar on mobile when navigating
              className={({ isActive }) =>
                classNames(
                  "block px-4 py-2 rounded text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary" // active route styling
                    : "text-fg hover:bg-surfaceVariant" // default/hover style
                )
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Logout button at bottom */}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 rounded text-sm font-medium mt-4
                       text-errorFg hover:bg-errorBg/20"
          >
            Log Out
          </button>
        </nav>
      </aside>
    </>
  );
}
