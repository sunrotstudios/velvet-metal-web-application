import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { authorizeSpotify } from '@/lib/services/spotify-auth';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { getSpotifyToken } from '@/lib/api/spotify';
import { saveServiceAuth } from '@/lib/services/streaming-auth';
import { useQueryClient } from '@tanstack/react-query';

interface Step2_ConnectServicesProps {
  onComplete: () => void;
}

export function Step2_ConnectServices({ onComplete }: Step2_ConnectServicesProps) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Handle Spotify callback if we have a code
  const code = searchParams.get('code');
  if (code && user) {
    handleSpotifyCallback(code, user.id);
  }

  async function handleSpotifyCallback(code: string, userId: string) {
    try {
      setLoading(true);
      const { access_token, refresh_token, expires_in } = await getSpotifyToken(code);

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      await saveServiceAuth(userId, 'spotify', {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      });

      await queryClient.invalidateQueries(['serviceConnection']);
      await queryClient.invalidateQueries(['userServices']);

      toast.success('Successfully connected to Spotify');
      onComplete();
    } catch (error: any) {
      console.error('Failed to connect to Spotify:', error);
      toast.error('Failed to connect to Spotify');
    } finally {
      setLoading(false);
    }
  }

  const handleConnectSpotify = async () => {
    if (!user) {
      toast.error('Please sign in to connect Spotify');
      return;
    }

    try {
      setLoading(true);
      await authorizeSpotify(user.id);
    } catch (error: any) {
      console.error('Failed to start Spotify connection:', error);
      toast.error(error.message || 'Failed to connect to Spotify');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Card className="border-2">
      <CardHeader className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Connect Your Music</h1>
        <p className="text-sm text-muted-foreground">
          Connect your music services to sync your library
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleConnectSpotify}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Spotify'}
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={handleSkip}
          disabled={loading}
        >
          Skip for now
        </Button>
      </CardContent>
    </Card>
  );
}
