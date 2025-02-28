import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useLastFm } from '@/contexts/last-fm-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import {
  authorizeAppleMusic,
  unauthorizeAppleMusic,
} from '@/lib/services/apple-music';
import { authorizeLastFm, unauthorizeLastFm } from '@/lib/services/lastfm-auth';
import {
  authorizeSpotify,
  unauthorizeSpotify,
} from '@/lib/services/spotify';
import { ServiceType } from '@/lib/services/auth';
import { useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { forceSyncLibrary } from '@/lib/services/library-sync';

interface ServiceConnectionProps {
  service: ServiceType;
}

export function ServiceConnection({ service }: ServiceConnectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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
        await authorizeSpotify(user.id);
      } else if (service === 'apple-music') {
        await authorizeAppleMusic(user.id);
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

  const handleForceSync = async () => {
    if (!user || isSyncing || service === 'lastfm') return;
    
    setIsSyncing(true);
    try {
      console.log(`Starting force sync for ${service}...`);
      await forceSyncLibrary(user.id, service);
      toast({
        title: 'Success',
        description: 'Library sync started successfully. Check console for progress.',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error syncing library:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to sync library. Check console for details.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      // Wait a bit before enabling the button again
      setTimeout(() => {
        setIsSyncing(false);
      }, 5000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/10 text-white hover:bg-white/20 border-0"
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? 'Loading...' : isConnected ? 'Disconnect' : 'Connect'}
      </Button>

      {/* Show sync button only for connected music services (not Last.fm) */}
      {isConnected && service !== 'lastfm' && (
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 text-white hover:bg-white/20 border-0"
          onClick={handleForceSync}
          disabled={isSyncing}
        >
          <ReloadIcon className="mr-2 h-4 w-4" />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      )}
    </div>
  );
}
