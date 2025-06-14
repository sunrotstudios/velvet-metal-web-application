import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/services/auth';
import { refreshSpotifyToken, getAllSpotifyAlbums, getSpotifyPlaylists } from '@/lib/services/spotify';
import { isTokenExpired } from '@/lib/auth';
import logger from '@/lib/logger';

// Configuration
const SYNC_INTERVALS = {
  DEFAULT: 1000 * 60 * 30, // 30 minutes
  MIN: 1000 * 60 * 5,      // 5 minutes
  MAX: 1000 * 60 * 60 * 24 // 24 hours
};

const MAX_RETRY_COUNT = 5;
const BACKOFF_MULTIPLIER = 2;

interface LibrarySyncStats {
  albums: {
    total: number;
    lastSyncCount: number;
    added: number;
    removed: number;
    updated: number;
  };
  playlists: {
    total: number;
    lastSyncCount: number;
    added: number;
    removed: number;
    updated: number;
  };
}

interface Album {
  album_id: string;
  [key: string]: any;
}

interface Playlist {
  playlist_id: string;
  [key: string]: any;
}

interface LibraryData {
  albums: Album[];
  playlists: Playlist[];
}

interface SpotifyPlaylist {
  playlist_id: string;
  name: string;
  description?: string;
  is_public?: boolean;
  tracks?: number;
  artwork?: {
    url: string | null;
  };
}

// Get the current stored library data for a user's service
async function getStoredLibrary(userId: string, service: ServiceType) {
  // Check that we're working with a valid authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user || session.user.id !== userId) {
    logger.error(`[getStoredLibrary] User authentication mismatch. Expected: ${userId}, Got: ${session?.user?.id}`);
    throw new Error('User authentication mismatch');
  }
  
  const { data: albums } = await supabase
    .from('user_albums')
    .select('*')
    .eq('user_id', userId)
    .eq('service', service);

  const { data: playlists } = await supabase
    .from('user_playlists')
    .select('*')
    .eq('user_id', userId)
    .eq('service', service);

  return {
    albums: albums || [],
    playlists: playlists || []
  };
}

// Get or create library sync record
async function getLibrarySync(userId: string, service: ServiceType) {
  // Check that we're working with a valid authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user || session.user.id !== userId) {
    logger.error(`[getLibrarySync] User authentication mismatch. Expected: ${userId}, Got: ${session?.user?.id}`);
    throw new Error('User authentication mismatch');
  }
  
  // Try to get existing record
  const { data: existing } = await supabase
    .from('library_syncs')
    .select('*')
    .eq('user_id', userId)
    .eq('service', service)
    .single();

  if (existing) {
    return existing;
  }

  // Create new record if it doesn't exist
  const { data: created, error } = await supabase
    .from('library_syncs')
    .upsert([{
      user_id: userId,
      service,
      sync_status: 'idle',
      last_sync_time: null,
      next_sync_time: new Date().toISOString(),
      error_count: 0,
      last_error: null,
      stats: {
        albums: { total: 0, lastSyncCount: 0, added: 0, removed: 0, updated: 0 },
        playlists: { total: 0, lastSyncCount: 0, added: 0, removed: 0, updated: 0 }
      }
    }], {
      onConflict: 'user_id,service'
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create library sync record:', error);
    throw error;
  }

  return created;
}

// Update library sync record
async function updateLibrarySync(
  userId: string,
  service: ServiceType,
  updates: Partial<{
    sync_status: 'idle' | 'syncing' | 'error';
    last_sync_time: string | null;
    next_sync_time: string;
    error_count: number;
    last_error: string | null;
    stats: any;
  }>
) {
  // Check that we're working with a valid authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user || session.user.id !== userId) {
    logger.error(`[updateLibrarySync] User authentication mismatch. Expected: ${userId}, Got: ${session?.user?.id}`);
    throw new Error('User authentication mismatch');
  }
  
  const { error } = await supabase
    .from('library_syncs')
    .update(updates)
    .eq('user_id', userId)
    .eq('service', service);

  if (error) {
    console.error('Failed to update library sync record:', error);
    throw error;
  }
}

// Calculate next sync time using exponential backoff
function calculateNextSyncTime(errorCount: number): Date {
  const baseDelay = SYNC_INTERVALS.DEFAULT;
  const backoffDelay = baseDelay * Math.pow(BACKOFF_MULTIPLIER, errorCount);
  const finalDelay = Math.min(Math.max(backoffDelay, SYNC_INTERVALS.MIN), SYNC_INTERVALS.MAX);
  
  return new Date(Date.now() + finalDelay);
}

// Compare old and new library data to calculate stats
function calculateSyncStats(
  oldData: LibraryData | null,
  newData: LibraryData,
  oldStats: LibrarySyncStats
): LibrarySyncStats {
  const stats: LibrarySyncStats = {
    albums: { ...oldStats.albums },
    playlists: { ...oldStats.playlists }
  };

  // Calculate album changes
  const oldAlbumIds = new Set(oldData?.albums.map(a => a.album_id) || []);
  const newAlbumIds = new Set(newData.albums.map(a => a.album_id));
  
  stats.albums = {
    total: newData.albums.length,
    lastSyncCount: oldData?.albums.length || 0,
    added: [...newAlbumIds].filter(id => !oldAlbumIds.has(id)).length,
    removed: [...oldAlbumIds].filter(id => !newAlbumIds.has(id)).length,
    updated: 0 // We'll implement change detection later
  };

  // Calculate playlist changes
  const oldPlaylistIds = new Set(oldData?.playlists.map(p => p.playlist_id) || []);
  const newPlaylistIds = new Set(newData.playlists.map(p => p.playlist_id));
  
  stats.playlists = {
    total: newData.playlists.length,
    lastSyncCount: oldData?.playlists.length || 0,
    added: [...newPlaylistIds].filter(id => !oldPlaylistIds.has(id)).length,
    removed: [...oldPlaylistIds].filter(id => !newPlaylistIds.has(id)).length,
    updated: 0 // We'll implement change detection later
  };

  return stats;
}

// Sync library with streaming service
async function syncLibrary(userId: string, service: ServiceType) {
  logger.info(`[syncLibrary] Starting ${service} library sync...`);
  const result: { albums: any[]; playlists: SpotifyPlaylist[] } = {
    albums: [],
    playlists: []
  };

  if (service === 'spotify') {
    // Get Spotify auth
    logger.info('[syncLibrary] Getting Spotify auth...');
    const { data: auth } = await supabase
      .from('user_services')
      .select('access_token')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (!auth?.access_token) {
      throw new Error('No Spotify access token found');
    }

    try {
      // Get user's saved albums with progress logging
      logger.info('[syncLibrary] Fetching Spotify albums...');
      const albums = await getAllSpotifyAlbums(userId, auth.access_token, (current, total) => {
        logger.info(`[syncLibrary] Fetched ${current}/${total} albums...`);
      });
      
      logger.info(`[syncLibrary] Found ${albums.length} albums, checking for new ones...`);
      
      // Get all existing albums with pagination
      let allExistingAlbums: { album_id: string }[] = [];
      let page = 0;
      const pageSize = 1000;
      
      while (true) {
        logger.info(`[syncLibrary] Fetching page ${page + 1} of existing albums...`);
        const { data: existingAlbums, error: existingError } = await supabase
          .from('user_albums')
          .select('album_id')
          .eq('user_id', userId)
          .eq('service', service)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (existingError) {
          console.error('[syncLibrary] Error fetching existing albums:', existingError);
          throw existingError;
        }

        if (!existingAlbums || existingAlbums.length === 0) {
          break;
        }

        allExistingAlbums = allExistingAlbums.concat(existingAlbums);
        
        if (existingAlbums.length < pageSize) {
          break;
        }
        
        page++;
      }

      logger.info(`[syncLibrary] Found ${allExistingAlbums.length} existing albums in database`);

      // Create a set of existing album IDs for faster lookup
      const existingAlbumIds = new Set(allExistingAlbums.map(a => a.album_id));
      
      // Debug logging of first few album IDs
      logger.info('[syncLibrary] First few existing album IDs:', 
        allExistingAlbums.slice(0, 3).map(a => a.album_id));
      logger.info('[syncLibrary] First few incoming album IDs:', 
        albums.slice(0, 3).map(a => a.album_id));
      
      // Filter out albums that already exist
      const newAlbums = albums.filter(album => !existingAlbumIds.has(album.album_id));
      
      logger.info(`[syncLibrary] Found ${newAlbums.length} new albums to add`);
      
      if (newAlbums.length > 0) {
        logger.info(`[syncLibrary] Storing ${newAlbums.length} new albums...`);
        
        // Insert albums in batches
        for (let i = 0; i < newAlbums.length; i += 50) {
          const batch = newAlbums.slice(i, i + 50);
          logger.info(`[syncLibrary] Processing batch ${i}-${i + batch.length}`);
          logger.info('[syncLibrary] First album in batch:', batch[0]);
          const batchData = batch.map(album => ({
            album_id: album.album_id,
            name: album.name,
            artist_name: album.artist_name,
            image_url: album.image_url,
            release_date: album.release_date,
            tracks: album.tracks,
            external_url: album.external_url,
            album_type: album.album_type,
            added_at: album.added_at,
            upc: album.upc,
            user_id: userId,
            service,
            synced_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          
          // Verify session before making database changes
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.user || currentSession.user.id !== userId) {
            logger.error(`[syncLibrary] Session invalid before album insert. Expected: ${userId}, Got: ${currentSession?.user?.id}`);
            throw new Error('Session expired or invalid');
          }
          
          const { error: insertError } = await supabase
            .from('user_albums')
            .upsert(batchData, {
              onConflict: 'user_id,service,album_id'
            });
            
          if (insertError) {
            logger.error('[syncLibrary] Error storing albums batch:', insertError);
            throw insertError;
          }
        }
        logger.info(`[syncLibrary] Successfully stored ${newAlbums.length} new albums`);
      } else {
        logger.info('[syncLibrary] No new albums to store');
      }

      // Store all albums in result
      result.albums = albums;

      // Get user's playlists
      logger.info('[syncLibrary] Fetching Spotify playlists...');
      const playlists = await getSpotifyPlaylists(auth.access_token, userId) as SpotifyPlaylist[];
      logger.info('[syncLibrary] First raw playlist from Spotify:', playlists[0]);
      logger.info(`[syncLibrary] Found ${playlists.length} playlists, checking for new ones...`);
      
      if (playlists?.length > 0) {
        // Get existing playlists with pagination
        let allExistingPlaylists: { playlist_id: string }[] = [];
        let page = 0;
        const pageSize = 1000;
        
        while (true) {
          logger.info(`[syncLibrary] Fetching page ${page + 1} of existing playlists...`);
          const { data: existingPlaylists, error: existingError } = await supabase
            .from('user_playlists')
            .select('playlist_id')
            .eq('user_id', userId)
            .eq('service', service)
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (existingError) {
            console.error('[syncLibrary] Error fetching existing playlists:', existingError);
            throw existingError;
          }

          if (!existingPlaylists || existingPlaylists.length === 0) {
            break;
          }

          allExistingPlaylists = allExistingPlaylists.concat(existingPlaylists);
          
          if (existingPlaylists.length < pageSize) {
            break;
          }
          
          page++;
        }

        logger.info(`[syncLibrary] Found ${allExistingPlaylists.length} existing playlists in database`);
        logger.info('[syncLibrary] First few existing playlist IDs:', allExistingPlaylists.slice(0, 3).map((p: { playlist_id: string }) => p.playlist_id));
        logger.info('[syncLibrary] First few incoming playlist IDs:', playlists.slice(0, 3).map((p: SpotifyPlaylist) => p.playlist_id));
        
        // Create a set of existing playlist IDs for faster lookup
        const existingPlaylistIds = new Set(allExistingPlaylists.map(p => p.playlist_id));
        
        // Filter out playlists that already exist
        const newPlaylists = playlists.filter((playlist: SpotifyPlaylist) => !existingPlaylistIds.has(playlist.playlist_id));
        
        if (newPlaylists.length > 0) {
          logger.info(`[syncLibrary] Storing ${newPlaylists.length} new playlists...`);
          
          // Insert in batches of 50
          for (let i = 0; i < newPlaylists.length; i += 50) {
            const batch = newPlaylists.slice(i, i + 50);
            logger.info(`[syncLibrary] Processing batch ${i}-${i + batch.length}`);
            logger.info('[syncLibrary] First playlist in batch:', batch[0]);
            const batchData = batch.map((playlist: SpotifyPlaylist) => ({
              user_id: userId,
              service,
              playlist_id: playlist.playlist_id,
              name: playlist.name,
              description: playlist.description || '',
              is_public: playlist.is_public || false,
              collaborative: false, // Not supported by Spotify API
              tracks: playlist.tracks || 0,
              artwork_url: playlist.artwork?.url || null,
              synced_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            // Verify session before making database changes
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession?.user || currentSession.user.id !== userId) {
              logger.error(`[syncLibrary] Session invalid before playlist insert. Expected: ${userId}, Got: ${currentSession?.user?.id}`);
              throw new Error('Session expired or invalid');
            }

            const { error: insertError } = await supabase
              .from('user_playlists')
              .upsert(batchData, { 
                onConflict: 'user_id,service,playlist_id',
                ignoreDuplicates: false
              });

            if (insertError) {
              console.error('[syncLibrary] Error storing playlists batch:', insertError);
              throw insertError;
            }
          }
          logger.info(`[syncLibrary] Successfully stored ${newPlaylists.length} new playlists`);
        } else {
          logger.info('[syncLibrary] No new playlists to store');
        }

        // Store all playlists in result
        result.playlists = playlists;
      }
    } catch (error) {
      console.error('[syncLibrary] Error during Spotify sync:', error);
      throw error;
    }
  }
  // Add other services here (Apple Music, etc.)

  logger.info('[syncLibrary] Sync completed successfully');
  return result;
}

// Main sync function with error handling and retry logic
async function performSync(userId: string, service: ServiceType, force: boolean = false) {
  logger.info(`Starting sync for ${service}...`);
  const syncRecord = await getLibrarySync(userId, service);
  
  // Check if sync is already in progress
  if (syncRecord?.sync_status === 'syncing' && !force) {
    // Check if it's a stale sync (stuck for more than 5 minutes)
    const lastSyncTime = new Date(syncRecord.last_sync_time);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (lastSyncTime < fiveMinutesAgo) {
      logger.info(`Found stale sync for ${service}, resetting...`);
      await updateLibrarySync(userId, service, {
        sync_status: 'idle',
        last_error: 'Previous sync was stale',
      });
    } else {
      logger.info(`Sync already in progress for ${service}`);
      return;
    }
  }

  try {
    logger.info(`Updating sync status to syncing for ${service}...`);
    // Update status to syncing
    await updateLibrarySync(userId, service, {
      sync_status: 'syncing',
      last_sync_time: new Date().toISOString()
    });

    // Get service auth
    logger.info(`Getting ${service} auth...`);
    const { data: auth } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (!auth) {
      throw new Error(`No ${service} authentication found`);
    }

    // Check if token needs refresh for Spotify
    if (service === 'spotify' && isTokenExpired(auth.expires_at)) {
      logger.info('Refreshing Spotify token...');
      const refreshedAuth = await refreshSpotifyToken(auth.refresh_token);
      if (!refreshedAuth) {
        throw new Error('Failed to refresh Spotify token');
      }
    }

    // Get current library data before sync
    logger.info(`Getting current library data for ${service}...`);
    const oldLibraryData = await getStoredLibrary(userId, service);

    // Perform the sync
    logger.info(`Syncing ${service} library...`);
    const newLibraryData = await syncLibrary(userId, service);

    // Calculate sync stats
    logger.info(`Calculating sync stats for ${service}...`);
    const newStats = calculateSyncStats(
      oldLibraryData,
      newLibraryData,
      syncRecord?.stats || {
        albums: { total: 0, lastSyncCount: 0, added: 0, removed: 0, updated: 0 },
        playlists: { total: 0, lastSyncCount: 0, added: 0, removed: 0, updated: 0 }
      }
    );

    // Update sync record with success
    logger.info(`Sync completed for ${service}. Updating sync record...`);
    
    // Update library_syncs table
    await updateLibrarySync(userId, service, {
      sync_status: 'idle',
      error_count: 0,
      last_error: null,
      next_sync_time: new Date(Date.now() + SYNC_INTERVALS.DEFAULT).toISOString(),
      stats: newStats
    });

    // Update synced_at in user_services table
    const now = new Date().toISOString();
    const { error: userServiceError } = await supabase
      .from('user_services')
      .update({ synced_at: now })
      .eq('user_id', userId)
      .eq('service', service);

    if (userServiceError) {
      console.error('Failed to update synced_at:', userServiceError);
    }

    logger.info(`${service} sync stats:`, {
      albums: {
        total: newStats.albums.total,
        added: newStats.albums.added,
        removed: newStats.albums.removed
      },
      playlists: {
        total: newStats.playlists.total,
        added: newStats.playlists.added,
        removed: newStats.playlists.removed
      }
    });

    return newLibraryData;

  } catch (error) {
    console.error(`Sync failed for ${service}:`, error);
    
    const newErrorCount = (syncRecord?.error_count || 0) + 1;
    const nextSyncTime = calculateNextSyncTime(newErrorCount);

    // Update both library_syncs and user_services tables to ensure UI state is reset
    await Promise.all([
      updateLibrarySync(userId, service, {
        sync_status: 'error',
        error_count: newErrorCount,
        last_error: error instanceof Error ? error.message : String(error),
        next_sync_time: nextSyncTime.toISOString()
      }),
      supabase
        .from('user_services')
        .update({ 
          sync_in_progress: false,
          synced_at: null 
        })
        .eq('user_id', userId)
        .eq('service', service)
    ]);

    // If we've exceeded max retries, we need manual intervention
    if (newErrorCount >= MAX_RETRY_COUNT) {
      console.error(`Max retries exceeded for ${service} sync. Manual intervention needed.`);
    }

    throw error;
  }
}

// Function to check and trigger sync for all services
export async function checkAndTriggerSync() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    const { data: services } = await supabase
      .from('user_services')
      .select('service')
      .eq('user_id', user.id);

    if (!services?.length) return;

    for (const { service } of services) {
      const syncRecord = await getLibrarySync(user.id, service as ServiceType);
      
      // Skip if next sync time hasn't been reached
      if (syncRecord?.next_sync_time && new Date(syncRecord.next_sync_time) > new Date()) {
        continue;
      }

      await performSync(user.id, service as ServiceType);
    }

  } catch (error) {
    console.error('Failed to check and trigger sync:', error);
  }
}

// Function to force sync for a specific service
export async function forceSyncLibrary(userId: string, service: ServiceType) {
  return performSync(userId, service, true);
}

// Set up automatic sync check
export function initializeAutoSync(checkInterval = SYNC_INTERVALS.DEFAULT) {
  // Initial check
  checkAndTriggerSync();

  // Set up periodic checks
  setInterval(checkAndTriggerSync, checkInterval);
}
