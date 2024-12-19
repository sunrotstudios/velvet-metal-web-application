import { supabase } from '@/lib/supabase';

export type ServiceType = 'spotify' | 'apple-music' | 'lastfm';

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
    console.log('Saving service auth...', { userId, service });

    // Use upsert to handle both insert and update
    const { error } = await supabase.from('user_services').upsert(
      {
        user_id: userId,
        service,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expires_at: tokens.expiresAt?.toISOString(),
        music_user_token: tokens.musicUserToken, // Add music user token
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,service',
      }
    );

    if (error) {
      console.error('Error saving service auth:', error);
      throw error;
    }

    console.log('Service auth saved successfully');
  } catch (error) {
    console.error('Failed to save service auth:', error);
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
      console.log(`No ${service} auth found for user ${userId}`);
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
        expiresAt: data.token_expires_at ? new Date(data.token_expires_at) : undefined,
      };
    }

    // For other services
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.token_expires_at
        ? new Date(data.token_expires_at)
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
    console.log('Removing service auth...', { userId, service });

    const { error } = await supabase
      .from('user_services')
      .delete()
      .eq('user_id', userId)
      .eq('service', service);

    if (error) {
      console.error('Error removing service auth:', error);
      throw error;
    }

    console.log('Service auth removed successfully');
  } catch (error) {
    console.error('Failed to remove service auth:', error);
    throw error;
  }
}

export async function getUserServices(userId: string): Promise<ServiceType[]> {
  try {
    console.log('Getting user services...', { userId });

    const { data, error } = await supabase
      .from('user_services')
      .select('service')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user services:', error);
      throw error;
    }

    console.log('User services retrieved successfully:', data);
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
    console.log('Checking service connection...', { userId, service });

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
    console.log('Service connection status:', isConnected);
    return isConnected;
  } catch (error) {
    console.error('Failed to check service connection:', error);
    throw error;
  }
}
