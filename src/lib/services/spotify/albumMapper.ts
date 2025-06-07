import { SpotifyAlbumItem, SpotifyAlbum, DbUserAlbum } from './types';

/**
 * Determine the album type based on Spotify's album_type and heuristics
 * 
 * @param album The Spotify album object
 * @returns Normalized album type ('album', 'single', or 'ep')
 */
export function determineAlbumType(album: SpotifyAlbum): 'album' | 'single' | 'ep' {
  // First check Spotify's explicit album_type
  const spotifyType = album.album_type?.toLowerCase();

  if (spotifyType === 'single') {
    return 'single';
  } 
  
  // Handle EPs - either labeled as such or by track count heuristic
  if (spotifyType === 'ep') {
    return 'ep';
  }
  
  // Check if the name contains EP
  if (album.name?.toLowerCase().includes(' ep') || album.name?.toLowerCase().endsWith(' ep')) {
    return 'ep';
  }
  
  // Track count heuristic for EPs
  if (album.total_tracks > 0 && album.total_tracks <= 6) {
    return 'ep';
  }
  
  // Compilations are treated as albums
  // For any other type, default to 'album'
  return 'album';
}

/**
 * Convert a Spotify album to the database format
 * 
 * @param albumItem Spotify album item from the API
 * @param userId User ID for the database record
 * @returns Database-ready album object
 */
export function mapSpotifyAlbumToDbFormat(albumItem: SpotifyAlbumItem, userId: string): DbUserAlbum {
  const album = albumItem.album;
  const now = new Date().toISOString();
  
  return {
    user_id: userId,
    service: 'spotify',
    album_id: album.id,
    name: album.name,
    artist_name: album.artists?.[0]?.name || '',
    image_url: album.images?.[0]?.url || null,
    release_date: album.release_date || null,
    tracks: album.total_tracks || null,
    external_url: album.external_urls?.spotify || null,
    synced_at: now,
    created_at: now,
    updated_at: now,
    album_type: determineAlbumType(album),
    added_at: albumItem.added_at || null,
    upc: album.external_ids?.upc || null,
  };
}

/**
 * Batch convert Spotify albums to database format
 * 
 * @param albumItems Array of Spotify album items from the API
 * @param userId User ID for the database records
 * @returns Array of database-ready album objects
 */
export function batchMapSpotifyAlbumsToDbFormat(albumItems: SpotifyAlbumItem[], userId: string): DbUserAlbum[] {
  return albumItems.map(item => mapSpotifyAlbumToDbFormat(item, userId));
}