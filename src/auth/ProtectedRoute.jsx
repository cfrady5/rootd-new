// src/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen message="Authenticating..." fullScreen={false} />;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}
