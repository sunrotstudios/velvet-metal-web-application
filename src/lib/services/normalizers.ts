import { NormalizedAlbum, NormalizedPlaylist, ServiceType } from '@/lib/types';

export function normalizeAlbumData(
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
  }

  // Apple Music
  const artworkUrl = album.attributes?.artwork?.url
    ? album.attributes.artwork.url.replace('{w}', '1200').replace('{h}', '1200')
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

export function normalizePlaylistData(
  playlist: any,
  service: ServiceType
): NormalizedPlaylist {
  if (service === 'spotify') {
    return {
      id: playlist.id || null,
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
  }

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
