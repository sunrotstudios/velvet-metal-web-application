import { useAuth } from '@/contexts/auth-context';
import { exchangeSpotifyCode } from '@/lib/api/spotify';
import { syncLibrary } from '@/lib/services';
import updateConnectedServices from '@/lib/services/updateConnectedServices';
import { SyncProgress } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import pb from '../lib/pocketbase';

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  const handleSpotifyCallback = async (
    accessToken: string,
    refreshToken: string,
    expiresAt: number
  ) => {
    if (!user) {
      console.error('No user found in handleSpotifyCallback');
      return;
    }

    try {
      console.log('Starting Spotify connection update...', {
        userId: user.id,
        accessToken: accessToken.substring(0, 10) + '...',
        expiresAt,
      });

      const progressToast = toast.loading('Connecting to Spotify...', {
        duration: Infinity,
      });

      // First, verify the user exists
      const userRecord = await pb.collection('users').getOne(user.id);
      console.log('Found user record:', userRecord);

      // Update connected services
      await updateConnectedServices(user.id, {
        id: 'spotify',
        name: 'Spotify',
        connected: true,
        accessToken,
        refreshToken,
        expiresAt,
      });

      console.log('Services updated successfully');

      // Sync library with progress updates
      await syncLibrary(user.id, 'spotify', (progress) => {
        setSyncProgress(progress);
        const progressMessage =
          progress.phase === 'albums' ? `Syncing Albums` : `Syncing Playlists`;

        toast.loading(progressMessage, { id: progressToast });
      });

      toast.success('Library synced successfully!', {
        id: progressToast,
      });

      return true; // Add a return value to check if the process completed
    } catch (error) {
      console.error('Detailed error in handleSpotifyCallback:', {
        error,
        userId: user.id,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Re-throw to be caught by the caller
    }
  };

  useEffect(() => {
    console.log('SpotifyCallback Initialized');
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
      navigate('/');
      return;
    }

    localStorage.removeItem('spotify_auth_state');

    exchangeSpotifyCode(code)
      .then(async (data) => {
        console.log('Received Spotify tokens:', {
          accessToken: data.access_token.substring(0, 10) + '...',
          hasRefreshToken: !!data.refresh_token,
        });

        localStorage.setItem('spotify_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }

        const success = await handleSpotifyCallback(
          data.access_token,
          data.refresh_token || '',
          Date.now() + data.expires_in * 1000
        );

        if (success) {
          toast.success('Successfully connected to Spotify');
          navigate('/library');
        } else {
          throw new Error('Failed to update user profile');
        }
      })
      .catch((error) => {
        console.error('Detailed error in Spotify callback:', {
          error,
          stack: error instanceof Error ? error.stack : undefined,
        });
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
