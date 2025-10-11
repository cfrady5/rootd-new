// src/auth/PublicOnly.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from "./useAuth.js";

export default function PublicOnly({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (session) return <Navigate to="/quiz" replace />;
  return children;
}
