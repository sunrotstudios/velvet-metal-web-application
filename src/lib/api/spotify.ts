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
      return spotifyAuthSchema.parse(data);
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
  console.log('Refreshing Spotify token with refresh token:', refreshToken);
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Missing Spotify environment variables');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  console.log('Making refresh token request with params:', params.toString());
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

  console.log('Refresh token response status:', response.status);
  const responseText = await response.text();
  console.log('Refresh token response:', responseText);

  if (!response.ok) {
    throw new Error(`Failed to refresh Spotify token: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  return spotifyAuthSchema.parse(data);
}

export async function getSpotifyPlaylists(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify playlists');
  }

  return response.json();
}

export async function getSpotifyAlbums(accessToken: string) {
  const response = await fetch(
    'https://api.spotify.com/v1/me/albums?limit=50',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

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
  albumId: string,
  accessToken: string
) {
  const [albumResponse, tracksResponse] = await Promise.all([
    fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
    fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  ]);

  if (!albumResponse.ok || !tracksResponse.ok) {
    throw new Error('Failed to get Spotify album details');
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
    images: album.images,
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
}
