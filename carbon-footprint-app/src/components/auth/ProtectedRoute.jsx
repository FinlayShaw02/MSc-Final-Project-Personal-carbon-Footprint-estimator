/**
 * ============================================================
 *  File: ProtectedRoute.jsx
 *  Component: ProtectedRoute
 *
 *  Description:
 *  A higher-order route component that restricts access to protected
 *  pages for unauthenticated users. It checks for a valid user object
 *  in localStorage and either renders the target page or redirects
 *  the user to the login screen.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */


import { Navigate } from 'react-router-dom'; // Import navigation helper for route redirects

export default function ProtectedRoute({ children }) {
  // Retrieve the stored user object from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // If no user is found, redirect the visitor to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected child components
  return children;
}
