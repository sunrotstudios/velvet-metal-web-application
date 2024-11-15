import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeSpotifyCode } from '@/lib/api/spotify';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import updateConnectedServices from '@/lib/services/updateConnectedServices';

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSpotifyCallback = async (
    accessToken: string,
    refreshToken: string,
    expiresAt: number
  ) => {
    if (!user) return;

    try {
      await updateConnectedServices(user.id, {
        id: 'spotify',
        name: 'Spotify',
        connected: true,
        accessToken,
        refreshToken,
        expiresAt,
      });
      console.log('Spotify connection updated in PocketBase');
    } catch (error) {
      console.error('Failed to update Spotify connection:', error);
      toast.error('Failed to save Spotify connection');
    }
  };

  useEffect(() => {
    console.log('SpotifyCallback mounted');
    console.log('User:', user);

    if (!user) {
      console.log('No user found, returning');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('spotify_auth_state');

    console.log('URL Parameters:', {
      code,
      error,
      state,
      storedState,
      fullUrl: window.location.href,
    });

    console.log('URL State:', state);
    console.log('Stored State:', storedState);

    if (error) {
      toast.error(`Spotify authorization failed: ${error}`);
      navigate('/');
      return;
    }

    if (!code) {
      toast.error('No authorization code received from Spotify');
      navigate('/');
      return;
    }

    if (state !== storedState) {
      toast.error('Invalid state parameter');
      navigate('/');
      return;
    }

    localStorage.removeItem('spotify_auth_state');

    exchangeSpotifyCode(code)
      .then((data) => {
        console.log('Received Spotify tokens:', {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        });

        localStorage.setItem('spotify_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        toast.success('Successfully connected to Spotify');

        return handleSpotifyCallback(
          data.access_token,
          data.refresh_token || '',
          Date.now() + data.expires_in * 1000
        );
      })
      .then(() => {
        navigate('/library');
      })
      .catch((error) => {
        console.error('Failed to exchange code:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to connect to Spotify'
        );
        navigate('/');
      });
  }, [navigate, user]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Connecting to Spotify...</h2>
        <p className="text-muted-foreground">
          Please wait while we complete the connection.
        </p>
      </div>
    </div>
  );
}
