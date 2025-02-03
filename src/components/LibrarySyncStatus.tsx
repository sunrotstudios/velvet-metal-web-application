import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { forceSyncLibrary } from '@/lib/services/library-sync';
import { Button } from './ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';

export function LibrarySyncStatus() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<Record<ServiceType, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to sync status changes
    const channel = supabase
      .channel('library_syncs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'library_syncs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setSyncStatus((prev) => ({
            ...prev,
            [payload.new.service]: payload.new,
          }));
        }
      )
      .subscribe();

    // Initial fetch
    fetchSyncStatus();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchSyncStatus = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('library_syncs')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      const statusMap = data.reduce((acc, curr) => {
        acc[curr.service as ServiceType] = curr;
        return acc;
      }, {} as Record<ServiceType, any>);

      setSyncStatus(statusMap);
    }
  };

  const handleForceSync = async (service: ServiceType) => {
    if (!user?.id || isLoading) return;

    setIsLoading(true);
    try {
      await forceSyncLibrary(user.id, service);
    } catch (error) {
      console.error('Failed to force sync:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Never';
    return new Date(timeStr).toLocaleString();
  };

  const renderServiceStatus = (service: ServiceType) => {
    const status = syncStatus[service];
    if (!status) return null;

    return (
      <div key={service} className="mb-4 p-4 bg-black/10 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold capitalize">{service}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleForceSync(service)}
            disabled={isLoading || status.sync_status === 'syncing'}
          >
            <ReloadIcon className="mr-2 h-4 w-4" />
            Force Sync
          </Button>
        </div>
        
        <div className="space-y-1 text-sm">
          <p>Status: <span className="capitalize">{status.sync_status}</span></p>
          <p>Last Sync: {formatTime(status.last_sync_time)}</p>
          <p>Next Sync: {formatTime(status.next_sync_time)}</p>
          {status.last_error && (
            <p className="text-red-500">Error: {status.last_error}</p>
          )}
          
          {status.stats && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Albums</h4>
                <p>Total: {status.stats.albums.total}</p>
                <p className="text-green-500">+{status.stats.albums.added}</p>
                <p className="text-red-500">-{status.stats.albums.removed}</p>
              </div>
              <div>
                <h4 className="font-medium">Playlists</h4>
                <p>Total: {status.stats.playlists.total}</p>
                <p className="text-green-500">+{status.stats.playlists.added}</p>
                <p className="text-red-500">-{status.stats.playlists.removed}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Library Sync Status</h2>
      {Object.keys(syncStatus).map((service) => 
        renderServiceStatus(service as ServiceType)
      )}
    </div>
  );
}
