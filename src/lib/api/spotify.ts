// COMPATIBILITY WRAPPER
// This file is deprecated and will be removed in a future update.
// Please use @/lib/services/spotify instead.
// 
// All Spotify API functionality has been moved to the consolidated
// module at @/lib/services/spotify. This file now just re-exports
// from that module for backward compatibility.

import * as Spotify from '@/lib/services/spotify';

// Re-export everything from the new module
export type { SpotifyAuth } from '@/lib/services/spotify';
export const getSpotifyAuthUrl = Spotify.getSpotifyAuthUrl;
export const getSpotifyToken = Spotify.getSpotifyToken;
export const refreshSpotifyToken = Spotify.refreshSpotifyToken;
export const getSpotifyPlaylists = Spotify.getSpotifyPlaylists;
export const getSpotifyAlbums = Spotify.getSpotifyAlbums;
export const getMoreSpotifyAlbums = Spotify.getMoreSpotifyAlbums;
export const getAllSpotifyAlbums = Spotify.getAllSpotifyAlbums;
export const getSpotifyAlbumDetails = Spotify.getSpotifyAlbumDetails;
export const getSpotifyPlaylistDetails = Spotify.getSpotifyPlaylistDetails;
export const searchSpotifyAlbum = Spotify.searchSpotifyAlbum;
export const addSpotifyAlbumToLibrary = Spotify.addSpotifyAlbumToLibrary;
