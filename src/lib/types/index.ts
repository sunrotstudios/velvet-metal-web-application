export type ServiceType = 'spotify' | 'apple-music';

export type ViewMode = 'grid' | 'list';

export interface DetailedAlbum {
  id: string;
  name: string;
  artistName: string;
  artwork: string;
  releaseDate: string;
  trackCount: number;
  genres: string[];
  tracks: Track[];
  sourceService: ServiceType;
  sourceId: string;
  metadata: Record<string, any>;
}

export interface DetailedPlaylist {
  id: string;
  name: string;
  description?: string;
  artwork?: string;
  tracks: PlaylistTrack[];
  owner: {
    id: string;
    name: string;
  };
  sourceService: ServiceType;
  sourceId: string;
  metadata: Record<string, any>;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  artwork?: string;
}

export interface PlaylistTrack extends Track {
  addedAt?: string;
  addedBy?: {
    id: string;
    name: string;
  };
}

export type SyncProgress = {
  phase: 'albums' | 'playlists' | 'complete';
  total: number;
  current: number;
  message?: string;
};

export * from './custom-playlist';
