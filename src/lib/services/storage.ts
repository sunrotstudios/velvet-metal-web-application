import pb from '@/lib/pocketbase';
import { ServiceType } from '@/lib/types';

export async function getStoredLibrary(userId: string, service: ServiceType) {
  try {
    let albumsRecord = null;
    let playlistsRecord = null;

    try {
      albumsRecord = await pb
        .collection('userAlbums')
        .getFirstListItem(`user="${userId}" && service="${service}"`);
    } catch (error) {
      albumsRecord = { albums: [], lastSynced: new Date() };
    }

    try {
      playlistsRecord = await pb
        .collection('userPlaylists')
        .getFirstListItem(`user="${userId}" && service="${service}"`);
    } catch (error) {
      playlistsRecord = { playlists: [] };
    }

    return {
      albums: albumsRecord.albums || [],
      playlists: playlistsRecord.playlists || [],
      lastSynced: albumsRecord.lastSynced,
    };
  } catch (error) {
    console.error('Error in getStoredLibrary:', error);
    return {
      albums: [],
      playlists: [],
      lastSynced: new Date(),
    };
  }
}
