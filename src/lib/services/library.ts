import { supabase } from '@/lib/supabase';
import type { ServiceType, UserAlbum, UserPlaylist } from '@/lib/types';

export async function getUserPlaylists(userId: string, service?: ServiceType) {
  let query = supabase
    .from('user_playlists')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (service) {
    query = query.eq('service', service);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as UserPlaylist[];
}

export async function getUserAlbums(userId: string, service?: ServiceType) {
  let query = supabase
    .from('user_albums')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (service) {
    query = query.eq('service', service);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as UserAlbum[];
}

export async function saveUserPlaylist(playlist: Omit<UserPlaylist, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('user_playlists')
    .upsert(
      {
        ...playlist,
        synced_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,service,playlist_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data as UserPlaylist;
}

export async function saveUserAlbum(album: Omit<UserAlbum, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('user_albums')
    .upsert(
      {
        ...album,
        synced_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,service,album_id',
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data as UserAlbum;
}

export async function removeUserPlaylist(userId: string, service: ServiceType, playlistId: string) {
  const { error } = await supabase
    .from('user_playlists')
    .delete()
    .match({
      user_id: userId,
      service,
      playlist_id: playlistId,
    });

  if (error) throw error;
}

export async function removeUserAlbum(userId: string, service: ServiceType, albumId: string) {
  const { error } = await supabase
    .from('user_albums')
    .delete()
    .match({
      user_id: userId,
      service,
      album_id: albumId,
    });

  if (error) throw error;
}

export async function batchSaveUserPlaylists(playlists: Omit<UserPlaylist, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('user_playlists')
    .upsert(
      playlists.map(playlist => ({
        ...playlist,
        synced_at: new Date().toISOString(),
      })),
      {
        onConflict: 'user_id,service,playlist_id',
      }
    )
    .select();

  if (error) throw error;
  return data as UserPlaylist[];
}

export async function batchSaveUserAlbums(albums: Omit<UserAlbum, 'id' | 'created_at' | 'updated_at'>[]) {
  const { data, error } = await supabase
    .from('user_albums')
    .upsert(
      albums.map(album => ({
        ...album,
        synced_at: new Date().toISOString(),
      })),
      {
        onConflict: 'user_id,service,album_id',
      }
    )
    .select();

  if (error) throw error;
  return data as UserAlbum[];
}
