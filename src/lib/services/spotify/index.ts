import { getServiceAuth, saveServiceAuth, removeServiceAuth, ServiceType } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';
import { SpotifyAlbumResponse, SpotifyAlbumItem } from './types';
import { batchMapSpotifyAlbumsToDbFormat } from './albumMapper';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export interface SpotifyAuth {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type SearchResult = {
  id: string;
  name: string;
  artist: string;
  type: string;
};

// ============================================================
// Auth Functions
// ============================================================

export function getSpotifyAuthUrl() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Missing Spotify environment variables');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: [
      'user-library-read',
      'user-library-modify',
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private'
    ].join(' '),
    redirect_uri: SPOTIFY_REDIRECT_URI,
    show_dialog: 'true',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function authorizeSpotify(userId: string) {
  try {
    logger.info('Starting Spotify authorization...', { userId });
    
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
      throw new Error('Spotify client ID or redirect URI not found');
    }

    const scope = [
      'user-library-read',
      'user-library-modify',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope,
      state: userId,
      show_dialog: 'true', // Always show the auth dialog
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    logger.info('Redirecting to Spotify authorization page');
    
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to start Spotify authorization:', error);
    throw error;
  }
}

export async function unauthorizeSpotify(userId: string) {
  try {
    logger.info('Removing Spotify authorization...');
    await removeServiceAuth(userId, 'spotify');
    logger.info('Spotify authorization removed successfully');
  } catch (error) {
    console.error('Failed to remove Spotify authorization:', error);
    throw error;
  }
}

export async function handleSpotifyCallback(code: string, userId: string) {
  try {
    logger.info('Handling Spotify callback...', { code, userId });

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
      throw new Error('Missing Spotify configuration');
    }

    const tokens = await getSpotifyToken(code);
    
    // Save the tokens
    await saveServiceAuth(userId, 'spotify', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    });

    // Get the saved callback URL
    const callbackUrl = sessionStorage.getItem('auth_callback_url') || '/home';
    sessionStorage.removeItem('auth_callback_url');
    
    return callbackUrl;
  } catch (error) {
    console.error('Failed to handle Spotify callback:', error);
    throw error;
  }
}

export async function getSpotifyToken(code: string): Promise<SpotifyAuth> {
  logger.info('Getting Spotify token with code');
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Missing Spotify environment variables');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        )}`,
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token request failed:', errorText);
      throw new Error(
        `Failed to get Spotify token: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.access_token) {
      console.error('Missing access token in response:', data);
      throw new Error('Invalid token response from Spotify');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Failed to get Spotify token:', error);
    throw error;
  }
}

export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyAuth> {
  logger.info('Starting Spotify token refresh...');
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Missing environment variables');
    throw new Error('Missing Spotify environment variables');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
  });

  try {
    logger.info('Making refresh token request to Spotify...');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        )}`,
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Failed to refresh token: ${response.status} ${errorText}`
      );
    }

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid JSON response from Spotify');
    }

    try {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Use existing if not provided
        expiresIn: data.expires_in,
      };
    } catch (parseError) {
      console.error('Schema validation failed:', parseError);
      throw new Error('Invalid token response from Spotify');
    }
  } catch (error) {
    console.error('Token refresh request failed:', error);
    throw error;
  }
}

// ============================================================
// API Request Handlers
// ============================================================

async function handleSpotifyRequest<T>(
  accessToken: string,
  requestFn: (token: string) => Promise<T>,
  userId?: string
): Promise<T> {
  const makeRequest = async (token: string) => {
    try {
      return await requestFn(token);
    } catch (error) {
      // Check if the error is due to an expired token
      if (
        error instanceof Error &&
        'status' in error &&
        (error as any).status === 401
      ) {
        if (!userId) {
          throw new Error('User ID is required for token refresh');
        }

        // Get the current auth data
        const currentAuth = await getServiceAuth(userId, 'spotify');
        if (!currentAuth?.refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          // Attempt to refresh the token
          logger.info('Token expired, attempting refresh...');
          const newAuth = await refreshSpotifyToken(currentAuth.refreshToken);

          // Save the new tokens
          await saveServiceAuth(userId, 'spotify', {
            accessToken: newAuth.accessToken,
            refreshToken: newAuth.refreshToken,
            expiresAt: new Date(Date.now() + newAuth.expiresIn * 1000),
          });

          // Retry the request with the new token
          logger.info('Token refreshed, retrying request...');
          return await requestFn(newAuth.accessToken);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Failed to refresh access token');
        }
      }

      // Ensure error is properly formatted with status code if it's a fetch error
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        error.message = `Spotify API error (${status}): ${error.message}`;
      }
      throw error;
    }
  };

  try {
    if (typeof accessToken !== 'string') {
      console.error('Invalid access token type:', typeof accessToken);
      throw new Error('Invalid access token type');
    }

    if (!accessToken) {
      console.error('Access token is empty');
      throw new Error('Access token is required');
    }

    return await makeRequest(accessToken);
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// ============================================================
// Library Functions
// ============================================================

export async function getSpotifyPlaylists(accessToken: string, userId: string) {
  return handleSpotifyRequest(
    accessToken,
    async (token) => {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spotify API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to fetch playlists: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data?.items)) {
        console.error('Invalid playlist response:', data);
        throw new Error('Invalid playlist response from Spotify');
      }

      return data.items.map((item: any) => ({
        playlist_id: item.id,
        name: item.name || 'Untitled Playlist',
        description: item.description || '',
        artwork: item.images?.[0]
          ? {
              url: item.images[0].url,
              height: item.images[0].height || null,
              width: item.images[0].width || null,
            }
          : null,
        tracks: item.tracks?.total || 0,
        owner: item.owner
          ? {
              id: item.owner.id || null,
              display_name: item.owner.display_name || null,
            }
          : null,
        is_public: Boolean(item.public),
        external_url: item.external_urls?.spotify || null,
      }));
    },
    userId
  );
}

export async function getSpotifyAlbums(accessToken: string): Promise<SpotifyAlbumResponse> {
  const response = await fetch(
    'https://api.spotify.com/v1/me/albums?limit=50',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get Spotify albums:', {
      status: response.status,
      error: errorText,
    });
    throw new Error(`Failed to get Spotify albums: ${response.status}`);
  }

  const data = await response.json();

  if (!data?.items || !Array.isArray(data.items)) {
    console.error('Invalid album response:', data);
    throw new Error('Invalid album response from Spotify');
  }

  return data;
}

export async function getMoreSpotifyAlbums(
  nextUrl: string,
  accessToken: string
): Promise<SpotifyAlbumResponse> {
  const response = await fetch(nextUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get more Spotify albums:', {
      status: response.status,
      error: errorText,
    });
    throw new Error(`Failed to get more Spotify albums: ${response.status}`);
  }

  const data = await response.json();

  if (!data?.items || !Array.isArray(data.items)) {
    console.error('Invalid album response:', data);
    throw new Error('Invalid album response from Spotify');
  }

  return data;
}

export async function getAllSpotifyAlbums(
  userId: string,
  accessToken: string,
  onProgress?: (current: number, total: number) => void
) {
  try {
    let allAlbums: SpotifyAlbumItem[] = [];
    let nextUrl: string | null = null;
    let total = 0;
    let current = 0;

    // Get first page
    const firstPage = await getSpotifyAlbums(accessToken);
    if (firstPage.items) {
      allAlbums = [...firstPage.items];
      nextUrl = firstPage.next;
      total = firstPage.total || 0;
      current = allAlbums.length;
      onProgress?.(current, total);
    }

    // Get remaining pages
    while (nextUrl) {
      const nextPage = await getMoreSpotifyAlbums(nextUrl, accessToken);
      if (nextPage.items) {
        allAlbums = [...allAlbums, ...nextPage.items];
        nextUrl = nextPage.next;
        current = allAlbums.length;
        onProgress?.(current, total);
      }
    }

    // Convert albums to database format using our utility function
    return batchMapSpotifyAlbumsToDbFormat(allAlbums, userId);
  } catch (error) {
    console.error('Failed to get all Spotify albums:', error);
    throw error;
  }
}

export async function getSpotifyAlbumDetails(
  userId: string,
  albumId: string,
  accessToken: string
) {
  return handleSpotifyRequest(
    accessToken,
    async (token) => {
      const [albumResponse, tracksResponse] = await Promise.all([
        fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!albumResponse.ok || !tracksResponse.ok) {
        const error = new Error(
          `Failed to get Spotify album details: ${albumResponse.status}`
        );
        (error as any).status = albumResponse.status;
        throw error;
      }

      const [album, tracks] = await Promise.all([
        albumResponse.json(),
        tracksResponse.json(),
      ]);

      return {
        id: album.id,
        name: album.name,
        artists: album.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.name,
        })),
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        artwork: {
          url: album.images[0]?.url,
          width: album.images[0]?.width,
          height: album.images[0]?.height,
        },
        genres: album.genres || [],
        copyrights: album.copyrights?.map((c: any) => c.text) || [],
        label: album.label,
        tracks: tracks.items.map((track: any) => ({
          id: track.id,
          name: track.name,
          trackNumber: track.track_number,
          durationMs: track.duration_ms,
          artists: track.artists.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
          })),
          previewUrl: track.preview_url,
        })),
      };
    },
    userId
  );
}

export async function getSpotifyPlaylistDetails(
  playlistId: string,
  accessToken: string,
  userId?: string
) {
  logger.info('Getting playlist details for:', playlistId);

  return handleSpotifyRequest(
    accessToken,
    async (token) => {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = new Error('Failed to fetch playlist details');
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        owner: data.owner,
        service: 'spotify' as const,
        artwork: data.images?.[0]
          ? {
              url: data.images[0].url,
              width: data.images[0].width,
              height: data.images[0].height,
            }
          : undefined,
        tracks:
          data.tracks?.items?.map((item: any) => ({
            id: item.track.id,
            name: item.track.name,
            artist: {
              id: item.track.artists[0].id,
              name: item.track.artists[0].name,
            },
            artists: item.track.artists.map((artist: any) => ({
              id: artist.id,
              name: artist.name,
            })),
            album: {
              id: item.track.album.id,
              name: item.track.album.name,
            },
            duration_ms: item.track.duration_ms,
            added_at: item.added_at,
          })) || [],
        total_tracks: data.tracks?.total || 0,
        collaborative: data.collaborative,
        public: data.public,
        type: 'playlist',
      };
    },
    userId
  );
}

export async function searchSpotifyAlbum(
  query: string,
  token: string
): Promise<SearchResult | null> {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=album&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to search Spotify album:', errorText);
      throw new Error('Failed to search Spotify album');
    }

    const data = await response.json();
    const albums = data.albums.items;

    if (albums.length === 0) {
      return null;
    }

    return {
      id: albums[0].id,
      name: albums[0].name,
      artist: albums[0].artists[0].name,
      type: 'album',
    };
  } catch (error) {
    console.error('Error searching Spotify album:', error);
    throw error;
  }
}

export async function addSpotifyAlbumToLibrary(
  albumId: string,
  token: string
): Promise<void> {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/albums`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: [albumId] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to add album to Spotify library:', errorText);
      throw new Error('Failed to add album to Spotify library');
    }
  } catch (error) {
    console.error('Error adding album to Spotify library:', error);
    throw error;
  }
}

export async function syncSpotifyLibrary(
  userId: string,
  accessToken: string,
  onProgress?: (current: number, total: number) => void
) {
  try {
    // Get all albums from Spotify
    const albums = await getAllSpotifyAlbums(userId, accessToken, onProgress);

    // Get all playlists
    const playlists = await getSpotifyPlaylists(accessToken, userId);

    // Save albums to Supabase
    const { error: albumError } = await supabase
      .from('user_albums')
      .upsert(albums.map(album => ({
        id: globalThis.crypto.randomUUID(),
        ...album
      })));

    if (albumError) {
      console.error('Failed to save albums:', albumError);
      throw albumError;
    }

    // Save playlists to Supabase
    const { error: playlistError } = await supabase
      .from('user_playlists')
      .upsert(
        playlists.map((playlist: any) => ({
          id: globalThis.crypto.randomUUID(),
          user_id: userId,
          service: 'spotify',
          playlist_id: playlist.playlist_id,
          name: playlist.name,
          description: playlist.description || '',
          image_url: playlist.artwork?.url || null,
          tracks: playlist.tracks || 0,
          owner_id: playlist.owner?.id || null,
          owner_name: playlist.owner?.display_name || null,
          is_public: playlist.is_public,
          external_url: playlist.external_url,
          synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );

    if (playlistError) {
      console.error('Failed to save playlists:', playlistError);
      throw playlistError;
    }

    // Update sync timestamp in user_services
    const { error: serviceError } = await supabase
      .from('user_services')
      .update({ synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('service', 'spotify');

    if (serviceError) {
      console.error('Failed to update sync timestamp:', serviceError);
      throw serviceError;
    }

    logger.info('Spotify library sync completed successfully');
    return true;
  } catch (error) {
    console.error('Failed to sync Spotify library:', error);
    throw error;
  }
}