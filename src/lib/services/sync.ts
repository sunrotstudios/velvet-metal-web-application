import {
  getAllAppleMusicAlbums,
  getAppleMusicLibrary,
} from '@/lib/api/apple-music';
import { getAllSpotifyAlbums, getSpotifyPlaylists } from '@/lib/api/spotify';
import pb from '@/lib/pocketbase';
import { ServiceType, SyncProgress } from '@/lib/types';
import { normalizeAlbumData, normalizePlaylistData } from './normalizers';

export async function syncLibrary(
  userId: string,
  service: ServiceType,
  onProgress?: (progress: SyncProgress) => void
) {
  const token = localStorage.getItem(
    service === 'spotify' ? 'spotify_access_token' : 'apple_music_token'
  );

  if (!token) throw new Error('No access token found');

  try {
    onProgress?.({
      total: 0,
      current: 0,
      phase: 'albums',
      service,
    });

    const albums =
      service === 'spotify'
        ? { items: await getAllSpotifyAlbums(userId, token) }
        : await getAllAppleMusicAlbums(token);

    onProgress?.({
      total: 100,
      current: 0,
      phase: 'playlists',
      service,
    });

    const playlists =
      service === 'spotify'
        ? await getSpotifyPlaylists(token)
        : await getAppleMusicLibrary(token);

    console.log(playlists);

    const [albumsRecord, playlistsRecord] = await Promise.all([
      pb
        .collection('userAlbums')
        .getFirstListItem(`user="${userId}" && service="${service}"`)
        .catch(() => null),
      pb
        .collection('userPlaylists')
        .getFirstListItem(`user="${userId}" && service="${service}"`)
        .catch(() => null),
    ]);

    const now = new Date().toISOString();

    const albumsData = {
      user: userId,
      service,
      albums: (service === 'spotify' ? albums.items : albums.data).map(
        (album: any) => normalizeAlbumData(album, service)
      ),
      lastSynced: now,
    };

    const playlistsData = {
      user: userId,
      service,
      playlists:
        service === 'spotify'
          ? playlists.items.map((playlist: any) =>
              normalizePlaylistData(playlist, service)
            )
          : playlists.data.map((playlist: any) =>
              normalizePlaylistData(playlist, service)
            ),
      lastSynced: now,
    };

    // Update or create records with a small delay to prevent auto-cancellation
    await Promise.all([
      albumsRecord
        ? pb.collection('userAlbums').update(albumsRecord.id, albumsData)
        : pb.collection('userAlbums').create(albumsData),
      playlistsRecord
        ? pb
            .collection('userPlaylists')
            .update(playlistsRecord.id, playlistsData)
        : pb.collection('userPlaylists').create(playlistsData),
    ]);

    return { albums, playlists };
  } catch (error) {
    console.error('Failed to sync library:', error);
    throw error;
  }
}
