import { supabase } from '@/lib/supabase';
import { Album, LibraryContentType, ServiceType, UserPlaylist } from '@/lib/types';
import logger from '@/lib/logger';

export interface LibraryData {
  albums: Album[];
  playlists: UserPlaylist[];
  lastSynced: string | null;
}

export interface PaginatedPlaylistResult {
  playlists: UserPlaylist[];
  totalPlaylists: number;
  hasMore: boolean;
}

export interface PaginatedLibraryOptions {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedLibraryResult {
  albums: Album[];
  playlists?: UserPlaylist[];
  totalAlbums: number;
  totalPlaylists?: number;
  hasMore: boolean;
}

export async function getStoredLibrary(userId: string, service: ServiceType): Promise<LibraryData> {
  try {
    logger.info('Fetching library from database for:', { userId, service });
    // Fetch albums with pagination
    let allAlbums: Album[] = [];
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
    let allPlaylists: UserPlaylist[] = [];
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

    // Get last sync time
    const { data: serviceData, error: serviceError } = await supabase
      .from('user_services')
      .select('synced_at')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (serviceError && serviceError.code !== 'PGRST116') throw serviceError;

    return {
      albums: allAlbums,
      playlists: allPlaylists,
      lastSynced: serviceData?.synced_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting stored library:', error);
    throw error;
  }
}

export async function getPaginatedLibrary(
  userId: string, 
  service: ServiceType,
  contentType: LibraryContentType = 'albums',
  options: PaginatedLibraryOptions = {}
): Promise<PaginatedLibraryResult> {
  try {
    const {
      limit = 50,
      offset = 0,
      sortField = 'name',
      sortDirection = 'asc',
      search = '',
    } = options;

    // Determine which table to query based on contentType
    const tableName = contentType === 'albums' ? 'user_albums' : 'user_playlists';

    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('service', service);

    // Apply search filter on the server side if specified
    if (search) {
      if (contentType === 'albums') {
        query = query.or(`name.ilike.%${search}%,artist_name.ilike.%${search}%`);
      } else {
        // For playlists, just search the name field
        query = query.ilike('name', `%${search}%`);
      }
    }

    // Apply sorting
    query = query.order(sortField, { ascending: sortDirection === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    if (contentType === 'albums') {
      return {
        albums: data || [],
        totalAlbums: count || 0,
        hasMore: count ? offset + limit < count : false,
      };
    } else {
      return {
        albums: [],
        playlists: data || [],
        totalAlbums: 0,
        totalPlaylists: count || 0,
        hasMore: count ? offset + limit < count : false,
      };
    }
  } catch (error) {
    console.error('Error getting paginated library:', error);
    throw error;
  }
}

export async function syncSpotifyLibrary(userId: string): Promise<void> {
  try {
    // Get the user's Spotify access token
    const { data: authData, error: authError } = await supabase
      .from('user_services')
      .select('access_token')
      .eq('user_id', userId)
      .eq('service', 'spotify')
      .single();
    
    if (authError) throw authError;
    if (!authData?.access_token) {
      throw new Error('No Spotify access token found');
    }

    // Call the client-side sync function
    const { error } = await supabase.functions.invoke('sync-spotify-library', {
      body: { userId, accessToken: authData.access_token },
    });

    if (error) {
      console.error('Failed to sync Spotify library:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in syncSpotifyLibrary:', error);
    throw error;
  }
}

export async function syncAppleMusicLibrary(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('sync-apple-music-library', {
    body: { userId },
  });
  
  if (error) throw error;
}