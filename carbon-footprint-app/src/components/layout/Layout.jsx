/**
 * ============================================================
 *  File: Layout.jsx
 *  Component: Layout
 *
 *  Description:
 *  The shared application layout used for all authenticated pages.
 *  Provides a responsive sidebar (drawer on mobile, fixed on desktop)
 *  and a fixed top header for mobile devices. Applies the user’s
 *  saved theme preference on mount.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

// Apply saved theme once (ThemeSelect on Profile saves to localStorage)
function applySavedTheme() {
  const html = document.documentElement;
  const saved =
    localStorage.getItem("theme") ||
    "light"; // "light", "theme-dark", "theme-green", "theme-blue", "theme-sage", "theme-blue-nord", "theme-contrast"

  // Remove any previously set theme classes to avoid conflicts
  html.classList.remove(
    "theme-dark",
    "theme-green",
    "theme-blue",
    "theme-sage",
    "theme-blue-nord",
    "theme-contrast"
  );
  // Re-apply the saved theme class (no class needed for "light")
  if (saved !== "light") html.classList.add(saved);
}

const HEADER_H = 64; // keep header and content offset in sync (px)

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer open/closed

  useEffect(() => {
    // On mount, sync document theme with saved preference
    applySavedTheme();
  }, []);

  return (
    <div className="min-h-screen flex bg-bg text-fg">
      {/* Sidebar (desktop + drawer on mobile) */}
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Mobile fixed header - solid, opaque, and above everything */}
      <header
        className="app-fixed-header md:hidden fixed top-0 left-0 right-0 z-[9999]
                   h-16 border-b border-border shadow-subtle"
      >
        <div className="h-full flex items-center justify-between px-4">
          <h1 className="text-lg font-bold">EcoTrack</h1>
          {/* Hamburger button toggles the mobile sidebar drawer */}
          <button
            className="text-fg px-2 py-1 rounded hover:bg-surfaceVariant focus:outline-none"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span aria-hidden>☰</span>
          </button>
        </div>
      </header>

      {/* Content - always starts below the fixed header on mobile */}
      <main
        className="flex-1 w-full md:ml-64 px-4 md:pt-6 pb-6"
        style={{ paddingTop: HEADER_H }} // equals 64px on mobile
      >
        {children /* Routed page content renders here */}
      </main>
    </div>
  );
}
