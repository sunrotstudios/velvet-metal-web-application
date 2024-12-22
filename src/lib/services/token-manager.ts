import { ServiceType, getServiceAuth, saveServiceAuth } from './streaming-auth';
import { supabase } from '@/lib/supabase';

interface TokenRefreshers {
  [key: string]: (refreshToken: string) => Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;
}

const tokenRefreshers: TokenRefreshers = {
  spotify: async (refreshToken: string) => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(
          `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${
            import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
          }`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to refresh Spotify token');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Spotify might not always return a new refresh token
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  },
  // Apple Music tokens are handled differently - they're generated client-side
  'apple-music': async () => {
    throw new Error('Apple Music tokens should be refreshed client-side');
  },
};

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  private getRefreshKey(userId: string, service: ServiceType): string {
    return `${userId}:${service}`;
  }

  public async refreshTokenIfNeeded(
    userId: string,
    service: ServiceType
  ): Promise<void> {
    const refreshKey = this.getRefreshKey(userId, service);

    // If already refreshing, wait for that promise
    if (this.refreshPromises.has(refreshKey)) {
      await this.refreshPromises.get(refreshKey);
      return;
    }

    const tokens = await getServiceAuth(userId, service);
    if (!tokens) return;

    const expiresAt = tokens.expiresAt;
    if (!expiresAt) return;

    // Add 5 minute buffer before expiration
    const shouldRefresh = new Date(expiresAt).getTime() - 5 * 60 * 1000 < Date.now();
    
    if (!shouldRefresh) return;

    // Start refresh process
    const refreshPromise = this.refreshToken(userId, service, tokens.refreshToken);
    this.refreshPromises.set(refreshKey, refreshPromise);

    try {
      await refreshPromise;
    } finally {
      this.refreshPromises.delete(refreshKey);
    }
  }

  private async refreshToken(
    userId: string,
    service: ServiceType,
    refreshToken?: string
  ): Promise<void> {
    if (!refreshToken || !tokenRefreshers[service]) {
      return;
    }

    try {
      const newTokens = await tokenRefreshers[service](refreshToken);
      await saveServiceAuth(userId, service, {
        ...newTokens,
        musicUserToken: (await getServiceAuth(userId, service))?.musicUserToken,
      });
    } catch (error) {
      console.error(`Failed to refresh ${service} token:`, error);
      throw error;
    }
  }
}

export const tokenManager = TokenManager.getInstance();
