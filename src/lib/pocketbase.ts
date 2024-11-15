import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090'); // Replace with your PocketBase URL

export type AuthModel = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created: string;
  updated: string;
  connectedServices?: Array<{
    id: string;
    name: string;
    connected: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number | null;
  }>;
};

export const getCurrentUser = () => {
  return pb.authStore.model as AuthModel | null;
};

export default pb;
