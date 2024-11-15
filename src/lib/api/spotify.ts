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

const handleSpotifyRequest = async (
  accessToken: string,
  requestFn: (token: string) => Promise<any>
) => {
  try {
    return await requestFn(accessToken);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('The access token expired')
    ) {
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const newAuth = await refreshSpotifyToken(refreshToken);
        localStorage.setItem('spotify_access_token', newAuth.access_token);
        if (newAuth.refresh_token) {
          localStorage.setItem('spotify_refresh_token', newAuth.refresh_token);
        }
        return await requestFn(newAuth.access_token);
      } catch (refreshError) {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        throw new Error('Session expired. Please reconnect to Spotify.');
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
      throw new Error(errorData.error_description || 'Failed to refresh token');
    }

    const data = await response.json();
    return spotifyAuthSchema.parse(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to refresh Spotify token: ${error.message}`);
    }
    throw new Error('Failed to refresh Spotify token');
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
