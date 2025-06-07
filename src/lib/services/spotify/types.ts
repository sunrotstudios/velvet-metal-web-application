import { ServiceType } from '@/lib/types';

/**
 * Type definition for Spotify Album API response
 * Based on https://developer.spotify.com/documentation/web-api/reference/get-an-album
 */
export interface SpotifyAlbumResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyAlbumItem[];
}

export interface SpotifyAlbumItem {
  added_at: string;
  album: SpotifyAlbum;
}

export interface SpotifyAlbum {
  album_type: 'album' | 'single' | 'compilation';
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  restrictions?: {
    reason: string;
  };
  type: 'album';
  uri: string;
  artists: SpotifyArtist[];
  tracks?: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrack[];
  };
  copyrights?: SpotifyCopyright[];
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  genres: string[];
  label?: string;
  popularity: number;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: 'artist';
  uri: string;
}

export interface SpotifyTrack {
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable: boolean;
  linked_from?: {
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  restrictions?: {
    reason: string;
  };
  name: string;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

export interface SpotifyCopyright {
  text: string;
  type: string;
}

/**
 * Type definition for normalized albums that will be stored in the database
 */
export interface DbUserAlbum {
  id?: string;
  user_id: string;
  service: ServiceType;
  album_id: string;
  name: string;
  artist_name: string;
  image_url: string | null;
  release_date: string | null;
  tracks: number | null;
  external_url: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
  album_type: 'album' | 'single' | 'ep';
  added_at: string | null;
  upc: string | null;
}