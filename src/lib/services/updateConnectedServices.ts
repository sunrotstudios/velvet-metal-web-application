import { ServiceType } from '@/lib/types';
import { database } from './database';

export async function updateConnectedService(
  userId: string,
  service: ServiceType,
  data: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    serviceUserId?: string;
  }
) {
  return database.updateConnectedService(userId, service, {
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
    expires_at: data.expiresAt,
    service_user_id: data.serviceUserId
  });
}

export async function getConnectedServices(userId: string) {
  return database.getConnectedServices(userId);
}
