import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSpotifyPlaylistDetails, getSpotifyPlaylists } from '@/lib/services/spotify';
import { getAppleMusicPlaylistDetails, getAppleMusicPlaylists } from '@/lib/services/apple-music';
import { DetailedPlaylist, NormalizedPlaylist } from '@/lib/types';
import { getServiceAuth } from '@/lib/services/auth';

export const PLAYLIST_DETAILS_QUERY_KEY = 'playlistDetails';

export function usePlaylistDetails(
  playlistId: string | undefined,
  userId: string | undefined,
  service: 'spotify' | 'apple-music' | undefined
) {
  return useQuery<DetailedPlaylist>({
    queryKey: [PLAYLIST_DETAILS_QUERY_KEY, playlistId, userId, service],
    queryFn: async () => {
      if (!playlistId) {
        throw new Error('No playlist ID provided');
      }
      if (!userId) {
        throw new Error('No user found');
      }
      if (!service) {
        throw new Error('No service specified');
      }

      const auth = await getServiceAuth(userId, service);
      if (!auth) {
        throw new Error(`${service} not connected`);
      }

      switch (service) {
        case 'spotify':
          if (!auth.accessToken) {
            throw new Error('No Spotify access token found');
          }
          return getSpotifyPlaylistDetails(playlistId, auth.accessToken);
        
        case 'apple-music':
          if (!auth.musicUserToken) {
            throw new Error('No Apple Music user token found');
          }
          return getAppleMusicPlaylistDetails(playlistId, auth.musicUserToken);
        
        default:
          throw new Error(`Unsupported service: ${service}`);
      }
    },
    enabled: !!playlistId && !!userId && !!service,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && 
         (error.message.includes('not connected') || 
          error.message.includes('token'))) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useUserPlaylists(
  userId: string | undefined,
  service: 'spotify' | 'apple-music'
) {
  return useQuery<NormalizedPlaylist[]>({
    queryKey: ['userPlaylists', userId, service],
    queryFn: async () => {
      if (!userId) {
        throw new Error('No user found');
      }

      const auth = await getServiceAuth(userId, service);
      if (!auth) {
        throw new Error(`${service} not connected`);
      }

      switch (service) {
        case 'spotify':
          if (!auth.accessToken) {
            throw new Error('No Spotify access token found');
          }
          return getSpotifyPlaylists(auth.accessToken, userId);
        
        case 'apple-music':
          if (!auth.musicUserToken) {
            throw new Error('No Apple Music user token found');
          }
          return getAppleMusicPlaylists(auth.musicUserToken);
        
        default:
          throw new Error(`Unsupported service: ${service}`);
      }
    },
    enabled: !!userId,
  });
}

export function usePrefetchPlaylist() {
  const queryClient = useQueryClient();

  return {
    prefetchPlaylist: async (playlist: NormalizedPlaylist, userId: string) => {
      try {
        const auth = await getServiceAuth(userId, playlist.service);
        if (!auth) {
          return; // Silently fail prefetch if auth isn't available
        }

        switch (playlist.service) {
          case 'spotify':
            if (!auth.accessToken) return;
            await queryClient.prefetchQuery({
              queryKey: [PLAYLIST_DETAILS_QUERY_KEY, playlist.playlist_id, userId, playlist.service],
              queryFn: async () => getSpotifyPlaylistDetails(playlist.playlist_id, auth.accessToken),
              staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
            });
            break;

          case 'apple-music':
            if (!auth.musicUserToken) return;
            await queryClient.prefetchQuery({
              queryKey: [PLAYLIST_DETAILS_QUERY_KEY, playlist.playlist_id, userId, playlist.service],
              queryFn: async () => getAppleMusicPlaylistDetails(playlist.playlist_id, auth.musicUserToken),
              staleTime: 1000 * 60 * 5,
            });
            break;
        }
      } catch (error) {
        // Silently fail prefetch
        console.debug('Failed to prefetch playlist:', error);
      }
    },
  };
}
