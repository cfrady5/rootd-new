// src/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from "./useAuth.js";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}
