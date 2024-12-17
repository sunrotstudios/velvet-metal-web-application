import { supabase } from '@/lib/supabase';
import { refreshSpotifyToken } from '@/lib/api/spotify';
import { ServiceType } from '@/lib/types';

const TOKEN_REFRESH_THRESHOLD = 5 * 60; // Refresh token if less than 5 minutes remaining

interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export async function getValidToken(userId: string, service: ServiceType): Promise<string> {
  // Get current token info from Supabase
  const { data, error } = await supabase
    .from('user_services')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', userId)
    .eq('service', service)
    .single();

  if (error || !data) {
    throw new Error(`No ${service} authentication found`);
  }

  const now = new Date();
  const expiresAt = data.token_expires_at ? new Date(data.token_expires_at) : undefined;
  
  // Check if token needs refresh
  if (expiresAt && shouldRefreshToken(expiresAt)) {
    if (!data.refresh_token) {
      throw new Error(`No refresh token available for ${service}`);
    }

    // Refresh the token
    if (service === 'spotify') {
      const newTokens = await refreshSpotifyToken(data.refresh_token);
      await saveNewTokens(userId, service, {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresAt: new Date(Date.now() + newTokens.expiresIn * 1000)
      });
      return newTokens.accessToken;
    }
    // Add other services here as needed
  }

  return data.access_token;
}

async function saveNewTokens(userId: string, service: ServiceType, tokens: TokenInfo) {
  const { error } = await supabase
    .from('user_services')
    .update({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_expires_at: tokens.expiresAt?.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('service', service);

  if (error) {
    throw new Error(`Failed to save new ${service} tokens`);
  }
}

function shouldRefreshToken(expiresAt: Date): boolean {
  const now = new Date();
  const secondsUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
  return secondsUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
}
