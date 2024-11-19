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
