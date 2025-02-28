// Authentication Services
export * from './auth';

// Spotify Services
export * as Spotify from './spotify';

// Apple Music Services
export * as AppleMusic from './apple-music';

// Legacy exports (for backward compatibility)
export * from './normalizers';
export * from './storage';
export * from './sync';

// These files have been deleted and their functionality moved to consolidated modules:
// - apple-music-library.ts -> moved to ./apple-music
// - spotify-library.ts -> moved to ./spotify
// - streaming-library-sync.ts -> functionality in both service modules

// Re-export shared types
export type { ServiceType } from './auth';
