import { getAllSpotifyAlbums, getSpotifyPlaylists } from '../api/spotify';
import { supabase } from '../supabase';

export async function syncSpotifyLibrary(
  userId: string,
  accessToken: string,
  onProgress?: (current: number, total: number) => void
) {
  try {
    // Get all albums from Spotify
    const albums = await getAllSpotifyAlbums(userId, accessToken, onProgress);

    // Get all playlists
    const playlists = await getSpotifyPlaylists(accessToken);

    // Save albums to Supabase
    const { error: albumError } = await supabase.from('user_albums').upsert(
      albums.map((album: any) => {
        // First check Spotify's album_type
        let albumType = album.album.album_type?.toLowerCase();
        
        // If it's not one of our valid types, determine based on our rules
        if (!['album', 'single', 'ep'].includes(albumType)) {
          albumType = album.album.name?.toLowerCase().includes(' ep') || album.album.name?.toLowerCase().endsWith(' ep')
            ? 'ep'
            : album.album.total_tracks <= 6
            ? 'ep'
            : 'album';
        }
        
        console.log('Album type detection:', {
          name: album.album.name,
          spotifyType: album.album.album_type,
          trackCount: album.album.total_tracks,
          finalType: albumType
        });
        
        return {
          id: globalThis.crypto.randomUUID(),
          user_id: userId,
          service: 'spotify',
          album_id: album.album.id,
          name: album.album.name,
          artist_name: album.album.artists
            .map((artist: any) => artist.name)
            .join(', '),
          image_url: album.album.images?.[0]?.url || null,
          release_date: album.album.release_date,
          tracks_count: album.album.total_tracks,
          external_url: album.album.external_urls?.spotify || null,
          synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          album_type: albumType
        };
      })
    );

    if (albumError) {
      console.error('Failed to save albums:', albumError);
      throw albumError;
    }

    // Save playlists to Supabase
    const { error: playlistError } = await supabase
      .from('user_playlists')
      .upsert(
        playlists.items.map((playlist: any) => ({
          id: globalThis.crypto.randomUUID(),
          user_id: userId,
          service: 'spotify',
          playlist_id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          image_url: playlist.images?.[0]?.url || null,
          tracks_count: playlist.tracks.total,
          owner_id: playlist.owner?.id || null,
          owner_name: playlist.owner?.display_name || null,
          is_public: playlist.public || false,
          external_url: playlist.external_urls?.spotify || null,
          synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );

    if (playlistError) {
      console.error('Failed to save playlists:', playlistError);
      throw playlistError;
    }

    return true;
  } catch (error) {
    console.error('Failed to sync Spotify library:', error);
    throw error;
  }
}
