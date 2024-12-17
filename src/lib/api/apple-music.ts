import { z } from 'zod';

const APPLE_DEVELOPER_TOKEN =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZLVkRTNjc2NVMifQ.eyJpYXQiOjE3MzE0NTQ2OTEsImV4cCI6MTc0NzAwNjY5MSwiaXNzIjoiRFlXNEFHOTQ0MiJ9.Us6UP86UTEZJtCdyVLlOGGj-hw_pZ4lu4Pk-htEbolgWrph6P_toc9INvLhzVgVlD5ToyiD_m8CssZlPunUGHw';
const APPLE_TEAM_ID = 'DYW4AG9442';
const APPLE_KEY_ID = '6KVDS6765S';

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

export const initializeAppleMusic = async () => {
  if (!window.MusicKit) {
    throw new Error('MusicKit JS not loaded');
  }

  return await window.MusicKit.configure({
    developerToken: APPLE_DEVELOPER_TOKEN,
    app: {
      name: 'Velvet Metal',
      build: '1.0.0',
      teamId: APPLE_TEAM_ID,
      keyId: APPLE_KEY_ID,
    },
  });
};

export const authorizeAppleMusic = async (): Promise<AppleMusicAuth> => {
  try {
    const music = await initializeAppleMusic();
    const musicUserToken = await music.authorize();

    // Get the user token using the instance method
    const userToken = music.musicUserToken;

    if (!userToken || !musicUserToken) {
      throw new Error('Failed to get Apple Music tokens');
    }

    return {
      userToken,
      musicUserToken,
    };
  } catch (error) {
    console.error('Apple Music authorization error:', error);
    throw new Error('Failed to authorize Apple Music');
  }
};

export const getAppleMusicLibrary = async (musicUserToken: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/playlists',
    {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': musicUserToken,
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
            'Music-User-Token': musicUserToken,
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

export const getAppleMusicAlbums = async (musicUserToken: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/albums',
    {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': musicUserToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Apple Music albums');
  }

  return response.json();
};

export const getAllAppleMusicAlbums = async (musicUserToken: string) => {
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
          'Music-User-Token': musicUserToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Apple Music albums');
    }

    const data = await response.json();
    const albums = data.data || [];
    allAlbums = [...allAlbums, ...albums];

    // Check if there are more albums to fetch
    hasMore = albums.length === limit;
    offset += limit;
  }

  return {
    data: allAlbums,
  };
};
