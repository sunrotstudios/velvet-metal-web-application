import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useLastFm } from '@/contexts/last-fm-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import {
  authorizeAppleMusic,
  unauthorizeAppleMusic,
} from '@/lib/services/apple-music-auth';
import { authorizeLastFm, unauthorizeLastFm } from '@/lib/services/lastfm-auth';
import {
  authorizeSpotify,
  unauthorizeSpotify,
} from '@/lib/services/spotify-auth';
import { ServiceType } from '@/lib/services/streaming-auth';
import { useState } from 'react';

interface ServiceConnectionProps {
  service: ServiceType;
}

export function ServiceConnection({ service }: ServiceConnectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const { data: connectedServices, refetch: refetchConnectedServices } =
    useConnectedServices();
  const { username: lastFmUsername, setUsername: setLastFmUsername } =
    useLastFm();
  const isConnected =
    service === 'lastfm'
      ? !!lastFmUsername
      : connectedServices?.includes(service);

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to connect services.',
      });
      return;
    }

    setIsConnecting(true);
    try {
      if (service === 'spotify') {
        await authorizeSpotify();
      } else if (service === 'apple-music') {
        await authorizeAppleMusic();
      } else if (service === 'lastfm') {
        const username = prompt('Enter your Last.fm username:');
        if (username) {
          await authorizeLastFm(username);
          setLastFmUsername(username);
        }
      }
      await refetchConnectedServices();
    } catch (error) {
      console.error('Error connecting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect service. Please try again.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    setIsConnecting(true);
    try {
      if (service === 'spotify') {
        await unauthorizeSpotify(user.id);
      } else if (service === 'apple-music') {
        await unauthorizeAppleMusic(user.id);
      } else if (service === 'lastfm') {
        await unauthorizeLastFm();
        setLastFmUsername('');
      }
      await refetchConnectedServices();
      toast({
        title: 'Success',
        description: 'Service disconnected successfully.',
      });
    } catch (error) {
      console.error('Error disconnecting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect service. Please try again.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      variant={isConnected ? 'outline' : 'default'}
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isConnecting}
      size="sm"
    >
      {isConnected ? 'Disconnect' : 'Connect'}
    </Button>
  );
}
