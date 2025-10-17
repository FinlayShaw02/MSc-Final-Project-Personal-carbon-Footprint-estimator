/**
 * ============================================================
 *  File: AppRoutes.jsx
 *  Component: AppRoutes
 *
 *  Description:
 *  Central routing configuration for the application using React Router.
 *  Defines all public and authenticated routes, and wraps protected pages
 *  with a shared <Layout> and <ProtectedRoute> guard.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { Routes, Route } from "react-router-dom";

import Onboarding from "../pages/Onboarding";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

import Dashboard from "../pages/Dashboard";
import Goals from "../pages/Goals";
import LogActivity from "../pages/LogActivity";
import History from "../pages/History";
import Summary from "../pages/Summary";
import Profile from "../pages/Profile";
import Friends from "../pages/Friends";
import Gamification from "../pages/Gamification";   
import Education from "../pages/Education";  

import ProtectedRoute from "../components/auth/ProtectedRoute";
import Layout from "../components/layout/Layout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes (with shared layout) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <Layout>
              <Goals />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/log-activity"
        element={
          <ProtectedRoute>
            <Layout>
              <LogActivity />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/summary"
        element={
          <ProtectedRoute>
            <Layout>
              <Summary />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <Layout>
              <Friends />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification"                    
        element={
          <ProtectedRoute>
            <Layout>
              <Gamification />
            </Layout>
          </ProtectedRoute>
        }
      />
       <Route
        path="/education"                
        element={
          <ProtectedRoute>
            <Layout>
              <Education />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Optional: 404 fallback */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

