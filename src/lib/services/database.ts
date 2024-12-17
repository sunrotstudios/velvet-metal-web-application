import { supabase } from '@/lib/supabase';

export interface DatabaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends DatabaseRecord {
  email: string;
  name: string;
  avatar?: string;
}

export interface ConnectedService extends DatabaseRecord {
  user_id: string;
  service_name: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  service_user_id?: string;
}

export interface Transfer extends DatabaseRecord {
  user_id: string;
  source_service: string;
  destination_service: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  metadata?: Record<string, any>;
}

export interface CustomPlaylist extends DatabaseRecord {
  user_id: string;
  name: string;
  description?: string;
  tracks: string[];
}

import { Album, Playlist } from '@/lib/types';

export const database = {
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async getConnectedServices(userId: string) {
    const { data, error } = await supabase
      .from('connected_services')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as ConnectedService[];
  },

  async updateConnectedService(userId: string, serviceName: string, updates: Partial<ConnectedService>) {
    const { data, error } = await supabase
      .from('connected_services')
      .upsert({
        user_id: userId,
        service_name: serviceName,
        ...updates
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as ConnectedService;
  },

  async getTransfers(userId: string) {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Transfer[];
  },

  async createTransfer(transfer: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transfers')
      .insert(transfer)
      .select()
      .single();
    
    if (error) throw error;
    return data as Transfer;
  },

  async updateTransfer(transferId: string, updates: Partial<Transfer>) {
    const { data, error } = await supabase
      .from('transfers')
      .update(updates)
      .eq('id', transferId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Transfer;
  },

  async getCustomPlaylists(userId: string) {
    const { data, error } = await supabase
      .from('custom_playlists')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as CustomPlaylist[];
  },

  async createCustomPlaylist(playlist: Omit<CustomPlaylist, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('custom_playlists')
      .insert(playlist)
      .select()
      .single();
    
    if (error) throw error;
    return data as CustomPlaylist;
  },

  async updateCustomPlaylist(playlistId: string, updates: Partial<CustomPlaylist>) {
    const { data, error } = await supabase
      .from('custom_playlists')
      .update(updates)
      .eq('id', playlistId)
      .select()
      .single();
    
    if (error) throw error;
    return data as CustomPlaylist;
  },

  async deleteCustomPlaylist(playlistId: string) {
    const { error } = await supabase
      .from('custom_playlists')
      .delete()
      .eq('id', playlistId);
    
    if (error) throw error;
  },

  async saveAlbums(userId: string, albums: Album[]) {
    console.log('Saving albums:', albums[0]); // Log first album for debugging

    const { error } = await supabase.from('user_albums').upsert(
      albums.map((album) => ({
        user_id: userId,
        service: album.sourceService,
        album_id: album.sourceId,
        name: album.name,
        artist_name: album.artistName,
        image_url: album.artwork.url,
        release_date: album.releaseDate,
        tracks_count: album.trackCount,
        external_url: album.metadata?.externalUrl,
        synced_at: new Date().toISOString(),
      }))
    );

    if (error) {
      console.error('Error saving albums:', error);
      throw error;
    }
  },

  async savePlaylists(userId: string, playlists: Playlist[]) {
    // Filter out null playlists and log the count
    const validPlaylists = playlists.filter(p => p !== null);
    console.log(`Saving ${validPlaylists.length} playlists out of ${playlists.length} total`);
    console.log('First playlist:', validPlaylists[0]);

    const { error } = await supabase.from('user_playlists').upsert(
      validPlaylists.map((playlist) => ({
        user_id: userId,
        service: playlist.metadata.platform,
        playlist_id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        image_url: playlist.artwork?.url,
        tracks_count: playlist.tracks?.total,
        owner_id: playlist.owner?.id,
        owner_name: playlist.owner?.displayName,
        is_public: playlist.metadata?.isPublic,
        external_url: playlist.metadata?.externalUrl,
        synced_at: new Date().toISOString(),
      }))
    );

    if (error) {
      console.error('Error saving playlists:', error);
      throw error;
    }
  },
};
