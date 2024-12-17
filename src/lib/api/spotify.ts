import { z } from 'zod';
import { getServiceAuth, saveServiceAuth, removeServiceAuth } from '@/lib/services/streaming-auth';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export interface SpotifyAuth {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async function handleSpotifyRequest<T>(
  accessToken: string,
  requestFn: (token: string) => Promise<T>
): Promise<T> {
  const makeRequest = async (token: string) => {
    try {
      return await requestFn(token);
    } catch (error) {
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

    console.log('Making Spotify API request with token:', accessToken.slice(0, 10) + '...');
    return await makeRequest(accessToken);
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

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
    ].join(' '),
    redirect_uri: SPOTIFY_REDIRECT_URI,
    show_dialog: 'true',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getSpotifyToken(code: string): Promise<SpotifyAuth> {
  console.log('Getting Spotify token with code:', code);
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Missing Spotify environment variables');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });

  console.log('Making token request with params:', params.toString());
  
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

    console.log('Token response status:', response.status);
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Token request failed:', responseText);
      throw new Error(`Failed to get Spotify token: ${responseText}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Token response parsed successfully');
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      throw new Error(`Invalid token response: ${responseText}`);
    }
  } catch (error) {
    console.error('Token request error:', error);
    throw error;
  }
}

export async function refreshSpotifyToken(
  refreshToken: string
): Promise<SpotifyAuth> {
  console.log('Starting Spotify token refresh...');
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Missing environment variables:', {
      hasClientId: !!SPOTIFY_CLIENT_ID,
      hasClientSecret: !!SPOTIFY_CLIENT_SECRET,
    });
    throw new Error('Missing Spotify environment variables');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
  });

  try {
    console.log('Making refresh token request to Spotify...');
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

    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response:', {
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        scope: data.scope,
      });
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid JSON response from Spotify');
    }

    try {
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
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

export async function getSpotifyPlaylists(accessToken: string, userId: string) {
  return handleSpotifyRequest(accessToken, async (token) => {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${token}`,
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
      throw new Error(`Failed to fetch playlists: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const now = new Date().toISOString();
    
    return data.items.map((item: any) => ({
      id: crypto.randomUUID(),
      user_id: userId,
      playlist_id: item.id,
      name: item.name,
      description: item.description,
      artwork: item.images[0] ? {
        url: item.images[0].url,
        height: item.images[0].height,
        width: item.images[0].width,
      } : undefined,
      tracks_count: item.tracks.total,
      owner: {
        id: item.owner.id,
        display_name: item.owner.display_name,
      },
      service: 'spotify' as const,
      is_public: item.public,
      external_url: item.external_urls?.spotify,
      synced_at: now,
      created_at: now,
      updated_at: now,
    }));
  });
}

export async function getSpotifyAlbums(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/albums?limit=50', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify albums');
  }

  return response.json();
}

export async function getMoreSpotifyAlbums(
  nextUrl: string,
  accessToken: string
) {
  const response = await fetch(nextUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get more Spotify albums');
  }

  return response.json();
}

export async function getAllSpotifyAlbums(
  userId: string,
  accessToken: string,
  onProgress?: (current: number, total: number) => void
) {
  let allAlbums = [];
  let nextUrl = null;
  let total = 0;
  let current = 0;

  // Get first page
  const firstPage = await getSpotifyAlbums(accessToken);
  allAlbums = [...firstPage.items];
  nextUrl = firstPage.next;
  total = firstPage.total;
  current = allAlbums.length;
  onProgress?.(current, total);

  // Get remaining pages
  while (nextUrl) {
    const nextPage = await getMoreSpotifyAlbums(nextUrl, accessToken);
    allAlbums = [...allAlbums, ...nextPage.items];
    nextUrl = nextPage.next;
    current = allAlbums.length;
    onProgress?.(current, total);
  }

  return allAlbums;
}

export async function getSpotifyAlbumDetails(
  userId: string,
  albumId: string,
  accessToken: string
) {
  return handleSpotifyRequest(accessToken, async (token) => {
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
      const error = new Error(`Failed to get Spotify album details: ${albumResponse.status}`);
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
  });
}

export async function getSpotifyPlaylistDetails(
  playlistId: string,
  accessToken: string
) {
  if (!playlistId) {
    throw new Error('Playlist ID is required');
  }

  return handleSpotifyRequest(accessToken, async (token) => {
    console.log('Fetching Spotify playlist:', playlistId);
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to fetch playlist details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data) {
      throw new Error('Empty response from Spotify API');
    }

    // Ensure tracks exist and have items
    if (!data.tracks?.items) {
      console.error('No tracks found in playlist:', data);
      throw new Error('No tracks found in playlist');
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      images: data.images,
      service: 'spotify' as const,
      tracks: {
        items: data.tracks.items
          .filter((item: any) => item?.track) // Filter out null tracks
          .map((item: any) => ({
            track: {
              id: item.track?.id,
              name: item.track?.name,
              artists: item.track?.artists?.map((artist: any) => ({
                id: artist.id,
                name: artist.name,
              })) || [],
              album: item.track?.album ? {
                id: item.track.album.id,
                name: item.track.album.name,
                images: item.track.album.images,
              } : null,
              duration_ms: item.track?.duration_ms,
              explicit: item.track?.explicit,
              preview_url: item.track?.preview_url,
            }
          })),
        total: data.tracks?.total || 0
      },
      owner: {
        id: data.owner?.id,
        display_name: data.owner?.display_name,
      },
      tracks_count: data.tracks?.total || 0,
      artwork: data.images?.[0] || null,
      external_url: data.external_urls?.spotify,
    };
  });
}
