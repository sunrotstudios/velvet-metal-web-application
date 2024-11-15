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

  return response.json();
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
