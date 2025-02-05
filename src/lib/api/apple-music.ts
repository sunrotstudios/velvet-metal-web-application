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
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
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
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
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
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
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
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
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
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
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
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
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
        added_at: album.attributes.dateAdded || null,
      };
    } else {
      // For catalog albums, use the catalog endpoint
      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/albums/${albumId}?include=tracks,artists`,
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
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

  const response = await fetch(libraryUrl, {
    headers: {
      Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
      'Music-User-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search library: ${response.status}`);
  }

  const data = await response.json();

  // Find the album in this batch
  const album = data.data?.find(
    (album: any) =>
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

export async function addAlbumsToAppleMusicLibrary(
  albumIds: string[],
  token: string
): Promise<void> {
  if (!albumIds.length) return;

  try {
    console.log('Adding albums to library:', { albumIds });

    // Process in larger batches while staying under URL length limits
    const batchSize = 25; // Increased from 10 to 25
    const batches = [];

    for (let i = 0; i < albumIds.length; i += batchSize) {
      batches.push(albumIds.slice(i, i + batchSize));
    }

    console.log(`Processing ${batches.length} batches of albums...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `Processing batch ${i + 1}/${batches.length} (${batch.length} albums)`
      );

      const idsParam = batch.map((id) => `ids[albums]=${id}`).join('&');
      const url = `https://api.music.apple.com/v1/me/library?${idsParam}`;

      console.log('Adding batch to library:', { url });

      await retryWithBackoff(async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          },
        });

        if (response.status !== 202) {
          let errorMessage = `Failed to add albums to library: ${response.status}`;
          try {
            const error = await response.text();
            console.error('Apple Music API error details:', error);
            errorMessage += ` - ${error}`;
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          throw new Error(errorMessage);
        }

        console.log(`Batch ${i + 1}/${batches.length} accepted (status 202)`);
        return response;
      });

      // Minimal wait between batches to respect rate limits
      // Apple's rate limits aren't publicly documented, but testing shows we can be more aggressive
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Failed to add albums to library:', error);
    throw error;
  }
}

export async function addAppleMusicAlbumToLibrary(
  albumId: string,
  token: string
): Promise<void> {
  try {
    // First, verify the album exists in the catalog
    const catalogUrl = `https://api.music.apple.com/v1/catalog/us/albums/${albumId}`;

    const catalogResponse = await retryWithBackoff(async () => {
      const response = await fetch(catalogUrl, {
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to verify album in catalog:', {
          status: response.status,
          error: errorText,
          albumId,
        });
        throw new Error(
          `Failed to verify album in catalog: ${response.status} - ${errorText}`
        );
      }

      return response;
    });

    const catalogData = await catalogResponse.json();

    // Add to library using query parameters exactly as shown in docs
    const url = `https://api.music.apple.com/v1/me/library?ids[albums]=${albumId}`;

    await retryWithBackoff(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
        },
      });

      // Per Apple's docs: 202 is success, empty body is expected
      if (response.status !== 202) {
        const errorText = await response.text();
        console.error('Failed to add album to Apple Music library:', {
          status: response.status,
          error: errorText,
          albumId,
          url,
        });
        throw new Error(
          `Failed to add album to Apple Music library: ${response.status} - ${errorText}`
        );
      }

      return response;
    });

    console.log('Successfully added album to library (status 202 Accepted)');
    console.log(
      'Note: There may be a delay before the album appears in your library'
    );

    // Implement progressive retry for checking library
    const maxAttempts = 3;
    const delays = [5000, 10000, 15000]; // Progressive delays between checks
    let libraryAlbum = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Wait before checking
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));

      try {
        libraryAlbum = await findAlbumInLibrary(albumId, token);
        if (libraryAlbum) {
          console.log('Found album in library on attempt', attempt + 1, {
            libraryId: libraryAlbum.id,
            catalogId: albumId,
            name: libraryAlbum.attributes.name,
            playParams: libraryAlbum.attributes.playParams,
          });
          break;
        }
      } catch (error) {
        console.log('Error checking library on attempt', attempt + 1, error);
        // Continue to next attempt
      }
    }

    if (!libraryAlbum) {
      console.log('Album not found in library after multiple attempts');
      console.log(
        'This is normal - there may be a longer delay before the album appears'
      );
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

    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to search Apple Music album:', errorText);
      throw new Error('Failed to search Apple Music album');
    }

    const data = await response.json();

    const albums = data.results.albums?.data;

    if (!albums || albums.length === 0) {
      console.log('No albums found in search results');
      return null;
    }

    const album = albums[0];

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

export async function searchAppleMusicCatalog(
  query: string,
  token: string,
  types: string[] = ['albums']
): Promise<any> {
  const url = new URL('https://api.music.apple.com/v1/catalog/us/search');
  url.searchParams.append('term', query);
  url.searchParams.append('types', types.join(','));
  url.searchParams.append('limit', '10');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': token,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Search failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Apple Music search error:', error);
    throw error;
  }
}

export async function checkAlbumsInLibrary(
  albumIds: string[],
  token: string
): Promise<{ [id: string]: boolean }> {
  try {
    console.log('Starting library check for albums:', albumIds);
    const results: { [id: string]: boolean } = {};

    // Process in smaller batches to avoid URL length limits
    const batchSize = 10;
    for (let i = 0; i < albumIds.length; i += batchSize) {
      const batchIds = albumIds.slice(i, i + batchSize);
      const idsParam = batchIds.map((id) => `ids[albums]=${id}`).join('&');
      const url = `https://api.music.apple.com/v1/me/library/albums?${idsParam}`;

      console.log('Checking batch with URL:', url);

      const response = await retryWithBackoff(async () => {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('Failed to check albums:', {
            status: res.status,
            error: errorText,
            url,
          });
          throw new Error(
            `Failed to check albums: ${res.status} - ${errorText}`
          );
        }

        return res;
      });

      const data = await response.json();
      console.log('Library check response:', data);

      const foundIds = new Set(data.data?.map((item: any) => item.id));
      console.log('Found IDs in library:', Array.from(foundIds));

      for (const id of batchIds) {
        results[id] = foundIds.has(id);
        console.log(
          `Album ${id}: ${results[id] ? 'found' : 'not found'} in library`
        );
      }
    }

    return results;
  } catch (error) {
    console.error('Failed to check albums in library:', error);
    throw error;
  }
}

export async function findAlbumsByUPC(
  upcs: string[],
  userToken: string
): Promise<{ [upc: string]: string | null }> {
  try {
    // Apple Music API has a limit on URL length, so we'll process in batches
    const batchSize = 10;
    const results: { [upc: string]: string | null } = {};

    for (let i = 0; i < upcs.length; i += batchSize) {
      const batchUpcs = upcs.slice(i, i + batchSize);

      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/albums?filter[upc]=${batchUpcs.join(
          ','
        )}`,
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Apple Music API error: ${response.status}`);
      }

      const data = await response.json();

      // Map each UPC to its corresponding Apple Music ID
      batchUpcs.forEach((upc) => {
        const album = data.data?.find(
          (a: any) =>
            a.attributes?.upc === upc ||
            // Sometimes UPCs have leading zeros trimmed, try both
            a.attributes?.upc === upc.replace(/^0+/, '')
        );
        results[upc] = album ? album.id : null;
      });

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < upcs.length) {
        await delay(100);
      }
    }

    return results;
  } catch (error) {
    console.error('Error finding albums by UPC:', error);
    throw error;
  }
}

export function findBestMatchingAlbum(
  searchResults: any,
  targetAlbum: { name: string; artist_name: string }
): string | null {
  if (!searchResults?.albums?.data) {
    console.log('No search results found');
    return null;
  }

  const albums = searchResults.albums.data;
  let bestMatch: any = null;
  let bestScore = 0;

  for (const album of albums) {
    const nameMatch =
      album.attributes.name.toLowerCase() === targetAlbum.name.toLowerCase();
    const artistMatch =
      album.attributes.artistName.toLowerCase() ===
      targetAlbum.artist_name.toLowerCase();

    const score = (nameMatch ? 1 : 0) + (artistMatch ? 1 : 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = album;
    }
  }

  if (bestMatch && bestScore > 0) {
    console.log('Found best match:', {
      id: bestMatch.id,
      name: bestMatch.attributes.name,
      artist: bestMatch.attributes.artistName,
      score: bestScore,
    });
    return bestMatch.id;
  }

  console.log('No suitable match found');
  return null;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Only retry on 500 errors or network failures
      if (
        !error.message?.includes('500') &&
        !error.message?.includes('Failed to fetch')
      ) {
        throw error;
      }

      const delayMs = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  throw lastError;
}

export async function getAppleMusicPlaylists(
  musicUserToken: string
): Promise<NormalizedPlaylist[]> {
  const music = MusicKit.getInstance();
  
  try {
    const response = await music.api.library.playlists();
    
    return response.map(playlist => ({
      id: playlist.id,
      user_id: '', // Apple Music doesn't provide this
      playlist_id: playlist.id,
      name: playlist.attributes.name,
      description: playlist.attributes.description?.standard || undefined,
      artwork: playlist.attributes.artwork ? {
        url: playlist.attributes.artwork.url,
        height: playlist.attributes.artwork.height,
        width: playlist.attributes.artwork.width,
      } : undefined,
      tracks_count: playlist.attributes.trackCount || 0,
      owner: {
        id: '', // Apple Music doesn't provide this
        display_name: undefined,
      },
      service: 'apple-music' as const,
      is_public: false, // Apple Music playlists are private by default
      external_url: playlist.attributes.url,
    }));
  } catch (error) {
    console.error('Error fetching Apple Music playlists:', error);
    throw error;
  }
}
