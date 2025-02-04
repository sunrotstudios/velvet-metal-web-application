import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import { useQueryClient } from '@tanstack/react-query';
import {
  authorizeAppleMusic,
} from '@/lib/services/apple-music-auth';
import {
  authorizeSpotify,
} from '@/lib/services/spotify-auth';
import { ServiceType } from '@/lib/services/streaming-auth';
import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface RegisterServiceConnectionProps {
  service: ServiceType;
}

export function RegisterServiceConnection({ service }: RegisterServiceConnectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const { data: connectedServices } = useConnectedServices();
  const isConnected = connectedServices?.includes(service);
  const queryClient = useQueryClient();

  // Query to check if library sync is in progress
  const { data: syncStatus, isLoading: isLoadingSync } = useQuery({
    queryKey: ['syncStatus', service, user?.id],
    queryFn: async () => {
      if (!user?.id || !isConnected) return null;
      const { data } = await supabase
        .from('user_services')
        .select('last_library_sync')
        .eq('user_id', user.id)
        .eq('service', service)
        .single();
      console.log('Service:', service, 'Sync status:', data); // Debug log
      return data;
    },
    enabled: !!user?.id && !!isConnected,
    refetchInterval: isConnected ? 2000 : false, // Only poll if connected
  });

  console.log('Service state:', {
    service,
    isConnected,
    isLoadingSync,
    syncStatus,
  }); // Debug log

  // Only consider it syncing if we have a sync status and last_library_sync is explicitly null
  const isSyncing = isConnected && syncStatus && syncStatus.last_library_sync === null;
  console.log('Service:', service, 'Is connected:', isConnected, 'Is syncing:', isSyncing); // Debug log

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
      }

      // After successful connection, update last_library_sync
      const { error } = await supabase
        .from('user_services')
        .update({ last_library_sync: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('service', service);

      if (error) {
        console.error('Error updating last_library_sync:', error);
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries(['connectedServices']);
      queryClient.invalidateQueries(['syncStatus']);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to connect service',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Syncing...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-emerald-500">
        <Check className="w-5 h-5" />
        <span className="text-sm font-medium">Connected</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-white/10 text-white hover:bg-white/20 border-0"
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Connecting...
        </>
      ) : (
        'Connect'
      )}
    </Button>
  );
}
