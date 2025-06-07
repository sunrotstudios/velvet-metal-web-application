import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';

export type ServiceType = 'spotify' | 'apple-music' | 'lastfm' | 'tidal';

interface ServiceTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  musicUserToken?: string; // For Apple Music
}

export async function saveServiceAuth(
  userId: string,
  service: ServiceType,
  tokens: ServiceTokens
) {
  try {
    logger.info({
      msg: 'Saving service auth...',
      context: {
        userId,
        service,
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        hasMusicUserToken: !!tokens.musicUserToken
      }
    });

    // Use upsert to handle both insert and update
    const { error } = await supabase.from('user_services').upsert(
      {
        user_id: userId,
        service,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt?.toISOString(),
        music_user_token: tokens.musicUserToken, // Add music user token
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,service',
      }
    );

    if (error) {
      logger.error({
        msg: 'Error saving service auth',
        context: {
          userId,
          service,
          error: error.message,
          code: error.code
        }
      });
      throw error;
    }

    logger.info({
      msg: 'Service auth saved successfully',
      context: {
        userId,
        service,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error({
      msg: 'Failed to save service auth',
      context: {
        userId,
        service,
        error: error instanceof Error ? error.message : String(error)
      }
    });
    throw error;
  }
}

export async function getServiceAuth(
  userId: string,
  service: ServiceType
): Promise<ServiceTokens | null> {
  try {
    const { data, error } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (error) {
      console.error('Error getting service auth:', error);
      return null;
    }

    if (!data) {
      logger.info(`No ${service} auth found for user ${userId}`);
      return null;
    }

    // For Apple Music, we need both the developer token and music_user_token
    if (service === 'apple-music') {
      const musicUserToken = data.music_user_token;

      if (!musicUserToken) {
        console.error(`Missing Apple Music user token for user ${userId}`);
        return null;
      }

      return {
        accessToken: data.access_token || '', // Use stored access token if available
        musicUserToken: musicUserToken,
        refreshToken: data.refresh_token || null,
        expiresAt: data.expires_at
          ? new Date(data.expires_at)
          : undefined,
      };
    }

    // For other services
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at
        ? new Date(data.expires_at)
        : undefined,
      musicUserToken: data.music_user_token,
    };
  } catch (error) {
    console.error('Failed to get service auth:', error);
    return null;
  }
}

export async function removeServiceAuth(userId: string, service: ServiceType) {
  try {
    logger.info('Removing service auth and associated data...', {
      userId,
      service,
    });

    // Delete albums
    const { error: albumsError } = await supabase
      .from('user_albums')
      .delete()
      .eq('user_id', userId)
      .eq('service', service);

    if (albumsError) {
      console.error('Error removing albums:', albumsError);
      throw albumsError;
    }

    // Delete playlists
    const { error: playlistsError } = await supabase
      .from('user_playlists')
      .delete()
      .eq('user_id', userId)
      .eq('service', service);

    if (playlistsError) {
      console.error('Error removing playlists:', playlistsError);
      throw playlistsError;
    }

    // Delete service auth
    const { error: authError } = await supabase
      .from('user_services')
      .delete()
      .eq('user_id', userId)
      .eq('service', service);

    if (authError) {
      console.error('Error removing service auth:', authError);
      throw authError;
    }

    logger.info('Service data removed successfully');
  } catch (error) {
    console.error('Failed to remove service data:', error);
    throw error;
  }
}

export async function getUserServices(userId: string): Promise<ServiceType[]> {
  try {
    const { data, error } = await supabase
      .from('user_services')
      .select('service')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user services:', error);
      throw error;
    }

    return data.map((row) => row.service as ServiceType);
  } catch (error) {
    console.error('Failed to get user services:', error);
    throw error;
  }
}

export async function isServiceConnected(
  userId: string,
  service: ServiceType
): Promise<boolean> {
  try {
    logger.info('Checking service connection...', { userId, service });

    const { data, error } = await supabase
      .from('user_services')
      .select('id')
      .eq('user_id', userId)
      .eq('service', service)
      .maybeSingle();

    if (error) {
      console.error('Error checking service connection:', error);
      throw error;
    }

    const isConnected = !!data;
    logger.info('Service connection status:', isConnected);
    return isConnected;
  } catch (error) {
    console.error('Failed to check service connection:', error);
    throw error;
  }
}