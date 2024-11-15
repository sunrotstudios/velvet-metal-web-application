import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  authRequired?: boolean;
}

export default function ProtectedRoute({
  children,
  authRequired = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: User state', user);
  console.log('ProtectedRoute: Loading state', loading);

  if (loading) {
    return null;
  }

  // For auth required routes (like Home)
  if (authRequired && !user) {
    console.log('ProtectedRoute: Redirecting to login');

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For non-auth required routes (like Login/Register)
  if (!authRequired && user) {
    console.log('ProtectedRoute: Redirecting to home');

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
