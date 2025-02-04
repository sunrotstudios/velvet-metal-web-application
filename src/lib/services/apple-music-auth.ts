import { toast } from 'sonner';
import { syncAppleMusicLibrary } from './apple-music-library';
import { removeServiceAuth, saveServiceAuth } from './streaming-auth';

declare global {
  interface Window {
    MusicKit: any;
  }
}

let musicKit: any = null;

export async function initializeAppleMusic() {
  if (!musicKit) {
    try {
      console.log('Loading MusicKit.js...');
      await loadMusicKitScript();

      if (!window.MusicKit) {
        throw new Error('MusicKit not found on window object');
      }

      console.log('Configuring MusicKit...');
      const developerToken = import.meta.env.VITE_APPLE_DEVELOPER_TOKEN;

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
      accessToken: import.meta.env.VITE_APPLE_DEVELOPER_TOKEN || '',
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
