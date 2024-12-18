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

    // Save the authorization
    await saveServiceAuth(userId, 'apple-music', {
      accessToken: musicUserToken,
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
  console.log('Starting Apple Music unauthorized...', {
    userId,
    hasMusicKit: !!musicKit,
  });

  if (musicKit) {
    try {
      console.log('Calling MusicKit unauthorized...');
      await musicKit.unauthorize();
      console.log('MusicKit unauthorized successful');
      musicKit = null;

      console.log('Removing service auth from database...');
      await removeServiceAuth(userId, 'apple-music');
      console.log('Service auth removed successfully');
    } catch (error) {
      console.error('Failed to unauthorize Apple Music:', error);
      throw error;
    }
  } else {
    console.log('No MusicKit instance found, just removing service auth...');
    await removeServiceAuth(userId, 'apple-music');
    console.log('Service auth removed successfully');
  }
}

export function isAppleMusicAuthorized(): boolean {
  return musicKit?.isAuthorized ?? false;
}
