import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSpotifyAlbumDetails } from '@/lib/api/spotify';
import { getAppleMusicAlbumDetails } from '@/lib/api/apple-music';
import { DetailedAlbum, ServiceType } from '@/lib/types';
import { getServiceAuth } from '@/lib/services/streaming-auth';

export const ALBUM_DETAILS_QUERY_KEY = 'albumDetails';

export function useAlbumDetails(
  albumId: string | undefined,
  userId: string | undefined,
  service?: ServiceType
) {
  return useQuery<DetailedAlbum>({
    queryKey: [ALBUM_DETAILS_QUERY_KEY, albumId, userId, service],
    queryFn: async () => {
      if (!albumId) throw new Error('No album ID provided');
      if (!userId) throw new Error('No user found');
      
      // Detect service from album ID if not provided
      const detectedService = service || (albumId.startsWith('l.') ? 'apple-music' : 'spotify');
      
      const auth = await getServiceAuth(userId, detectedService);
      if (!auth) throw new Error(`${detectedService} not connected`);
      
      switch (detectedService) {
        case 'spotify':
          if (!auth.accessToken) {
            throw new Error('No Spotify access token found');
          }
          return getSpotifyAlbumDetails(userId, albumId, auth.accessToken);
        
        case 'apple-music':
          if (!auth.musicUserToken) {
            throw new Error('No Apple Music user token found');
          }
          return getAppleMusicAlbumDetails(albumId, auth.musicUserToken);
        
        default:
          throw new Error(`Unsupported service: ${detectedService}`);
      }
    },
    enabled: !!albumId && !!userId,
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

export function usePrefetchAlbum() {
  const queryClient = useQueryClient();

  return {
    prefetchAlbum: async (albumId: string, userId: string, service?: ServiceType) => {
      const detectedService = service || (albumId.startsWith('l.') ? 'apple-music' : 'spotify');
      const auth = await getServiceAuth(userId, detectedService);
      if (!auth) return; // Silently fail on prefetch if auth isn't available

      switch (detectedService) {
        case 'spotify':
          if (!auth.accessToken) return;
          await queryClient.prefetchQuery({
            queryKey: [ALBUM_DETAILS_QUERY_KEY, albumId, userId, detectedService],
            queryFn: async () => getSpotifyAlbumDetails(userId, albumId, auth.accessToken),
            staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
          });
          break;

        case 'apple-music':
          if (!auth.musicUserToken) return;
          await queryClient.prefetchQuery({
            queryKey: [ALBUM_DETAILS_QUERY_KEY, albumId, userId, detectedService],
            queryFn: async () => getAppleMusicAlbumDetails(albumId, auth.musicUserToken),
            staleTime: 1000 * 60 * 5,
          });
          break;
      }
    },
  };
}
