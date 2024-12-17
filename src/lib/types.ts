export type ServiceType = 'spotify' | 'apple-music';
export type ViewMode = 'grid' | 'list';

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
  user_id: string;
  service: ServiceType;
  playlist_id: string;
  name: string;
  description?: string;
  image_url?: string;
  tracks_count?: number;
  owner_id?: string;
  owner_name?: string;
  is_public: boolean;
  external_url?: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
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
  tracks_count?: number;
  external_url?: string;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

// THE FINAL ALBUM TYPE
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
  tracks_count: number;
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
  popularity?: number;
  copyrights?: string[];
  label?: string;
  artwork: {
    url: string;
    width?: number;
    height?: number;
  };
}

export interface Album {
  id: string;
  album?: {
    name: string;
    images?: { url: string }[];
    artists?: { name: string }[];
    release_date?: string;
    total_tracks?: number;
  };
  attributes?: {
    name: string;
    artwork?: { url: string };
    artistName?: string;
    releaseDate?: string;
    trackCount?: number;
  };
}

export interface Playlist {
  id: string;
  name?: string;
  images?: { url: string }[];
  attributes?: {
    name: string;
    artwork?: { url: string };
    trackCount?: number;
  };
  tracks?: {
    total?: number;
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
