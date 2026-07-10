import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner size="lg" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && user.role && !roles.includes(user.role.name)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
