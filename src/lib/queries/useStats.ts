import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QueryKeys } from './constants';
import { handleQueryError } from './errors';

interface UserStats {
  uniqueAlbums: number;
  totalPlaylists: number;
  syncStats: {
    totalSyncs: number;
    lastSync: string | null;
    avgSyncTime: number;
  };
  serviceStats: {
    connectedServices: string[];
    primaryService: string | null;
  };
}

export function useUserStats(userId?: string) {
  return useQuery({
    queryKey: QueryKeys.user.stats(userId ?? ''),
    queryFn: async (): Promise<UserStats> => {
      try {
        if (!userId) throw new Error('User ID is required');

        const [libraryStats, syncStats, serviceStats] = await Promise.all([
          supabase.rpc('get_user_library_stats', { p_user_id: userId }),
          supabase.rpc('get_user_sync_stats', { p_user_id: userId }),
          supabase.rpc('get_user_service_stats', { p_user_id: userId })
        ]);

        if (libraryStats.error) throw libraryStats.error;
        if (syncStats.error) throw syncStats.error;
        if (serviceStats.error) throw serviceStats.error;

        return {
          uniqueAlbums: libraryStats.data?.unique_albums || 0,
          totalPlaylists: libraryStats.data?.total_playlists || 0,
          syncStats: {
            totalSyncs: syncStats.data?.total_syncs || 0,
            lastSync: syncStats.data?.last_sync,
            avgSyncTime: syncStats.data?.avg_sync_time || 0
          },
          serviceStats: {
            connectedServices: serviceStats.data?.connected_services || [],
            primaryService: serviceStats.data?.primary_service
          }
        };
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_system_stats');
        
        if (error) throw error;

        return {
          totalUsers: data?.total_users || 0,
          totalLibraries: data?.total_libraries || 0,
          totalSyncs: data?.total_syncs || 0,
          activeUsers: data?.active_users || 0
        };
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 1000 * 60 * 15, // Consider data fresh for 15 minutes
  });
}