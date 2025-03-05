import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';
import { QueryKeys } from './constants';
import { handleMutationError } from './errors';
import { syncAppleMusicLibrary } from '@/lib/services/apple-music-library';
import { syncSpotifyLibrary } from '@/lib/services/spotify-library';
import { syncTidalLibrary } from '@/lib/services/tidal-library';
import { toast } from 'sonner';
import { getMusicService } from '@/lib/services/music';
import { getServiceAuth } from '@/lib/services/streaming-auth';

interface LibraryMutationVariables {
  userId: string;
  service: ServiceType;
}

export function useSyncLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      service,
      onProgress,
    }: {
      userId: string;
      service: ServiceType;
      onProgress?: (current: number, total: number) => void;
    }) => {
      const auth = await getServiceAuth(userId, service);
      if (!auth?.accessToken) {
        throw new Error(`${service} not connected`);
      }

      const musicService = getMusicService(service);
      await musicService.syncLibrary(userId, auth.accessToken, onProgress);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
      queryClient.invalidateQueries({ queryKey: ['userAlbums'] });
      queryClient.invalidateQueries({ queryKey: ['userPlaylists'] });
      toast.success('Library sync completed');
    },
    onError: (error) => {
      console.error('Library sync failed:', error);
      toast.error('Failed to sync library. Please try again.');
    },
  });
}

export function useDeleteLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, service }: LibraryMutationVariables) => {
      // Delete albums
      const { error: albumsError } = await supabase
        .from('user_albums')
        .delete()
        .eq('user_id', userId)
        .eq('service', service);

      if (albumsError) throw albumsError;

      // Delete playlists
      const { error: playlistsError } = await supabase
        .from('user_playlists')
        .delete()
        .eq('user_id', userId)
        .eq('service', service);

      if (playlistsError) throw playlistsError;

      // Reset sync status
      const { error: serviceError } = await supabase
        .from('user_services')
        .update({
          synced_at: null,
          sync_in_progress: false
        })
        .eq('user_id', userId)
        .eq('service', service);

      if (serviceError) throw serviceError;
    },
    onError: (error) => {
      throw handleMutationError(error, 'Failed to delete library');
    },
    onSuccess: (_, { service }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.library.stored(service) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.library.root });
    },
  });
}

export function useSetLibrarySyncStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      service,
      inProgress,
      lastSynced 
    }: LibraryMutationVariables & { 
      inProgress?: boolean;
      lastSynced?: string;
    }) => {
      const updates: Record<string, any> = {};
      if (typeof inProgress === 'boolean') {
        updates.sync_in_progress = inProgress;
      }
      if (lastSynced) {
        updates.synced_at = lastSynced;
      }

      const { error } = await supabase
        .from('user_services')
        .update(updates)
        .eq('user_id', userId)
        .eq('service', service);

      if (error) throw error;
    },
    onError: (error) => {
      throw handleMutationError(error, 'Failed to update sync status');
    },
    onSuccess: (_, { service, userId }) => {
      queryClient.invalidateQueries({ 
        queryKey: QueryKeys.services.sync(service, userId)
      });
    },
  });
}