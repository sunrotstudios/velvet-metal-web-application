import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music2, Music, Check } from 'lucide-react';
import { getSpotifyAuthUrl } from '@/lib/api/spotify';
import { authorizeAppleMusic } from '@/lib/api/apple-music';
import { useAuth } from '@/contexts/auth-context';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import pb from '@/lib/pocketbase';
import updateConnectedServices from '@/lib/services/updateConnectedServices';
import { toast } from 'sonner';

export default function Home() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const { data: userServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const record = await pb.collection('users').getOne(user.id);
      return record.connectedServices || [];
    },
    enabled: !!user,
  });

  const isSpotifyConnected = userServices?.some(
    (service) => service.id === 'spotify' && service.connected
  );

  const isAppleMusicConnected = userServices?.some(
    (service) => service.id === 'apple-music' && service.connected
  );

  const handleSpotifyConnect = () => {
    console.log('Starting Spotify connection...');
    console.log('Auth URL:', getSpotifyAuthUrl());
    window.location.href = getSpotifyAuthUrl();
  };

  const handleAppleMusicConnect = async () => {
    try {
      const auth = await authorizeAppleMusic();
      localStorage.setItem('apple_music_token', auth.musicUserToken);

      await updateConnectedServices(user.id, {
        id: 'apple-music',
        name: 'Apple Music',
        connected: true,
        accessToken: auth.musicUserToken,
        userToken: auth.userToken,
        expiresAt: null,
      });

      toast.success('Successfully connected to Apple Music');
      navigate('/library');
    } catch (error) {
      console.error('Apple Music authorization failed:', error);
      toast.error('Failed to connect to Apple Music');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome, {user?.name}
        </h2>
        <Button onClick={handleLogout} className="ml-auto">
          Logout
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-6 w-6" />
              Spotify
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSpotifyConnected ? (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Check className="h-5 w-5" />
                <span>Connected</span>
              </div>
            ) : (
              <Button onClick={handleSpotifyConnect} className="w-full">
                Connect Spotify Account
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-6 w-6" />
              Apple Music
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAppleMusicConnected ? (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Check className="h-5 w-5" />
                <span>Connected</span>
              </div>
            ) : (
              <Button onClick={handleAppleMusicConnect} className="w-full">
                Connect Apple Music Account
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
