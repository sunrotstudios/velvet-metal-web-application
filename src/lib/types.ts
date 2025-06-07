export type ServiceType = "spotify" | "apple-music" | "tidal" | "lastfm";
export type LibraryContentType = "albums" | "playlists";
export type ViewMode = "grid" | "list";

export interface ConnectedService {
  id: string;
  service: ServiceType;
  user_id: string;
  created_at: string;
  synced_at: string | null;
}

export interface UserAlbums {
  user: string; // Relation to users collection
  service: ServiceType;
  albums: Album[]; // Store the full album data
  lastSynced: Date;
}

export interface UserPlaylists {
  user: string; // Relation to users collection
  service: ServiceType;
  playlists: NormalizedPlaylist[]; // Store the full playlist data
  lastSynced: Date;
}

export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  artwork_url?: string;
  service_id: string;
  user_id: string;
  service: ServiceType;
  created_at: string;
  image_url: string;
  updated_at: string;
  tracks?: number;
}

export interface UserAlbum {
  id: string;
  user_id: string;
  service: ServiceType;
  album_id: string;
  name: string;
  artist_name: string;
  release_date?: string;
  image_url?: string;
  tracks?: number;  // Changed back to tracks from tracks_count
  external_url?: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
  album_type?: string;  // Added
  added_at?: string;    // Added
  upc?: string;         // Added
}

export interface NormalizedAlbum {
  id: string;
  name: string;
  artistName: string;
  artwork: {
    url: string;
    width?: number;
    height?: number;
  };
  releaseDate: string;
  trackCount: number;
  dateAdded?: string;
  sourceService: 'spotify' | 'apple-music';
  sourceId: string;
  albumType: 'album' | 'single' | 'ep';
  upc: string;
}

export interface NormalizedPlaylist {
  id: string;
  user_id: string;
  playlist_id: string;  // The platform-specific ID (e.g., Spotify's base62 ID)
  name: string;
  description?: string;
  artwork?: {
    url: string;
    height?: number | null;
    width?: number | null;
  };
  tracks: number;
  owner?: {
    id: string;
    display_name?: string;
  };
  service: 'spotify' | 'apple-music';
  is_public: boolean;
  external_url?: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface AlbumTrack {
  id: string;
  name: string;
  trackNumber: number;
  durationMs: number;
  artistName: string;
  previewUrl?: string;
}

export interface DetailedAlbum extends NormalizedAlbum {
  tracks: AlbumTrack[];
  totalTracks: number;
  genres: string[];
  copyrights: string[];
  label?: string;
  artwork: {
    url: string;
    width?: number;
    height?: number;
  };
}

export interface Album {
  service: any;
  id: string;
  name: string;
  artist_name: string;
  image_url: string;
  album_type?: string;
  tracks?: number;
  added_at?: string;
  artwork?: {
    url: string;
    width?: number | null;
    height?: number | null;
  };
  artistName?: string;
  releaseDate?: Date;
  externalUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  metadata: {
    platform: ServiceType;
    isPublic?: boolean;
    externalUrl?: string;
  };
  artwork?: {
    url: string;
    height?: number;
    width?: number;
  };
  tracks?: {
    total?: number;
  };
  owner?: {
    id: string;
    displayName: string;
  };
}

export interface Track {
  name: string;
  artist: string;
  album: string;
  isrc?: string;
}

export interface SyncProgress {
  phase: 'albums' | 'playlists' | 'complete';
  current: number;
  total: number;
  service: ServiceType;
}

export interface PlaylistMetadata {
  name: string;
  description: string;
}

export interface SearchResult {
  id: string;
  uri?: string;
  name: string;
  artist: string;
  isrc?: string;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export interface ServiceConnection {
  id: string;
  user_id: string;
  service: ServiceType;
  connected_at: string;
  synced_at: string | null;
  sync_in_progress: boolean;
  refresh_token?: string;
  access_token?: string;
  expires_at?: string;
}

export interface AppleAlbumSearchResult {
  id: string;
  name: string;
  artistName: string;
  artworkUrl?: string;
}