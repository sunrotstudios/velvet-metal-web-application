export interface CustomPlaylist {
  id: string;
  name: string;
  description?: string;
  artwork?: string;
  tracks: CustomTrack[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  artwork?: string;
  sourceId: string;
  sourceService: string;
}
