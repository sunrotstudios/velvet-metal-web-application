import { z } from 'zod';
import { saveServiceAuth, removeServiceAuth } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export type SearchResult = {
  id: string;
  name: string;
  artist: string;
  type: string;
};

export type DetailedPlaylist = {
  id: string;
  playlist_id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
  };
  tracks: any[];
  total_tracks: number;
  artwork: {
    url: string;
  } | null;
  external_url: string | null;
  service: 'apple-music';
};

export type DetailedAlbum = {
  id: string;
  album_id: string;
  name: string;
  artistName: string;
  totalTracks: number;
  releaseDate: string;
  artwork: {
    url: string;
  } | null;
  tracks: any[];
  external_url: string | null;
  service: 'apple-music';
  album_type: string;
  added_at?: string | null;
};

export const APPLE_DEVELOPER_TOKEN = import.meta.env.VITE_APPLE_DEVELOPER_TOKEN;
const APPLE_TEAM_ID = import.meta.env.VITE_APPLE_TEAM_ID || 'DYW4AG9442';
const APPLE_KEY_ID = import.meta.env.VITE_APPLE_KEY_ID || '6KVDS6765S';

export const appleMusicAuthSchema = z.object({
  userToken: z.string(),
  musicUserToken: z.string(),
});

export type AppleMusicAuth = z.infer<typeof appleMusicAuthSchema>;

declare global {
  interface Window {
    MusicKit: any;
  }
}

let musicKit: any = null;

// ============================================================
// Auth Functions
// ============================================================

async function loadMusicKitScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (
      document.querySelector(
        'script[src="https://js-cdn.music.apple.com/musickit/v3/musickit.js"]'
      )
    ) {
      console.log('MusicKit.js script already loaded');
      resolve();
      return;
    }

    console.log('Loading MusicKit.js script...');
    const script = document.createElement('script');
    script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
    script.async = true;
    script.onload = () => {
      console.log('MusicKit.js script loaded successfully');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Failed to load MusicKit.js script:', error);
      reject(new Error('Failed to load MusicKit.js'));
    };
    document.head.appendChild(script);
  });
}

export async function initializeAppleMusic() {
  if (!musicKit) {
    try {
      console.log('Loading MusicKit.js...');
      await loadMusicKitScript();

      if (!window.MusicKit) {
        throw new Error('MusicKit not found on window object');
      }

      console.log('Configuring MusicKit...');
      const developerToken = APPLE_DEVELOPER_TOKEN;

      if (!developerToken) {
        throw new Error(
          'Apple Music developer token not found in environment variables'
        );
      }

      musicKit = await window.MusicKit.configure({
        developerToken,
        app: {
          name: 'Velvet Metal',
          build: '1.0.0',
          teamId: APPLE_TEAM_ID,
          keyId: APPLE_KEY_ID,
        },
      });

      console.log('MusicKit configured successfully');
      return musicKit;
    } catch (error) {
      console.error('Failed to initialize Apple Music:', error);
      throw error;
    }
  }
  return musicKit;
}

export async function authorizeAppleMusic(userId: string) {
  try {
    console.log('Starting Apple Music authorization...', { userId });
    const music = await initializeAppleMusic();

    if (!music) {
      throw new Error('Failed to initialize Apple Music');
    }

    const musicUserToken = await music.authorize();

    // Try to make a test API call to verify subscription
    try {
      await music.api.music('/v1/me/library/albums', { limit: 1 });
    } catch (error: any) {
      if (error?.name === 'ACCESS_DENIED' || error?.status === 403) {
        throw new Error('Your Apple Music subscription appears to have expired. Please renew your subscription to continue using Apple Music features.');
      }
      throw error;
    }

    // Save the authorization with the correct token structure
    await saveServiceAuth(userId, 'apple-music', {
      accessToken: APPLE_DEVELOPER_TOKEN || '',
      musicUserToken: musicUserToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    // Start library sync in the background
    toast.promise(syncAppleMusicLibrary(userId), {
      loading: 'Syncing Apple Music Library...',
      success: 'Library sync complete!',
      error: 'Failed to sync library',
    });

    console.log('Apple Music authorization complete');
    return musicUserToken;
  } catch (error) {
    console.error('Apple Music authorization failed:', error);
    throw error;
  }
}

export async function unauthorizeAppleMusic(userId: string) {
  try {
    console.log('Removing Apple Music authorization...');
    const music = await initializeAppleMusic();

    if (!music) {
      throw new Error('Failed to initialize Apple Music');
    }

    // Revoke Apple Music authorization
    await music.unauthorize();

    // Remove from database
    await removeServiceAuth(userId, 'apple-music');

    console.log('Apple Music authorization removed successfully');
  } catch (error) {
    console.error('Failed to remove Apple Music authorization:', error);
    throw error;
  }
}

export function isAppleMusicAuthorized(): boolean {
  return musicKit?.isAuthorized ?? false;
}

// ============================================================
// Library Functions
// ============================================================

export const getAppleMusicLibrary = async (token: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/playlists',
    {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Apple Music library');
  }

  const playlists = await response.json();

  // Then, fetch track counts for each playlist
  const playlistsWithTracks = await Promise.all(
    playlists.data.map(async (playlist: any) => {
      // Extract the catalog ID from the playParams
      const catalogId =
        playlist.attributes?.playParams?.catalogId || playlist.id;

      const tracksResponse = await fetch(
        `https://api.music.apple.com/v1/me/library/playlists/${catalogId}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          },
        }
      );

      if (!tracksResponse.ok) {
        console.warn(`Failed to fetch tracks for playlist ${playlist.id}`);
        return {
          ...playlist,
          relationships: {
            tracks: {
              data: [],
            },
          },
        };
      }

      const tracksData = await tracksResponse.json();
      return {
        ...playlist,
        relationships: {
          tracks: {
            data: tracksData.data || [],
          },
        },
      };
    })
  );

  return {
    ...playlists,
    data: playlistsWithTracks,
  };
};

export const getAppleMusicAlbums = async (token: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/albums',
    {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Apple Music albums');
  }

  return response.json();
};

export const getAllAppleMusicAlbums = async (token: string) => {
  let allAlbums: any[] = [];
  let offset = 0;
  const limit = 100; // Apple Music's max limit per request
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.music.apple.com/v1/me/library/albums?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Apple Music albums');
    }

    const data = await response.json();
    const albums = data.data || [];
    const transformedAlbums = albums.map((album: any) => ({
      id: album.id, // Keep the full ID including 'l.' prefix
      album_id: album.id, // Keep the full ID including 'l.' prefix
      name: album.attributes.name,
      artist_name: album.attributes.artistName,
      image_url: album.attributes.artwork
        ? album.attributes.artwork.url
            .replace('{w}', '300')
            .replace('{h}', '300')
        : null,
      release_date: album.attributes.releaseDate,
      service: 'apple-music' as const,
      tracks_count: album.attributes.trackCount,
      external_url: null,
      album_type: album.attributes.playParams?.kind || 'album',
    }));
    allAlbums = [...allAlbums, ...transformedAlbums];

    // Check if there are more albums to fetch
    hasMore = albums.length === limit;
    offset += limit;
  }

  return {
    data: allAlbums,
  };
};

export const getAppleMusicPlaylistDetails = async (
  playlistId: string,
  token: string
): Promise<DetailedPlaylist> => {
  try {
    if (!token) {
      throw new Error('Apple Music user token not provided');
    }

    const response = await fetch(
      `https://api.music.apple.com/v1/me/library/playlists/${playlistId}?include=tracks,artists`,
      {
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apple Music API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        playlistId,
      });
      throw new Error(
        `Apple Music API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    if (!data.data?.[0]) {
      throw new Error('No playlist data returned');
    }

    const playlist = data.data[0];
    const tracks = playlist.relationships?.tracks?.data || [];

    return {
      id: playlistId, // Keep the original ID with 'l.' prefix
      playlist_id: playlistId,
      name: playlist.attributes.name,
      description: playlist.attributes.description?.standard || '',
      owner: {
        id: 'me',
        display_name: 'My Library',
      },
      tracks: tracks.map((track: any) => ({
        id: track.id,
        track_id: track.id,
        name: track.attributes.name,
        artist: {
          id: track.relationships?.artists?.data?.[0]?.id || '',
          name: track.attributes.artistName,
        },
        album: {
          id: track.relationships?.albums?.data?.[0]?.id || '',
          name: track.attributes.albumName,
          image_url: track.attributes.artwork?.url || null,
        },
        duration_ms: track.attributes.durationInMillis,
        track_number: track.attributes.trackNumber,
        external_url: null,
        preview_url: track.attributes.previews?.[0]?.url || null,
        service: 'apple-music' as const,
      })),
      total_tracks: tracks.length,
      artwork: playlist.attributes.artwork
        ? {
            url: playlist.attributes.artwork.url
              .replace('{w}', '300')
              .replace('{h}', '300'),
          }
        : null,
      external_url: null,
      service: 'apple-music' as const,
    };
  } catch (error) {
    console.error('Error fetching Apple Music playlist:', error);
    throw error;
  }
};

export const getAppleMusicAlbumDetails = async (
  albumId: string,
  token: string
): Promise<DetailedAlbum> => {
  try {
    if (!token) {
      throw new Error('Apple Music user token not provided');
    }

    // For library albums (starting with 'l.'), we need to use the library endpoint
    const isLibraryAlbum = albumId.startsWith('l.');

    if (isLibraryAlbum) {
      // For library albums, use the full ID including 'l.' prefix
      const response = await fetch(
        `https://api.music.apple.com/v1/me/library/albums/${albumId}?include=tracks,artists`,
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Apple Music API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          albumId,
        });
        throw new Error(
          `Apple Music API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      const album = data.data?.[0];

      if (!album) {
        throw new Error('No album data returned');
      }

      const tracks = album.relationships?.tracks?.data || [];

      return {
        id: albumId,
        album_id: albumId,
        name: album.attributes.name,
        artistName: album.attributes.artistName,
        totalTracks: album.attributes.trackCount,
        releaseDate: album.attributes.releaseDate,
        artwork: album.attributes.artwork
          ? {
              url: album.attributes.artwork.url
                .replace('{w}', '300')
                .replace('{h}', '300'),
            }
          : null,
        tracks: tracks.map((track: any) => ({
          id: track.id,
          track_id: track.id,
          name: track.attributes.name,
          artistName: track.attributes.artistName,
          trackNumber: track.attributes.trackNumber,
          durationMs: track.attributes.durationInMillis,
          album: {
            id: albumId,
            name: album.attributes.name,
            artwork: album.attributes.artwork
              ? {
                  url: album.attributes.artwork.url
                    .replace('{w}', '300')
                    .replace('{h}', '300'),
                }
              : null,
          },
          preview_url: track.attributes.previews?.[0]?.url || null,
          service: 'apple-music' as const,
        })),
        external_url: null,
        service: 'apple-music' as const,
        album_type: album.attributes.playParams?.kind || 'album',
        added_at: album.attributes.dateAdded || null,
      };
    } else {
      // For catalog albums, use the catalog endpoint
      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/albums/${albumId}?include=tracks,artists`,
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Apple Music API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          albumId,
        });
        throw new Error(
          `Apple Music API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      if (!data.data?.[0]) {
        throw new Error('No album data returned');
      }

      const album = data.data[0];
      const tracks = album.relationships?.tracks?.data || [];

      return {
        id: albumId,
        album_id: albumId,
        name: album.attributes.name,
        artistName: album.attributes.artistName,
        totalTracks: album.attributes.trackCount,
        releaseDate: album.attributes.releaseDate,
        artwork: album.attributes.artwork
          ? {
              url: album.attributes.artwork.url
                .replace('{w}', '300')
                .replace('{h}', '300'),
            }
          : null,
        tracks: tracks.map((track: any) => ({
          id: track.id,
          track_id: track.id,
          name: track.attributes.name,
          artistName: track.attributes.artistName,
          trackNumber: track.attributes.trackNumber,
          durationMs: track.attributes.durationInMillis,
          album: {
            id: albumId,
            name: album.attributes.name,
            artwork: album.attributes.artwork
              ? {
                  url: album.attributes.artwork.url
                    .replace('{w}', '300')
                    .replace('{h}', '300'),
                }
              : null,
          },
          preview_url: track.attributes.previews?.[0]?.url || null,
          service: 'apple-music' as const,
        })),
        external_url: null,
        service: 'apple-music' as const,
        album_type: album.attributes.albumType || 'album',
      };
    }
  } catch (error) {
    console.error('Error fetching Apple Music album:', error);
    throw error;
  }
};

// ============================================================
// Library Sync Functions
// ============================================================

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

// ============================================================
// Album Management Functions
// ============================================================

export async function searchAppleMusicAlbum(
  albumQuery: string,
  artistQuery: string,
  token: string
): Promise<SearchResult | null> {
  try {
    const searchUrl = `https://api.music.apple.com/v1/catalog/us/search?types=albums&term=${encodeURIComponent(
      `${albumQuery} ${artistQuery}`
    )}`;

    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to search Apple Music album:', errorText);
      throw new Error('Failed to search Apple Music album');
    }

    const data = await response.json();

    const albums = data.results.albums?.data;

    if (!albums || albums.length === 0) {
      console.log('No albums found in search results');
      return null;
    }

    const album = albums[0];

    return {
      id: album.id,
      name: album.attributes.name,
      artist: album.attributes.artistName,
      type: 'album',
    };
  } catch (error) {
    console.error('Error searching Apple Music album:', error);
    throw error;
  }
}

export async function searchAppleMusicCatalog(
  query: string,
  token: string,
  types: string[] = ['albums']
): Promise<any> {
  const url = new URL('https://api.music.apple.com/v1/catalog/us/search');
  url.searchParams.append('term', query);
  url.searchParams.append('types', types.join(','));
  url.searchParams.append('limit', '10');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Search failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Apple Music search error:', error);
    throw error;
  }
}

export function findBestMatchingAlbum(
  searchResults: any,
  targetAlbum: { name: string; artist_name: string }
): string | null {
  if (!searchResults?.albums?.data) {
    console.log('No search results found');
    return null;
  }

  const albums = searchResults.albums.data;
  let bestMatch: any = null;
  let bestScore = 0;

  for (const album of albums) {
    const nameMatch =
      album.attributes.name.toLowerCase() === targetAlbum.name.toLowerCase();
    const artistMatch =
      album.attributes.artistName.toLowerCase() ===
      targetAlbum.artist_name.toLowerCase();

    const score = (nameMatch ? 1 : 0) + (artistMatch ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = album;
    }
  }

  if (bestMatch && bestScore > 0) {
    console.log('Found best match:', {
      id: bestMatch.id,
      name: bestMatch.attributes.name,
      artist: bestMatch.attributes.artistName,
      score: bestScore,
    });
    return bestMatch.id;
  }

  console.log('No suitable match found');
  return null;
}

// ============================================================
// Utility Functions
// ============================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Only retry on 500 errors or network failures
      if (
        !error.message?.includes('500') &&
        !error.message?.includes('Failed to fetch')
      ) {
        throw error;
      }

      const delayMs = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  throw lastError!;
}

async function findAlbumInLibrary(
  catalogId: string,
  token: string,
  offset = 0
): Promise<any> {
  const limit = 100; // Use maximum limit to reduce API calls
  const libraryUrl = `https://api.music.apple.com/v1/me/library/albums?limit=${limit}&offset=${offset}`;

  const response = await fetch(libraryUrl, {
    headers: {
      Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
      'Music-User-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search library: ${response.status}`);
  }

  const data = await response.json();

  // Find the album in this batch
  const album = data.data?.find(
    (album: any) =>
      album.attributes?.playParams?.catalogId === catalogId ||
      album.attributes?.playParams?.id === catalogId
  );

  if (album) {
    return album;
  }

  // If we have more albums to check and haven't found it yet, continue searching
  if (data.next && offset + limit < data.meta.total) {
    return findAlbumInLibrary(catalogId, token, offset + limit);
  }

  return null;
}

export async function checkAlbumsInLibrary(
  albumIds: string[],
  token: string
): Promise<{ [id: string]: boolean }> {
  try {
    console.log('Starting library check for albums:', albumIds);
    const results: { [id: string]: boolean } = {};

    // Process in smaller batches to avoid URL length limits
    const batchSize = 10;
    for (let i = 0; i < albumIds.length; i += batchSize) {
      const batchIds = albumIds.slice(i, i + batchSize);
      const idsParam = batchIds.map((id) => `ids[albums]=${id}`).join('&');
      const url = `https://api.music.apple.com/v1/me/library/albums?${idsParam}`;

      console.log('Checking batch with URL:', url);

      const response = await retryWithBackoff(async () => {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to check albums:', {
            status: res.status,
            error: errorText,
            url,
          });
          throw new Error(
            `Failed to check albums: ${res.status} - ${errorText}`
          );
        }

        return res;
      });

      const data = await response.json();
      console.log('Library check response:', data);

      const foundIds = new Set(data.data?.map((item: any) => item.id));
      console.log('Found IDs in library:', Array.from(foundIds));

      for (const id of batchIds) {
        results[id] = foundIds.has(id);
        console.log(
          `Album ${id}: ${results[id] ? 'found' : 'not found'} in library`
        );
      }
    }

    return results;
  } catch (error) {
    console.error('Failed to check albums in library:', error);
    throw error;
  }
}

export async function findAlbumsByUPC(
  upcs: string[],
  userToken: string
): Promise<{ [upc: string]: string | null }> {
  try {
    // Apple Music API has a limit on URL length, so we'll process in batches
    const batchSize = 10;
    const results: { [upc: string]: string | null } = {};

    for (let i = 0; i < upcs.length; i += batchSize) {
      const batchUpcs = upcs.slice(i, i + batchSize);

      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/albums?filter[upc]=${batchUpcs.join(
          ','
        )}`,
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Apple Music API error: ${response.status}`);
      }

      const data = await response.json();

      // Map each UPC to its corresponding Apple Music ID
      batchUpcs.forEach((upc) => {
        const album = data.data?.find(
          (a: any) =>
            a.attributes?.upc === upc ||
            // Sometimes UPCs have leading zeros trimmed, try both
            a.attributes?.upc === upc.replace(/^0+/, '')
        );
        results[upc] = album ? album.id : null;
      });

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < upcs.length) {
        await delay(100);
      }
    }

    return results;
  } catch (error) {
    console.error('Error finding albums by UPC:', error);
    throw error;
  }
}

export async function addAlbumsToAppleMusicLibrary(
  albumIds: string[],
  token: string
): Promise<void> {
  if (!albumIds.length) return;

  try {
    console.log('Adding albums to library:', { albumIds });

    // Process in larger batches while staying under URL length limits
    const batchSize = 25; // Increased from 10 to 25
    const batches = [];

    for (let i = 0; i < albumIds.length; i += batchSize) {
      batches.push(albumIds.slice(i, i + batchSize));
    }

    console.log(`Processing ${batches.length} batches of albums...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `Processing batch ${i + 1}/${batches.length} (${batch.length} albums)`
      );

      const idsParam = batch.map((id) => `ids[albums]=${id}`).join('&');
      const url = `https://api.music.apple.com/v1/me/library?${idsParam}`;

      console.log('Adding batch to library:', { url });

      await retryWithBackoff(async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          },
        });

        if (response.status !== 202) {
          let errorMessage = `Failed to add albums to library: ${response.status}`;
          try {
            const error = await response.text();
            console.error('Apple Music API error details:', error);
            errorMessage += ` - ${error}`;
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          throw new Error(errorMessage);
        }

        console.log(`Batch ${i + 1}/${batches.length} accepted (status 202)`);
        return response;
      });

      // Minimal wait between batches to respect rate limits
      // Apple's rate limits aren't publicly documented, but testing shows we can be more aggressive
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Failed to add albums to library:', error);
    throw error;
  }
}

export async function addAppleMusicAlbumToLibrary(
  albumId: string,
  token: string
): Promise<void> {
  try {
    // First, verify the album exists in the catalog
    const catalogUrl = `https://api.music.apple.com/v1/catalog/us/albums/${albumId}`;

    const catalogResponse = await retryWithBackoff(async () => {
      const response = await fetch(catalogUrl, {
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to verify album in catalog:', {
          status: response.status,
          error: errorText,
          albumId,
        });
        throw new Error(
          `Failed to verify album in catalog: ${response.status} - ${errorText}`
        );
      }

      return response;
    });

    const catalogData = await catalogResponse.json();

    // Add to library using query parameters exactly as shown in docs
    const url = `https://api.music.apple.com/v1/me/library?ids[albums]=${albumId}`;

    await retryWithBackoff(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
        },
      });

      // Per Apple's docs: 202 is success, empty body is expected
      if (response.status !== 202) {
        const errorText = await response.text();
        console.error('Failed to add album to Apple Music library:', {
          status: response.status,
          error: errorText,
          albumId,
          url,
        });
        throw new Error(
          `Failed to add album to Apple Music library: ${response.status} - ${errorText}`
        );
      }

      return response;
    });

    console.log('Successfully added album to library (status 202 Accepted)');
    console.log(
      'Note: There may be a delay before the album appears in your library'
    );

    // Implement progressive retry for checking library
    const maxAttempts = 3;
    const delays = [5000, 10000, 15000]; // Progressive delays between checks
    let libraryAlbum = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Wait before checking
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));

      try {
        libraryAlbum = await findAlbumInLibrary(albumId, token);
        if (libraryAlbum) {
          console.log('Found album in library on attempt', attempt + 1, {
            libraryId: libraryAlbum.id,
            catalogId: albumId,
            name: libraryAlbum.attributes.name,
            playParams: libraryAlbum.attributes.playParams,
          });
          break;
        }
      } catch (error) {
        console.log('Error checking library on attempt', attempt + 1, error);
        // Continue to next attempt
      }
    }

    if (!libraryAlbum) {
      console.log('Album not found in library after multiple attempts');
      console.log(
        'This is normal - there may be a longer delay before the album appears'
      );
    }
  } catch (error) {
    console.error('Error adding album to Apple Music library:', error);
    throw error;
  }
}

export async function getAppleMusicPlaylists(
  musicUserToken: string
): Promise<any[]> {
  const music = await initializeAppleMusic();
  
  try {
    const response = await music.api.library.playlists();
    
    return response.map((playlist: any) => ({
      id: playlist.id,
      user_id: '', // Apple Music doesn't provide this
      playlist_id: playlist.id,
      name: playlist.attributes.name,
      description: playlist.attributes.description?.standard || undefined,
      artwork: playlist.attributes.artwork ? {
        url: playlist.attributes.artwork.url,
        height: playlist.attributes.artwork.height,
        width: playlist.attributes.artwork.width,
      } : undefined,
      tracks_count: playlist.attributes.trackCount || 0,
      owner: {
        id: '', // Apple Music doesn't provide this
        display_name: undefined,
      },
      service: 'apple-music' as const,
      is_public: false, // Apple Music playlists are private by default
      external_url: playlist.attributes.url,
    }));
  } catch (error) {
    console.error('Error fetching Apple Music playlists:', error);
    throw error;
  }
}