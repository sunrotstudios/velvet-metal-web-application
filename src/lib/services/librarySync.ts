import {
  getAppleMusicAlbums,
  getAppleMusicLibrary,
} from '@/lib/api/apple-music';
import { getAllSpotifyAlbums, getSpotifyPlaylists } from '@/lib/api/spotify';
import pb from '@/lib/pocketbase';
import { NormalizedAlbum, SyncProgress } from '@/lib/types';

function normalizeAlbumData(
  album: any,
  service: 'spotify' | 'apple-music'
): NormalizedAlbum {
  if (service === 'spotify') {
    return {
      id: album.album?.id || album.id,
      sourceId: album.album?.id || album.id,
      sourceService: 'spotify',
      name: album.album?.name || '',
      artistName: album.album?.artists?.[0]?.name || '',
      artwork: {
        url: album.album?.images?.[0]?.url || '',
        width: album.album?.images?.[0]?.width || null,
        height: album.album?.images?.[0]?.height || null,
      },
      releaseDate: album.album?.release_date || '',
      trackCount: album.album?.total_tracks || 0,
      dateAdded: album.added_at || null,
    };
  } else {
    // Apple Music
    const artworkUrl = album.attributes?.artwork?.url
      ? album.attributes.artwork.url
          .replace('{w}', '1200')
          .replace('{h}', '1200')
      : '';

    return {
      id: album.id,
      sourceId: album.id,
      sourceService: 'apple-music',
      name: album.attributes?.name || '',
      artistName: album.attributes?.artistName || '',
      artwork: {
        url: artworkUrl,
        width: album.attributes?.artwork?.width || null,
        height: album.attributes?.artwork?.height || null,
      },
      releaseDate: album.attributes?.releaseDate || '',
      trackCount: album.attributes?.trackCount || 0,
      dateAdded: album.attributes?.dateAdded || null,
    };
  }
}

export function normalizePlaylistData(
  playlist: any,
  service: ServiceType
): NormalizedPlaylist {
  if (service === 'spotify') {
    return {
      id: playlist.id,
      sourceId: playlist.id,
      sourceService: 'spotify',
      name: playlist.name || 'Untitled Playlist',
      artwork: {
        url: playlist.images?.[0]?.url || '',
        width: playlist.images?.[0]?.width || null,
        height: playlist.images?.[0]?.height || null,
      },
      trackCount: playlist.tracks?.total || 0,
      dateAdded: playlist.added_at || null,
    };
  } else {
    // Apple Music
    const artworkUrl = playlist.attributes?.artwork?.url
      ? playlist.attributes.artwork.url
          .replace('{w}', '500')
          .replace('{h}', '500')
      : '';

    return {
      id: playlist.id,
      sourceId: playlist.id,
      sourceService: 'apple-music',
      name: playlist.attributes?.name || 'Untitled Playlist',
      artwork: {
        url: artworkUrl,
        width: playlist.attributes?.artwork?.width || null,
        height: playlist.attributes?.artwork?.height || null,
      },
      trackCount: playlist.attributes?.trackCount || 0,
      dateAdded: playlist.attributes?.dateAdded || null,
    };
  }
}

export async function syncLibrary(
  userId: string,
  service: 'spotify' | 'apple-music',
  onProgress?: (progress: SyncProgress) => void
) {
  const token = localStorage.getItem(
    service === 'spotify' ? 'spotify_access_token' : 'apple_music_token'
  );

  console.log('Syncing Library for User:', userId, 'With Service:', service);

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
        : await getAppleMusicAlbums(token);

    onProgress?.({
      total: 100,
      current: 0,
      phase: 'playlists',
      service,
    });

    // Fetch All Playlists
    const playlists =
      service === 'spotify'
        ? await getSpotifyPlaylists(token)
        : await getAppleMusicLibrary(token);

    console.log('Fetched Data:', {
      albumsCount: albums?.items?.length || 0,
      playlistsCount: playlists?.items?.length || 0,
    });

    // Try to find existing records
    let albumsRecord;
    let playlistsRecord;

    try {
      albumsRecord = await pb
        .collection('userAlbums')
        .getFirstListItem(`user="${userId}" && service="${service}"`);
    } catch (error) {
      console.log('No existing albums record found, will create new');
    }

    try {
      playlistsRecord = await pb
        .collection('userPlaylists')
        .getFirstListItem(`user="${userId}" && service="${service}"`);
    } catch (error) {
      console.log('No existing playlists record found, will create new');
    }

    const now = new Date().toISOString();

    // Prepare the data in the correct format
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
      playlists: service === 'spotify' ? playlists.items : playlists.data,
      lastSynced: now,
    };

    console.log('Saving to PocketBase:', {
      albumsDataCount: albumsData.albums?.length || 0,
      playlistsDataCount: playlistsData.playlists?.length || 0,
    });

    // Update or create records with a small delay to prevent auto-cancellation
    if (albumsRecord) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await pb.collection('userAlbums').update(albumsRecord.id, albumsData);
      console.log('Updated existing albums record');
    } else {
      const created = await pb.collection('userAlbums').create(albumsData);
      console.log('Created new albums record:', created.id);
    }

    if (playlistsRecord) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await pb
        .collection('userPlaylists')
        .update(playlistsRecord.id, playlistsData);
      console.log('Updated existing playlists record');
    } else {
      const created = await pb
        .collection('userPlaylists')
        .create(playlistsData);
      console.log('Created new playlists record:', created.id);
    }

    return { albums, playlists };
  } catch (error) {
    console.error('Failed to sync library:', error);
    // Re-throw the error so it can be handled by the caller
    throw error;
  }
}

export async function getStoredLibrary(
  userId: string,
  service: 'spotify' | 'apple-music'
) {
  try {
    // Fetch albums and playlists separately to handle individual failures
    let albumsRecord = null;
    let playlistsRecord = null;

    console.log('Fetching albums and playlists for user:', userId);

    try {
      albumsRecord = await pb
        .collection('userAlbums')
        .getFirstListItem(`user="${userId}" && service="${service}"`);

      console.log('Albums Record Found:', albumsRecord);
    } catch (error) {
      // Album record doesn't exist yet, continue with empty albums
      albumsRecord = { albums: [], lastSynced: new Date() };
    }

    console.log('Albums Record Found:', albumsRecord);

    try {
      playlistsRecord = await pb
        .collection('userPlaylists')
        .getFirstListItem(`user="${userId}" && service="${service}"`);
    } catch (error) {
      // Playlist record doesn't exist yet, continue with empty playlists
      playlistsRecord = { playlists: [] };
    }

    console.log('Playlists Record Found:', playlistsRecord);

    if (service === 'spotify') {
      return {
        albums: albumsRecord.albums || [],
        playlists: playlistsRecord.playlists || [],
        lastSynced: albumsRecord.lastSynced,
      };
    } else {
      // Apple Music
      return {
        albums: albumsRecord.albums || [],
        playlists: playlistsRecord.playlists || [],
        lastSynced: albumsRecord.lastSynced,
      };
    }
  } catch (error) {
    console.error('Error in getStoredLibrary:', error);
    return {
      albums: [],
      playlists: [],
      lastSynced: new Date(),
    };
  }
}
