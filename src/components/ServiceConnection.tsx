import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import {
  authorizeAppleMusic,
  unauthorizeAppleMusic,
} from '@/lib/services/apple-music-auth';
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
  const isConnected = connectedServices?.includes(service);

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to connect a service',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      if (service === 'spotify') {
        await authorizeSpotify(user.id);
      } else if (service === 'apple-music') {
        await authorizeAppleMusic(user.id);
      }
      await refetchConnectedServices();
      toast({
        title: 'Success',
        description: `Connected to ${
          service === 'spotify' ? 'Spotify' : 'Apple Music'
        }`,
      });
    } catch (error) {
      console.error(`Failed to connect to ${service}:`, error);
      toast({
        title: 'Error',
        description: `Failed to connect to ${
          service === 'spotify' ? 'Spotify' : 'Apple Music'
        }. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to disconnect a service',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Starting service disconnect...', { service, userId: user.id });
      
      if (service === 'spotify') {
        await unauthorizeSpotify(user.id);
      } else if (service === 'apple-music') {
        await unauthorizeAppleMusic(user.id);
      }
      
      console.log('Service disconnected, refreshing connected services...');
      await refetchConnectedServices();
      console.log('Connected services refreshed');
      
      toast({
        title: 'Success',
        description: `Disconnected from ${
          service === 'spotify' ? 'Spotify' : 'Apple Music'
        }`,
      });
    } catch (error) {
      console.error(`Failed to disconnect from ${service}:`, error);
      toast({
        title: 'Error',
        description: `Failed to disconnect from ${
          service === 'spotify' ? 'Spotify' : 'Apple Music'
        }. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant={isConnected ? 'destructive' : 'default'}
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isConnecting}
    >
      {isConnecting
        ? 'Connecting...'
        : isConnected
        ? `Disconnect ${service === 'spotify' ? 'Spotify' : 'Apple Music'}`
        : `Connect ${service === 'spotify' ? 'Spotify' : 'Apple Music'}`}
    </Button>
  );
}
