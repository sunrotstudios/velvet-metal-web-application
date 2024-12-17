import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { getSpotifyToken } from '@/lib/api/spotify';
import { syncSpotifyLibrary } from '@/lib/services/spotify-library';
import { saveServiceAuth } from '@/lib/services/streaming-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const processedCode = useRef<string | null>(null);

  console.log('SpotifyCallback mounted', {
    code: searchParams.get('code'),
    error: searchParams.get('error'),
    user,
    authLoading,
    url: window.location.href
  });

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const callbackUrl = sessionStorage.getItem('auth_callback_url') || '/';

    console.log('SpotifyCallback useEffect running', {
      code,
      error,
      callbackUrl,
      authLoading,
      user
    });

    // Wait for auth to load
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    // Handle errors first
    if (error) {
      console.error('Spotify auth error:', error);
      toast.error('Failed to connect to Spotify');
      navigate(callbackUrl, { replace: true });
      return;
    }

    if (!code) {
      console.error('Missing code:', { code });
      toast.error('Failed to connect to Spotify');
      navigate(callbackUrl, { replace: true });
      return;
    }

    if (!user) {
      console.error('No user found, redirecting to login');
      toast.error('Please sign in to connect Spotify');
      navigate('/login', { replace: true });
      return;
    }

    // Don't process the same code twice
    if (processedCode.current === code) {
      return;
    }

    const connectSpotify = async () => {
      try {
        processedCode.current = code;
        console.log('Starting Spotify connection flow...', {
          userId: user.id,
          code,
        });

        const { access_token, refresh_token, expires_in } =
          await getSpotifyToken(code);

        console.log('Got Spotify token:', {
          access_token_length: access_token.length,
          has_refresh_token: !!refresh_token,
          expires_in,
        });

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

        await saveServiceAuth(user.id, 'spotify', {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
        });

        await queryClient.invalidateQueries(['serviceConnection']);
        await queryClient.invalidateQueries(['userServices']);

        // Start library sync in the background
        toast.promise(syncSpotifyLibrary(user.id, access_token), {
          loading: 'Syncing Spotify library...',
          success: 'Library sync complete!',
          error: 'Failed to sync library',
        });

        // Clear the callback URL from session storage
        sessionStorage.removeItem('auth_callback_url');

        // Navigate back immediately after saving auth
        navigate(callbackUrl, { replace: true });
        toast.success('Successfully connected to Spotify');
      } catch (error) {
        console.error('Failed to connect to Spotify:', error);
        toast.error('Failed to connect to Spotify');
        navigate(callbackUrl, { replace: true });
      }
    };

    // Connect immediately when we have a code
    connectSpotify();
  }, [user, authLoading, searchParams, navigate, queryClient]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center text-lg font-semibold">
            Loading...
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Please wait while we load your account...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center text-lg font-semibold">
          Connecting to Spotify
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Please wait while we connect your Spotify account...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
