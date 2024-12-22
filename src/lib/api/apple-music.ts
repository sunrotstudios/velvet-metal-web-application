import { z } from 'zod';

export const APPLE_DEVELOPER_TOKEN =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZLVkRTNjc2NVMifQ.eyJpYXQiOjE3MzE0NTQ2OTEsImV4cCI6MTc0NzAwNjY5MSwiaXNzIjoiRFlXNEFHOTQ0MiJ9.Us6UP86UTEZJtCdyVLlOGGj-hw_pZ4lu4Pk-htEbolgWrph6P_toc9INvLhzVgVlD5ToyiD_m8CssZlPunUGHw';
const APPLE_TEAM_ID = 'DYW4AG9442';
const APPLE_KEY_ID = '6KVDS6765S';

export const appleMusicAuthSchema = z.object({
  userToken: z.string(),
  musicUserToken: z.string(),
});

export type AppleMusicAuth = z.infer<typeof appleMusicAuthSchema>;

declare global {
  interface Window {
    MusicKit: any;
  }
}

export const initializeAppleMusic = async () => {
  if (!window.MusicKit) {
    throw new Error('MusicKit JS not loaded');
  }

  return await window.MusicKit.configure({
    developerToken: APPLE_DEVELOPER_TOKEN,
    app: {
      name: 'Velvet Metal',
      build: '1.0.0',
      teamId: APPLE_TEAM_ID,
      keyId: APPLE_KEY_ID,
    },
  });
};

export const authorizeAppleMusic = async (): Promise<AppleMusicAuth> => {
  try {
    const music = await initializeAppleMusic();
    const musicUserToken = await music.authorize();

    // Get the user token using the instance method
    const userToken = music.musicUserToken;

    if (!userToken || !musicUserToken) {
      throw new Error('Failed to get Apple Music tokens');
    }

    return {
      userToken,
      musicUserToken,
    };
  } catch (error) {
    console.error('Apple Music authorization error:', error);
    throw new Error('Failed to authorize Apple Music');
  }
};

export const getAppleMusicLibrary = async (token: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/playlists',
    {
      headers: {
        'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Apple Music library');
  }

  const playlists = await response.json();

  // Then, fetch track counts for each playlist
  const playlistsWithTracks = await Promise.all(
    playlists.data.map(async (playlist: any) => {
      // Extract the catalog ID from the playParams
      const catalogId =
        playlist.attributes?.playParams?.catalogId || playlist.id;

      const tracksResponse = await fetch(
        `https://api.music.apple.com/v1/me/library/playlists/${catalogId}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token
          },
        }
      );

      if (!tracksResponse.ok) {
        console.warn(`Failed to fetch tracks for playlist ${playlist.id}`);
        return {
          ...playlist,
          relationships: {
            tracks: {
              data: [],
            },
          },
        };
      }

      const tracksData = await tracksResponse.json();
      return {
        ...playlist,
        relationships: {
          tracks: {
            data: tracksData.data || [],
          },
        },
      };
    })
  );

  return {
    ...playlists,
    data: playlistsWithTracks,
  };
};

export const getAppleMusicAlbums = async (token: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/albums',
    {
      headers: {
        'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Apple Music albums');
  }

  return response.json();
};

export const getAllAppleMusicAlbums = async (token: string) => {
  let allAlbums: any[] = [];
  let offset = 0;
  const limit = 100; // Apple Music's max limit per request
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.music.apple.com/v1/me/library/albums?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Apple Music albums');
    }

    const data = await response.json();
    const albums = data.data || [];
    const transformedAlbums = albums.map((album: any) => ({
      id: album.id, // Keep the full ID including 'l.' prefix
      album_id: album.id, // Keep the full ID including 'l.' prefix
      name: album.attributes.name,
      artist_name: album.attributes.artistName,
      image_url: album.attributes.artwork
        ? album.attributes.artwork.url
            .replace('{w}', '300')
            .replace('{h}', '300')
        : null,
      release_date: album.attributes.releaseDate,
      service: 'apple-music' as const,
      tracks_count: album.attributes.trackCount,
      external_url: null,
      album_type: album.attributes.playParams?.kind || 'album',
    }));
    allAlbums = [...allAlbums, ...transformedAlbums];

    // Check if there are more albums to fetch
    hasMore = albums.length === limit;
    offset += limit;
  }

  return {
    data: allAlbums,
  };
};

export const getAppleMusicPlaylistDetails = async (
  playlistId: string,
  token: string
): Promise<DetailedPlaylist> => {
  try {
    if (!token) {
      throw new Error('Apple Music user token not provided');
    }

    const response = await fetch(
      `https://api.music.apple.com/v1/me/library/playlists/${playlistId}?include=tracks,artists`,
      {
        headers: {
          'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apple Music API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        playlistId,
      });
      throw new Error(
        `Apple Music API error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    if (!data.data?.[0]) {
      throw new Error('No playlist data returned');
    }

    const playlist = data.data[0];
    const tracks = playlist.relationships?.tracks?.data || [];

    return {
      id: playlistId, // Keep the original ID with 'l.' prefix
      playlist_id: playlistId,
      name: playlist.attributes.name,
      description: playlist.attributes.description?.standard || '',
      owner: {
        id: 'me',
        display_name: 'My Library',
      },
      tracks: tracks.map((track: any) => ({
        id: track.id,
        track_id: track.id,
        name: track.attributes.name,
        artist: {
          id: track.relationships?.artists?.data?.[0]?.id || '',
          name: track.attributes.artistName,
        },
        album: {
          id: track.relationships?.albums?.data?.[0]?.id || '',
          name: track.attributes.albumName,
          image_url: track.attributes.artwork?.url || null,
        },
        duration_ms: track.attributes.durationInMillis,
        track_number: track.attributes.trackNumber,
        external_url: null,
        preview_url: track.attributes.previews?.[0]?.url || null,
        service: 'apple-music' as const,
      })),
      total_tracks: tracks.length,
      artwork: playlist.attributes.artwork
        ? {
            url: playlist.attributes.artwork.url
              .replace('{w}', '300')
              .replace('{h}', '300'),
          }
        : null,
      external_url: null,
      service: 'apple-music' as const,
    };
  } catch (error) {
    console.error('Error fetching Apple Music playlist:', error);
    throw error;
  }
};

export const getAppleMusicAlbumDetails = async (
  albumId: string,
  token: string
): Promise<DetailedAlbum> => {
  try {
    if (!token) {
      throw new Error('Apple Music user token not provided');
    }

    // For library albums (starting with 'l.'), we need to use the library endpoint
    const isLibraryAlbum = albumId.startsWith('l.');

    if (isLibraryAlbum) {
      // For library albums, use the full ID including 'l.' prefix
      const response = await fetch(
        `https://api.music.apple.com/v1/me/library/albums/${albumId}?include=tracks,artists`,
        {
          headers: {
            'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Apple Music API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          albumId,
        });
        throw new Error(
          `Apple Music API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      const album = data.data?.[0];

      if (!album) {
        throw new Error('No album data returned');
      }

      const tracks = album.relationships?.tracks?.data || [];

      return {
        id: albumId,
        album_id: albumId,
        name: album.attributes.name,
        artistName: album.attributes.artistName,
        totalTracks: album.attributes.trackCount,
        releaseDate: album.attributes.releaseDate,
        artwork: album.attributes.artwork
          ? {
              url: album.attributes.artwork.url
                .replace('{w}', '300')
                .replace('{h}', '300'),
            }
          : null,
        tracks: tracks.map((track: any) => ({
          id: track.id,
          track_id: track.id,
          name: track.attributes.name,
          artistName: track.attributes.artistName,
          trackNumber: track.attributes.trackNumber,
          durationMs: track.attributes.durationInMillis,
          album: {
            id: albumId,
            name: album.attributes.name,
            artwork: album.attributes.artwork
              ? {
                  url: album.attributes.artwork.url
                    .replace('{w}', '300')
                    .replace('{h}', '300'),
                }
              : null,
          },
          preview_url: track.attributes.previews?.[0]?.url || null,
          service: 'apple-music' as const,
        })),
        external_url: null,
        service: 'apple-music' as const,
        album_type: album.attributes.playParams?.kind || 'album',
      };
    } else {
      // For catalog albums, use the catalog endpoint
      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/albums/${albumId}?include=tracks,artists`,
        {
          headers: {
            'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Apple Music API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          albumId,
        });
        throw new Error(
          `Apple Music API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      if (!data.data?.[0]) {
        throw new Error('No album data returned');
      }

      const album = data.data[0];
      const tracks = album.relationships?.tracks?.data || [];

      return {
        id: albumId,
        album_id: albumId,
        name: album.attributes.name,
        artistName: album.attributes.artistName,
        totalTracks: album.attributes.trackCount,
        releaseDate: album.attributes.releaseDate,
        artwork: album.attributes.artwork
          ? {
              url: album.attributes.artwork.url
                .replace('{w}', '300')
                .replace('{h}', '300'),
            }
          : null,
        tracks: tracks.map((track: any) => ({
          id: track.id,
          track_id: track.id,
          name: track.attributes.name,
          artistName: track.attributes.artistName,
          trackNumber: track.attributes.trackNumber,
          durationMs: track.attributes.durationInMillis,
          album: {
            id: albumId,
            name: album.attributes.name,
            artwork: album.attributes.artwork
              ? {
                  url: album.attributes.artwork.url
                    .replace('{w}', '300')
                    .replace('{h}', '300'),
                }
              : null,
          },
          preview_url: track.attributes.previews?.[0]?.url || null,
          service: 'apple-music' as const,
        })),
        external_url: null,
        service: 'apple-music' as const,
        album_type: album.attributes.albumType || 'album',
      };
    }
  } catch (error) {
    console.error('Error fetching Apple Music album:', error);
    throw error;
  }
};

async function findAlbumInLibrary(
  catalogId: string,
  token: string,
  offset = 0
): Promise<any> {
  const limit = 100; // Use maximum limit to reduce API calls
  const libraryUrl = `https://api.music.apple.com/v1/me/library/albums?limit=${limit}&offset=${offset}`;
  console.log('Searching library page:', { catalogId, offset, libraryUrl });

  const response = await fetch(libraryUrl, {
    headers: {
      'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
      'Music-User-Token': token,
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to search library: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Checking albums ${offset} to ${offset + limit}`);

  // Find the album in this batch
  const album = data.data?.find((album: any) => 
    album.attributes?.playParams?.catalogId === catalogId ||
    album.attributes?.playParams?.id === catalogId
  );

  if (album) {
    return album;
  }

  // If we have more albums to check and haven't found it yet, continue searching
  if (data.next && offset + limit < data.meta.total) {
    return findAlbumInLibrary(catalogId, token, offset + limit);
  }

  return null;
}

export async function addAppleMusicAlbumToLibrary(
  albumId: string,
  token: string
): Promise<void> {
  try {
    // First, verify the album exists in the catalog
    const catalogUrl = `https://api.music.apple.com/v1/catalog/us/albums/${albumId}`;
    console.log('Verifying album in catalog:', { albumId, catalogUrl });

    const catalogResponse = await fetch(catalogUrl, {
      headers: {
        'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      }
    });

    if (!catalogResponse.ok) {
      const errorText = await catalogResponse.text();
      console.error('Failed to verify album in catalog:', {
        status: catalogResponse.status,
        error: errorText,
        albumId
      });
      throw new Error('Failed to verify album in catalog');
    }

    const catalogData = await catalogResponse.json();
    console.log('Catalog response:', catalogData);

    // Add to library using query parameters exactly as shown in docs
    const url = `https://api.music.apple.com/v1/me/library?ids[albums]=${albumId}`;
    console.log('Adding album to library:', { albumId, url });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      }
    });

    // Check for 202 Accepted status specifically
    if (response.status !== 202) {
      const errorText = await response.text();
      console.error('Failed to add album to Apple Music library:', {
        status: response.status,
        error: errorText,
        albumId,
        url
      });
      throw new Error(`Failed to add album to Apple Music library: ${response.status}`);
    }

    console.log('Successfully added album to library (status 202 Accepted)');
    console.log('Note: There may be a delay before the album appears in your library');

    // Wait longer for the addition to process
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Search for the album in the library
    const libraryAlbum = await findAlbumInLibrary(albumId, token);

    if (libraryAlbum) {
      console.log('Found album in library:', {
        libraryId: libraryAlbum.id,
        catalogId: albumId,
        name: libraryAlbum.attributes.name,
        playParams: libraryAlbum.attributes.playParams
      });
    } else {
      console.log('Album not found in library after searching all pages');
      console.log('This is normal - there may be a delay before the album appears');
    }
  } catch (error) {
    console.error('Error adding album to Apple Music library:', error);
    throw error;
  }
}

export async function searchAppleMusicAlbum(
  albumQuery: string,
  artistQuery: string,
  token: string
): Promise<SearchResult | null> {
  try {
    const searchUrl = `https://api.music.apple.com/v1/catalog/us/search?types=albums&term=${encodeURIComponent(
      `${albumQuery} ${artistQuery}`
    )}`;
    console.log('Searching Apple Music:', { albumQuery, artistQuery, searchUrl });

    const response = await fetch(
      searchUrl,
      {
        headers: {
          'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to search Apple Music album:', errorText);
      throw new Error('Failed to search Apple Music album');
    }

    const data = await response.json();
    console.log('Search response:', data);
    
    const albums = data.results.albums?.data;

    if (!albums || albums.length === 0) {
      console.log('No albums found in search results');
      return null;
    }

    const album = albums[0];
    console.log('Found album:', {
      id: album.id,
      name: album.attributes.name,
      artist: album.attributes.artistName,
      type: album.type,
      href: album.href
    });

    return {
      id: album.id,
      name: album.attributes.name,
      artist: album.attributes.artistName,
      type: 'album',
    };
  } catch (error) {
    console.error('Error searching Apple Music album:', error);
    throw error;
  }
}
