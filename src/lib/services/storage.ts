/* eslint-disable prefer-const */
import { supabase } from '@/lib/supabase';
import logger from '@/lib/logger';

export const storage = {
  async getItem(key: string) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to get item from storage:', error);
      return null;
    }
  },

  async setItem(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set item in storage:', error);
      throw error;
    }
  },

  async removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from storage:', error);
      throw error;
    }
  },

  async uploadFile(bucket: string, path: string, file: File) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) throw error;
    return this.getPublicUrl(bucket, path);
  },

  async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error) throw error;
    return data;
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  },

  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  },
};

export async function getStoredLibrary(userId: string, service: string) {
  try {
    logger.info('Fetching library from database for:', { userId, service });

    // Fetch albums with pagination
    let allAlbums: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMoreAlbums = true;

    while (hasMoreAlbums) {
      const { data: albums, error: albumsError } = await supabase
        .from('user_albums')
        .select('*')
        .eq('user_id', userId)
        .eq('service', service)
        .order('name')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (albumsError) {
        console.error('Error fetching albums:', albumsError);
        break;
      }

      if (!albums || albums.length === 0) {
        hasMoreAlbums = false;
      } else {
        allAlbums = [...allAlbums, ...albums];
        page++;
      }
    }

    // Fetch playlists with pagination
    let allPlaylists: any[] = [];
    page = 0;
    let hasMorePlaylists = true;

    while (hasMorePlaylists) {
      const { data: playlists, error: playlistsError } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', userId)
        .eq('service', service)
        .order('name')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (playlistsError) {
        console.error('Error fetching playlists:', playlistsError);
        break;
      }

      if (!playlists || playlists.length === 0) {
        hasMorePlaylists = false;
      } else {
        allPlaylists = [...allPlaylists, ...playlists];
        page++;
      }
    }

    return {
      albums: allAlbums,
      playlists: allPlaylists,
      lastSynced: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting stored library:', error);
    throw error;
  }
}
