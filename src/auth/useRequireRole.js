// src/auth/useRequireRole.js
import { useAuth } from './AuthProvider.jsx';

/**
 * Hook to check if user has a specific role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {{hasRole: boolean, role: string|null, loading: boolean}}
 */
export function useRequireRole(allowedRoles) {
  const auth = useAuth();

  if (!auth || auth.loading) {
    return { hasRole: false, role: null, loading: true };
  }

  if (!auth.session) {
    return { hasRole: false, role: null, loading: false };
  }

  const userRole = auth.session.user?.user_metadata?.role || auth.session.user?.role;
  const hasRole = userRole && allowedRoles.includes(userRole);

  return { hasRole, role: userRole, loading: false };
}
