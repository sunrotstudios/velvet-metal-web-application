import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';
import { librarySyncQueue } from '../services/library-sync-queue';

interface LastSyncTimes {
  [key: string]: Date;
}

export function useLibrarySync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get connected services
  const { data: connectedServices = [] } = useQuery<ServiceType[]>({
    queryKey: ['connectedServices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_services')
        .select('service')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(connection => connection.service);
    },
    enabled: !!user
  });

  // Get last sync times
  const { data: lastSyncTimes } = useQuery<LastSyncTimes>({
    queryKey: ['lastSyncTimes', user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      const { data, error } = await supabase
        .from('library_sync_history')
        .select('service, completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const times: LastSyncTimes = {};
      data.forEach(sync => {
        if (!times[sync.service] || new Date(sync.completed_at) > times[sync.service]) {
          times[sync.service] = new Date(sync.completed_at);
        }
      });

      return times;
    },
    enabled: !!user
  });

  // Function to sync all libraries
  const syncAllLibraries = async () => {
    if (!user) return;
    
    connectedServices.forEach(service => {
      librarySyncQueue.enqueue(user.id, service, 1);
    });

    // Invalidate queries to refresh the UI
    queryClient.invalidateQueries({ queryKey: ['lastSyncTimes', user.id] });
    queryClient.invalidateQueries({ queryKey: ['libraryItems', user.id] });
  };

  return {
    connectedServices,
    lastSyncTimes,
    syncAllLibraries
  };
}
