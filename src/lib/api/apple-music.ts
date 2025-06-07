// COMPATIBILITY WRAPPER
// This file is deprecated and will be removed in a future update.
// Please use @/lib/services/apple-music instead.
// 
// All Apple Music API functionality has been moved to the consolidated
// module at @/lib/services/apple-music. This file now just re-exports
// from that module for backward compatibility.

import * as AppleMusic from '@/lib/services/apple-music';

// Re-export everything from the new module
export const APPLE_DEVELOPER_TOKEN = AppleMusic.APPLE_DEVELOPER_TOKEN;
export const appleMusicAuthSchema = AppleMusic.appleMusicAuthSchema;
export type { AppleMusicAuth } from '@/lib/services/apple-music';
export type { SearchResult } from '@/lib/services/apple-music';
export type { DetailedPlaylist } from '@/lib/services/apple-music';
export type { DetailedAlbum } from '@/lib/services/apple-music';

export const initializeAppleMusic = AppleMusic.initializeAppleMusic;
export const authorizeAppleMusic = AppleMusic.authorizeAppleMusic;
export const getAppleMusicLibrary = AppleMusic.getAppleMusicLibrary;
export const getAppleMusicAlbums = AppleMusic.getAppleMusicAlbums;
export const getAllAppleMusicAlbums = AppleMusic.getAllAppleMusicAlbums;
export const getAppleMusicPlaylistDetails = AppleMusic.getAppleMusicPlaylistDetails;
export const getAppleMusicAlbumDetails = AppleMusic.getAppleMusicAlbumDetails;
export const addAlbumsToAppleMusicLibrary = AppleMusic.addAlbumsToAppleMusicLibrary;
export const addAppleMusicAlbumToLibrary = AppleMusic.addAppleMusicAlbumToLibrary;
export const searchAppleMusicAlbum = AppleMusic.searchAppleMusicAlbum;
export const searchAppleMusicCatalog = AppleMusic.searchAppleMusicCatalog;
export const checkAlbumsInLibrary = AppleMusic.checkAlbumsInLibrary;
export const findAlbumsByUPC = AppleMusic.findAlbumsByUPC;
export const findBestMatchingAlbum = AppleMusic.findBestMatchingAlbum;
export const getAppleMusicPlaylists = AppleMusic.getAppleMusicPlaylists;
