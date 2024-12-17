// UserAlbums Collection
export interface UserAlbums {
  user: string; // Relation to users collection
  service: 'spotify' | 'apple-music';
  albums: any[]; // Store the full album data
  lastSynced: Date;
}

// UserPlaylists Collection
export interface UserPlaylists {
  user: string; // Relation to users collection
  service: 'spotify' | 'apple-music';
  playlists: any[]; // Store the full playlist data
  lastSynced: Date;
}

export interface TransferHistory {
  id?: string;
  user: string;
  sourceService: 'spotify' | 'apple-music';
  targetService: 'spotify' | 'apple-music';
  sourcePlaylistId: string;
  sourcePlaylistName: string;
  targetPlaylistId?: string;
  targetPlaylistName?: string;
  tracksTotal: number;
  tracksTransferred: number;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  startedAt: string;
  completedAt?: string;
}
