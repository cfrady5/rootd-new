// src/auth/RequireRole.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

/**
 * RequireRole - Route protection component that checks user role
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of allowed roles (e.g., ['director', 'admin'])
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} props.redirectTo - Path to redirect to if unauthorized (default: '/dashboard')
 */
export default function RequireRole({ allowedRoles, children, redirectTo = '/dashboard' }) {
  const auth = useAuth();

  // Show loading while auth is initializing
  if (!auth || auth.loading) {
    return <LoadingScreen message="Checking permissions..." fullScreen={false} />;
  }

  // Redirect to login if no session
  if (!auth.session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const userRole = auth.session.user?.user_metadata?.role || auth.session.user?.role;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    // User doesn't have permission - redirect
    return <Navigate to={redirectTo} replace />;
  }

  // User is authorized
  return children;
}

/**
 * Hook to check if user has a specific role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {{hasRole: boolean, role: string|null, loading: boolean}}
 */
// Note: useRequireRole hook has been moved to './useRequireRole.js' to satisfy
// Fast Refresh rule requiring files to only export components.
