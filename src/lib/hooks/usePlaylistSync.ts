import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type ServiceType = 'spotify' | 'apple-music';

interface PlaylistSyncPair {
  id: string;
  user_id: string;
  source_playlist_id: string;
  source_service: ServiceType;
  target_playlist_id: string;
  target_service: ServiceType;
  last_synced_at: string | null;
  is_active: boolean;
  sync_enabled: boolean;
  last_error: string | null;
  error_count: number;
  last_error_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePlaylistSync(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch all sync pairs for the user
  const { data: syncPairs, isLoading } = useQuery({
    queryKey: ['playlist-sync-pairs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('playlist_sync_pairs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlaylistSyncPair[];
    },
    enabled: !!userId,
  });

  // Create a new sync pair
  const createSyncPair = useMutation({
    mutationFn: async ({
      sourcePlaylistId,
      sourceService,
      targetPlaylistId,
      targetService,
    }: {
      sourcePlaylistId: string;
      sourceService: ServiceType;
      targetPlaylistId: string;
      targetService: ServiceType;
    }) => {
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('playlist_sync_pairs')
        .insert({
          user_id: userId,
          source_playlist_id: sourcePlaylistId,
          source_service: sourceService,
          target_playlist_id: targetPlaylistId,
          target_service: targetService,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-sync-pairs', userId] });
      toast.success('Playlists linked successfully');
    },
    onError: (error) => {
      toast.error('Failed to link playlists', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });

  // Delete a sync pair
  const deleteSyncPair = useMutation({
    mutationFn: async (syncPairId: string) => {
      const { error } = await supabase
        .from('playlist_sync_pairs')
        .delete()
        .eq('id', syncPairId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-sync-pairs', userId] });
      toast.success('Playlist sync removed');
    },
    onError: (error) => {
      toast.error('Failed to remove playlist sync', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });

  // Toggle sync enabled status
  const toggleSyncEnabled = useMutation({
    mutationFn: async ({
      syncPairId,
      enabled,
    }: {
      syncPairId: string;
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from('playlist_sync_pairs')
        .update({ sync_enabled: enabled })
        .eq('id', syncPairId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist-sync-pairs', userId] });
    },
    onError: (error) => {
      toast.error('Failed to update sync status', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('playlist-sync-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlist_sync_pairs',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['playlist-sync-pairs', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    syncPairs,
    isLoading,
    createSyncPair,
    deleteSyncPair,
    toggleSyncEnabled,
  };
}
