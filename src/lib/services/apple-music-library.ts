import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { initializeAppleMusic } from './apple-music-auth';

async function getPlaylistTrackCount(music: any, playlistId: string): Promise<number> {
  try {
    console.log('Fetching track count for playlist:', playlistId);
    const response = await music.api.music(`/v1/me/library/playlists/${playlistId}/tracks`, {
      limit: 1, // We only need the total count
    });
    
    const total = response?.data?.meta?.total || 0;
    console.log('Track count response:', { playlistId, total, response });
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
        .filter(playlist => {
          if (!playlist.id || !playlist.attributes?.name) {
            console.warn('Invalid playlist data:', playlist);
            return false;
          }
          return true;
        })
        .map(async playlist => {
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
            image_url: playlist.attributes.artwork?.url?.replace('{w}x{h}', '300x300') || null,
            tracks_count: trackCount,
            external_url: null,
            synced_at: new Date().toISOString(),
          };
        })
    );

    console.log('Transformed playlists:', transformedPlaylists.length);

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
    const music = await initializeAppleMusic();

    if (!music) {
      throw new Error('Failed to initialize Apple Music');
    }

    console.log('MusicKit instance:', music);
    console.log('API object:', music.api);

    // Fetch all library albums
    const limit = 100;
    let offset = 0;
    let allAlbums: any[] = [];
    let hasMore = true;

    while (hasMore) {
      console.log('Fetching albums with offset:', offset);
      const response = await music.api.music('/v1/me/library/albums', {
        limit,
        offset,
      });
      console.log('API Response:', response);

      // Check if we have valid data
      if (!response?.data?.data || response.data.data.length === 0) {
        console.log('No more albums found');
        hasMore = false;
      } else {
        allAlbums = [...allAlbums, ...response.data.data];
        offset += limit;

        // Calculate and report progress
        if (onProgress) {
          const progress = Math.min(50, (allAlbums.length / 1000) * 50);
          onProgress(progress);
        }
      }
    }

    console.log('Total albums found:', allAlbums.length);

    // Transform albums to our format
    const transformedAlbums = allAlbums.map((album) => {
      console.log('Processing album:', album);
      return {
        id: uuidv4(),
        user_id: userId,
        service: 'apple-music' as const,
        album_id: album.id,
        name: album.attributes.name,
        artist_name: album.attributes.artistName,
        image_url: album.attributes.artwork?.url?.replace('{w}x{h}', '300x300'),
        release_date: album.attributes.releaseDate,
        tracks_count: album.attributes.trackCount,
        external_url: null,
        album_type: 'album', // We can improve this later to detect singles/EPs
        synced_at: new Date().toISOString(),
      };
    });

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

      // Update progress for the insertion phase
      if (onProgress) {
        const insertProgress = Math.min(
          50,
          ((i + batchSize) / transformedAlbums.length) * 50
        );
        onProgress(insertProgress);
      }
    }

    // Set final progress for albums (50%)
    if (onProgress) {
      onProgress(50);
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
  }
}
