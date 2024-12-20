import {
  getAllAppleMusicAlbums,
  getAppleMusicLibrary,
} from '@/lib/api/apple-music';
import { getAllSpotifyAlbums, getSpotifyPlaylists } from '@/lib/api/spotify';
import { ServiceType, SyncProgress } from '@/lib/types';
import { database } from './database';
import { normalizeAlbumData, normalizePlaylistData } from './normalizers';
import { getStoredLibrary, storage } from './storage';
import { getServiceAuth } from './streaming-auth';

export async function syncLibrary(
  userId: string,
  service: ServiceType,
  onProgress?: (progress: SyncProgress) => void
) {
  const auth = await getServiceAuth(userId, service);
  if (!auth) throw new Error(`No ${service} authentication found`);

  try {
    // Start album sync
    onProgress?.({
      total: 100,
      current: 0,
      phase: 'albums',
      service,
    });

    const albums =
      service === 'spotify'
        ? { items: await getAllSpotifyAlbums(userId, auth.accessToken) }
        : await getAllAppleMusicAlbums(auth.musicUserToken || '');

    // Update progress after albums are fetched
    onProgress?.({
      total: 100,
      current: 25,
      phase: 'albums',
      service,
    });

    // Start normalizing albums
    const normalizedAlbums = albums.items.map((album) =>
      normalizeAlbumData(album, service)
    );

    // Save albums to database
    await database.saveAlbums(userId, normalizedAlbums);

    onProgress?.({
      total: 100,
      current: 50,
      phase: 'playlists',
      service,
    });

    const playlists =
      service === 'spotify'
        ? await getSpotifyPlaylists(auth.accessToken)
        : await getAppleMusicLibrary(auth.musicUserToken || '');

    console.log(`Fetched ${playlists.items.length} playlists for ${service}`);

    // Update progress after playlists are fetched
    onProgress?.({
      total: 100,
      current: 75,
      phase: 'playlists',
      service,
    });

    const normalizedPlaylists = playlists.items
      .map((playlist) => normalizePlaylistData(playlist, service))
      .filter((p) => p !== null); // Filter out null playlists

    console.log(
      `Normalized ${normalizedPlaylists.length} playlists for ${service}`
    );

    // Save to database
    console.log('Saving to database...');
    await database.savePlaylists(userId, normalizedPlaylists);

    // Save to storage for offline access
    console.log('Saving to storage...');
    await syncLibraryToStorage(userId, service, {
      albums: normalizedAlbums,
      playlists: normalizedPlaylists,
      lastSynced: new Date().toISOString(),
    });

    // Complete sync
    onProgress?.({
      total: 100,
      current: 100,
      phase: 'complete',
      service,
    });

    return {
      albums: normalizedAlbums,
      playlists: normalizedPlaylists,
      lastSynced: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to sync ${service} library:`, error);
    throw error;
  }
}

async function syncLibraryToStorage(
  userId: string,
  service: ServiceType,
  libraryData: any
) {
  await storage.setItem(`library_${service}_${userId}`, libraryData);
}

export { getStoredLibrary };
