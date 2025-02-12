import { AppleMusicIcon, SpotifyIcon } from '@/components/icons/service-icons';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import { supabase } from '@/lib/supabase';
import { RegisterServiceConnection } from '@/shared/services/RegisterServiceConnection';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';

interface ServiceConnectionsProps {
  onComplete: () => void;
  userId?: string;
}

export const ServiceConnections = ({
  onComplete,
  userId,
}: ServiceConnectionsProps) => {
  const { data: connectedServices, isLoading: isLoadingConnections } =
    useConnectedServices();

  // Query sync status for all services
  const { data: syncStatuses, isLoading: isLoadingSync } = useQuery({
    queryKey: ['syncStatuses', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('user_services')
        .select('service, last_library_sync')
        .eq('user_id', userId);
      return data;
    },
    enabled: !!userId,
    refetchInterval: connectedServices?.length ? 2000 : false,
  });

  // If we have sync status and last_library_sync exists (not undefined), we're done syncing
  const isAnySyncing = syncStatuses?.some(
    (status) => status.last_library_sync === null
  );

  const isServiceConnected = (service: string) => {
    return connectedServices?.some((s) => s === service);
  };

  const isServiceSyncing = (service: string) => {
    return syncStatuses?.some(
      (status) =>
        status.service === service && status.last_library_sync === null
    );
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'spotify':
        return <SpotifyIcon className="w-6 h-6 text-black" />;
      case 'apple-music':
        return <AppleMusicIcon className="w-6 h-6 text-black" />;
      default:
        return null;
    }
  };

  const services = [
    { name: 'Spotify', id: 'spotify' as const },
    { name: 'Apple Music', id: 'apple-music' as const },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {services.map((service) => {
          const isConnected = isServiceConnected(service.id);
          const isSyncing = isServiceSyncing(service.id);

          return (
            <Card key={service.id} className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getServiceIcon(service.id)}
                    <CardTitle className="text-black">
                      {service.name}
                    </CardTitle>
                  </div>

                  {isConnected ? (
                    isSyncing ? (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Syncing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-white">
                        <Check className="w-4 h-4" />
                        <span>Connected</span>
                      </div>
                    )
                  ) : (
                    <RegisterServiceConnection service={service.id} />
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={onComplete}
        variant="default"
        className="w-full h-12 font-degular hover:bg-gray-100 text-black font-medium text-lg"
        disabled={isLoadingConnections || isLoadingSync || isAnySyncing}
      >
        {isLoadingConnections || isLoadingSync || isAnySyncing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isAnySyncing ? 'Syncing services...' : 'Loading...'}
          </>
        ) : (
          'Go To Your Dashboard'
        )}
      </Button>
    </div>
  );
};
