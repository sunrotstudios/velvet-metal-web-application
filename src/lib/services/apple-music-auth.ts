// COMPATIBILITY WRAPPER
// This file is deprecated and will be removed in a future update.
// Please use @/lib/services/apple-music instead.
// 
// Related files that have been refactored:
// - apple-music-auth.ts -> moved to ./apple-music/index.ts
// - apple-music-library.ts -> moved to ./apple-music/index.ts
// - All Apple Music related functionality is now in the apple-music directory

import { 
  initializeAppleMusic as initialize,
  authorizeAppleMusic as authorize,
  unauthorizeAppleMusic as unauthorize,
  isAppleMusicAuthorized as isAuthorized
} from '@/lib/services/apple-music';

export const initializeAppleMusic = initialize;
export const authorizeAppleMusic = authorize;
export const unauthorizeAppleMusic = unauthorize;
export const isAppleMusicAuthorized = isAuthorized;
