import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, checkAuth } = useAuthStore();

  if (!isAuthenticated || !checkAuth()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
