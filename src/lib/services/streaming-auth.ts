// COMPATIBILITY WRAPPER
// This file is deprecated and will be removed in a future update.
// Please use @/lib/services/auth instead.
// 
// Related files that have been refactored:
// - streaming-auth.ts -> moved to auth.ts
// - apple-music-library.ts -> moved to ./apple-music
// - spotify-library.ts -> moved to ./spotify
// - streaming-library-sync.ts -> moved to respective service modules

import {
  saveServiceAuth as save,
  getServiceAuth as get,
  removeServiceAuth as remove,
  getUserServices as getServices,
  isServiceConnected as isConnected,
  ServiceType,
} from '@/lib/services/auth';

// Re-export for compatibility with existing code
export type { ServiceType };

export const saveServiceAuth = save;
export const getServiceAuth = get;
export const removeServiceAuth = remove;
export const getUserServices = getServices;
export const isServiceConnected = isConnected;
