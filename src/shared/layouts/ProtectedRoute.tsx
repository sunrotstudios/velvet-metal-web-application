import { useAuth } from '@/contexts/auth-context';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { tokenManager } from '@/lib/services/token-manager';
import { getUserServices } from '@/lib/services/streaming-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const refreshMusicTokens = async () => {
      if (!user) return;

      try {
        // Get all connected music services
        const services = await getUserServices(user.id);
        
        // Refresh tokens for all connected services
        await Promise.all(
          services.map(service => 
            tokenManager.refreshTokenIfNeeded(user.id, service)
          )
        );
      } catch (error) {
        console.error('Error refreshing music service tokens:', error);
      }
    };

    refreshMusicTokens();
    
    // Set up periodic token refresh (every 30 minutes)
    const refreshInterval = setInterval(refreshMusicTokens, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
