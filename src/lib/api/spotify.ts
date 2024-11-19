import { z } from 'zod';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export const spotifyAuthSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string(),
});

export type SpotifyAuth = z.infer<typeof spotifyAuthSchema>;

export const handleSpotifyRequest = async <T>(
  accessToken: string,
  requestFn: (token: string) => Promise<T>
): Promise<T> => {
  try {
    return await requestFn(accessToken);
  } catch (error) {
    const isTokenError =
      error instanceof Error &&
      (error.message.includes('token') ||
        error.message.includes('unauthorized') ||
        error.message.includes('401'));

    if (isTokenError) {
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (!refreshToken) {
        window.location.href = getSpotifyAuthUrl();
        throw new Error('Redirecting to Spotify authentication...');
      }

      try {
        const newAuth = await refreshSpotifyToken(refreshToken);
        // Retry the request with new token
        return await requestFn(newAuth.access_token);
      } catch (refreshError) {
        // If refresh failed and redirected, throw a friendly error
        if (
          refreshError instanceof Error &&
          refreshError.message.includes('Redirecting')
        ) {
          throw refreshError;
        }
        // For other errors, redirect to auth
        window.location.href = getSpotifyAuthUrl();
        throw new Error('Redirecting to Spotify authentication...');
      }
    }
    throw error;
  }
};

export const getSpotifyAuthUrl = () => {
  const scope = [
    'user-library-read',
    'playlist-read-private',
    'user-top-read',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'streaming',
  ].join(' ');

  const state = crypto.randomUUID();
  localStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope,
    state,
    show_dialog: 'true',
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const exchangeSpotifyCode = async (
  code: string
): Promise<SpotifyAuth> => {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Failed to exchange code');
    }

    const data = await response.json();
    return spotifyAuthSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Spotify authentication failed: ${error.message}`);
    }
    throw new Error('Spotify authentication failed');
  }
};

export const refreshSpotifyToken = async (
  refreshToken: string
): Promise<SpotifyAuth> => {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // If refresh token is invalid, we need to re-authenticate
      if (response.status === 400 && errorData.error === 'invalid_grant') {
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      throw new Error(errorData.error_description || 'Failed to refresh token');
    }

    const data = await response.json();
    const parsed = spotifyAuthSchema.parse(data);

    // Store the new tokens
    localStorage.setItem('spotify_access_token', parsed.access_token);
    if (parsed.refresh_token) {
      localStorage.setItem('spotify_refresh_token', parsed.refresh_token);
    }
    localStorage.setItem(
      'spotify_token_expires_at',
      String(Math.floor(Date.now() / 1000 + parsed.expires_in))
    );

    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_REFRESH_TOKEN') {
      // Handle invalid refresh token by redirecting to Spotify auth
      window.location.href = getSpotifyAuthUrl();
      throw new Error('Redirecting to Spotify authentication...');
    }
    throw error;
  }
};

export const getSpotifyPlaylists = async (accessToken: string) => {
  return handleSpotifyRequest(accessToken, async (token) => {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || 'Failed to fetch Spotify playlists'
      );
    }

    return response.json();
  });
};

export const getSpotifyAlbums = async (accessToken: string) => {
  return handleSpotifyRequest(accessToken, async (token) => {
    const response = await fetch(
      'https://api.spotify.com/v1/me/albums?limit=50',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || 'Failed to fetch Spotify albums'
      );
    }

    return response.json();
  });
};

export const getMoreSpotifyAlbums = async (
  nextUrl: string,
  accessToken: string
) => {
  return handleSpotifyRequest(accessToken, async (token) => {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || 'Failed to fetch more Spotify albums'
      );
    }

    return response.json();
  });
};

export const getAllSpotifyAlbums = async (
  userId: string,
  accessToken: string,
  onProgress?: (current: number, total: number) => void
) => {
  console.log('Fetching all Spotify albums for user:', userId);
  let allAlbums = [];
  let nextUrl = null;
  let total = 0;

  try {
    // Get First Batch of Albums
    const initialResponse = await getSpotifyAlbums(accessToken);
    total = initialResponse.total;
    allAlbums = [...initialResponse.items];
    nextUrl = initialResponse.next;
    onProgress?.(allAlbums.length, total);

    console.log(`Initial fetch: ${allAlbums.length} albums`);

    // Keep Fetching While There Are More Albums
    while (nextUrl) {
      console.log('Fetching Next Batch of Albums...');
      const moreAlbums = await getMoreSpotifyAlbums(nextUrl, accessToken);
      allAlbums = [...allAlbums, ...moreAlbums.items];
      nextUrl = moreAlbums.next;
      console.log(`Total albums fetched: ${allAlbums.length}`);
    }

    return allAlbums;
  } catch (error) {
    console.error('Error fetching all Spotify albums:', error);
    throw error;
  }
};

export const getSpotifyAlbumDetails = async (
  albumId: string,
  accessToken: string
) => {
  console.log('Fetching album details for ID:', albumId);

  if (!albumId) {
    throw new Error('Album ID is required');
  }

  return handleSpotifyRequest(accessToken, async (token) => {
    const url = `https://api.spotify.com/v1/albums/${albumId}`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify API error:', errorData);
      throw new Error(
        errorData.error?.message ||
          `Failed to fetch album details (${response.status})`
      );
    }

    const data = await response.json();
    console.log('Received album data:', data);

    return {
      id: data.id,
      sourceId: data.id,
      sourceService: 'spotify' as const,
      name: data.name,
      artistName: data.artists[0].name,
      artwork: {
        url: data.images[0]?.url || '',
        width: data.images[0]?.width || null,
        height: data.images[0]?.height || null,
      },
      releaseDate: data.release_date,
      tracks: data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        trackNumber: track.track_number,
        durationMs: track.duration_ms,
        artistName: track.artists[0].name,
        previewUrl: track.preview_url,
      })),
      totalTracks: data.total_tracks,
      genres: data.genres,
      popularity: data.popularity,
      copyrights: data.copyrights?.map((c: any) => c.text),
      label: data.label,
    };
  });
};
