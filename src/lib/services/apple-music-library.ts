import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { initializeAppleMusic } from './apple-music-auth';

async function getPlaylistTrackCount(
  music: any,
  playlistId: string
): Promise<number> {
  try {
    const response = await music.api.music(
      `/v1/me/library/playlists/${playlistId}/tracks`,
      {
        limit: 1, // We only need the total count
      }
    );

    const total = response?.data?.meta?.total || 0;
    return total;
  } catch (error) {
    console.error('Error fetching playlist track count:', error);
    return 0;
  }
}

async function syncAppleMusicPlaylists(
  userId: string,
  music: any
): Promise<any[]> {
  try {
    const limit = 100;
    let offset = 0;
    let allPlaylists: any[] = [];
    let hasMore = true;

    while (hasMore) {
      console.log('Fetching playlists with offset:', offset);
      const response = await music.api.music('/v1/me/library/playlists', {
        limit,
        offset,
      });
      console.log('API Response:', response);

      if (!response?.data?.data || response.data.data.length === 0) {
        console.log('No more playlists found');
        hasMore = false;
      } else {
        allPlaylists = [...allPlaylists, ...response.data.data];
        offset += limit;
      }
    }

    console.log('Total playlists found:', allPlaylists.length);

    // Transform playlists to our format and filter out invalid ones
    const transformedPlaylists = await Promise.all(
      allPlaylists
        .filter((playlist) => {
          if (!playlist.id || !playlist.attributes?.name) {
            console.warn('Invalid playlist data:', playlist);
            return false;
          }
          return true;
        })
        .map(async (playlist) => {
          // Get track count for this playlist
          const trackCount = await getPlaylistTrackCount(
            music,
            playlist.id // Use the main playlist ID instead of playParams.id
          );

          console.log('Playlist track count:', {
            name: playlist.attributes.name,
            id: playlist.id,
            trackCount,
          });

          return {
            id: uuidv4(),
            user_id: userId,
            service: 'apple-music' as const,
            playlist_id: playlist.id,
            name: playlist.attributes.name || 'Untitled Playlist',
            description: playlist.attributes.description?.standard || null,
            image_url:
              playlist.attributes.artwork?.url?.replace('{w}x{h}', '300x300') ||
              null,
            tracks_count: trackCount,
            external_url: null,
            synced_at: new Date().toISOString(),
          };
        })
    );

    if (transformedPlaylists.length > 0) {
      // Store in Supabase
      const { error } = await supabase
        .from('user_playlists')
        .upsert(transformedPlaylists, {
          onConflict: 'user_id,service,playlist_id',
        });

      if (error) {
        throw error;
      }
    }

    return transformedPlaylists;
  } catch (error) {
    console.error('Error syncing Apple Music playlists:', error);
    throw error;
  }
}

export async function syncAppleMusicLibrary(
  userId: string,
  onProgress?: (progress: number) => void
) {
  try {
    // Update sync status to in progress
    await supabase
      .from('user_services')
      .update({ 
        sync_in_progress: true,
        last_library_sync: null 
      })
      .eq('user_id', userId)
      .eq('service', 'apple-music');

    const music = await initializeAppleMusic();

    if (!music) {
      throw new Error('Failed to initialize Apple Music');
    }

    // Fetch all library albums
    const limit = 100;
    let offset = 0;
    let allAlbums: any[] = [];
    let hasMore = true;

    // First request to check if library has any albums
    const initialResponse = await music.api.music('/v1/me/library/albums', {
      limit: 1,
    });

    if (
      !initialResponse?.data?.data ||
      initialResponse.data.data.length === 0
    ) {
      console.log('Apple Music library is empty');
      if (onProgress) {
        onProgress(100);
      }
      return {
        albums: [],
        playlists: [],
      };
    }

    // Library has albums, proceed with full sync
    while (hasMore) {
      const response = await music.api.music('/v1/me/library/albums', {
        limit,
        offset,
      });

      if (!response?.data?.data || response.data.data.length === 0) {
        hasMore = false;
      } else {
        allAlbums = [...allAlbums, ...response.data.data];
        offset += limit;

        if (onProgress) {
          const progress = Math.min(50, (allAlbums.length / 1000) * 50);
          onProgress(progress);
        }
      }
    }

    console.log(`Found ${allAlbums.length} albums in Apple Music library`);

    const transformedAlbums = allAlbums
      .map((album) => {
        console.log('Processing album:', album);

        // Ensure we have required fields
        if (!album.attributes?.name || !album.attributes?.artistName) {
          console.warn('Album missing required attributes:', {
            id: album.id,
            name: album.attributes?.name,
            artistName: album.attributes?.artistName,
          });
          return null;
        }

        return {
          id: uuidv4(),
          user_id: userId,
          service: 'apple-music' as const,
          album_id: album.id,
          name: album.attributes.name.trim() || 'Unknown Album',
          artist_name: album.attributes.artistName.trim() || 'Unknown Artist',
          image_url:
            album.attributes.artwork?.url?.replace('{w}x{h}', '300x300') ||
            null,
          release_date: album.attributes.releaseDate || null,
          tracks_count: album.attributes.trackCount || 0,
          external_url: null,
          album_type: 'album',
          synced_at: new Date().toISOString(),
          added_at: album.attributes.dateAdded || new Date().toISOString(),
        };
      })
      .filter((album): album is NonNullable<typeof album> => album !== null);

    // Only proceed with database operations if we have albums to store
    if (transformedAlbums.length > 0) {
      // Store in Supabase in batches
      const batchSize = 100;
      for (let i = 0; i < transformedAlbums.length; i += batchSize) {
        const batch = transformedAlbums.slice(i, i + batchSize);
        const { error } = await supabase.from('user_albums').upsert(batch, {
          onConflict: 'user_id,service,album_id',
        });

        if (error) {
          throw error;
        }

        if (onProgress) {
          const insertProgress = Math.min(
            50,
            ((i + batchSize) / transformedAlbums.length) * 50
          );
          onProgress(50 + insertProgress);
        }
      }
    } else {
      console.log('No valid albums to sync');
      if (onProgress) {
        onProgress(50);
      }
    }

    // Now sync playlists
    console.log('Syncing playlists...');
    const playlists = await syncAppleMusicPlaylists(userId, music);

    // Set final progress
    if (onProgress) {
      onProgress(100);
    }

    return {
      albums: transformedAlbums,
      playlists: playlists,
    };
  } catch (error) {
    console.error('Error syncing Apple Music library:', error);
    throw error;
  } finally {
    // Always update sync status when done, whether successful or not
    await supabase
      .from('user_services')
      .update({ 
        sync_in_progress: false,
        last_library_sync: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('service', 'apple-music');
  }
}
