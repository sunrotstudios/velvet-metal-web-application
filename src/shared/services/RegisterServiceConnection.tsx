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
import { cn } from '@/lib/utils';

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
        .select('last_library_sync, sync_in_progress')
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

  // Consider it syncing if sync_in_progress is true or last_library_sync is null
  const isSyncing = isConnected && (
    (syncStatus && syncStatus.sync_in_progress) || 
    (syncStatus && syncStatus.last_library_sync === null)
  );
  
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
      // Set sync_in_progress to true before starting auth
      await supabase
        .from('user_services')
        .upsert({
          user_id: user.id,
          service: service,
          last_library_sync: null,
          sync_in_progress: true
        });

      if (service === 'spotify') {
        await authorizeSpotify(user.id);
      } else if (service === 'apple-music') {
        await authorizeAppleMusic(user.id);
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['connectedServices'] });
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });

    } catch (error: any) {
      // If there's an error, reset the sync status
      await supabase
        .from('user_services')
        .update({ 
          sync_in_progress: false,
          last_library_sync: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('service', service);

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
      <div className="flex items-center gap-2 text-black font-bold">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Syncing...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-emerald-500 font-bold">
        <Check className="w-5 h-5" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn(
        "px-3 py-1.5 h-8 text-sm font-bold",
        "border-2 border-black rounded-lg",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-x-[-1px] hover:translate-y-[-1px]",
        "active:translate-x-0 active:translate-y-0",
        "transition-all",
        "bg-yellow-300 hover:bg-yellow-400 text-black"
      )}
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="font-bold">Connecting...</span>
        </>
      ) : (
        'Connect'
      )}
    </Button>
  );
}
