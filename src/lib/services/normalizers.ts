import { NormalizedAlbum, NormalizedPlaylist, ServiceType } from '@/lib/types';

export function normalizeAlbumData(
  album: any,
  service: 'spotify' | 'apple-music'
): NormalizedAlbum {
  if (service === 'spotify') {
    let albumType: 'album' | 'single' | 'ep' = 'album';
    const spotifyType = album.album?.album_type?.toLowerCase();

    if (spotifyType === 'single') {
      albumType = 'single';
    } else if (spotifyType === 'ep' || (album.album?.total_tracks || 0) <= 6) {
      albumType = 'ep';
    }

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
      albumType,
    };
  }

  // Apple Music
  let albumType: 'album' | 'single' | 'ep' = 'album';
  if (album.attributes?.isSingle) {
    albumType = 'single';
  } else if ((album.attributes?.trackCount || 0) <= 6) {
    albumType = 'ep';
  }

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
    albumType,
  };
}

export function normalizePlaylistData(
  playlist: any,
  service: ServiceType
): NormalizedPlaylist | null {
  if (!playlist) {
    return null;
  }

  if (service === 'spotify') {
    if (!playlist.id) {
      return null;
    }

    return {
      id: playlist.id,
      name: playlist.name || 'Untitled Playlist',
      description: playlist.description || '',
      artwork: playlist.images?.[0]
        ? {
            url: playlist.images[0].url,
            height: playlist.images[0].height,
            width: playlist.images[0].width,
          }
        : undefined,
      metadata: {
        platform: 'spotify',
        externalUrl: playlist.external_urls?.spotify,
        isPublic: playlist.public || false,
        isCollaborative: playlist.collaborative || false,
        lastModified: playlist.snapshot_id
          ? new Date().toISOString()
          : undefined,
      },
      owner: playlist.owner
        ? {
            id: playlist.owner.id,
            displayName: playlist.owner.display_name,
            externalUrl: playlist.owner.external_urls?.spotify,
          }
        : undefined,
      tracks: {
        total: playlist.tracks?.total || 0,
        href: playlist.tracks?.href,
      },
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
    name: playlist.attributes?.name || 'Untitled Playlist',
    description: playlist.attributes?.description || '',
    artwork: artworkUrl
      ? {
          url: artworkUrl,
          height: playlist.attributes?.artwork?.height,
          width: playlist.attributes?.artwork?.width,
        }
      : undefined,
    metadata: {
      platform: 'apple_music',
      isPublic: false, // Apple Music playlists are private by default
      isCollaborative: false,
      createdAt: playlist.attributes?.dateAdded,
      lastModified: playlist.attributes?.lastModifiedDate,
    },
    tracks: {
      total: playlist.relationships?.tracks?.data?.length || 0,
      href: playlist.attributes?.playParams?.globalId,
    },
  };
}
