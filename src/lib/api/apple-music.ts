import { z } from 'zod';

const APPLE_DEVELOPER_TOKEN =
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

export const getAppleMusicLibrary = async (musicUserToken: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/playlists',
    {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': musicUserToken,
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
            'Music-User-Token': musicUserToken,
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

export const getAppleMusicAlbums = async (musicUserToken: string) => {
  const response = await fetch(
    'https://api.music.apple.com/v1/me/library/albums',
    {
      headers: {
        Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
        'Music-User-Token': musicUserToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Apple Music albums');
  }

  return response.json();
};

export const getAllAppleMusicAlbums = async (musicUserToken: string) => {
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
          'Music-User-Token': musicUserToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Apple Music albums');
    }

    const data = await response.json();
    const albums = data.data || [];
    const transformedAlbums = albums.map((album: any) => ({
      id: album.id,  // Keep the full ID including 'l.' prefix
      album_id: album.id,  // Keep the full ID including 'l.' prefix
      name: album.attributes.name,
      artist_name: album.attributes.artistName,
      image_url: album.attributes.artwork ? album.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300') : null,
      release_date: album.attributes.releaseDate,
      service: 'apple-music' as const,
      tracks_count: album.attributes.trackCount,
      external_url: null,
      album_type: album.attributes.playParams?.kind || 'album'
    }));
    allAlbums = [...allAlbums, ...transformedAlbums];

    // Check if there are more albums to fetch
    hasMore = albums.length === limit;
    offset += limit;
  }

  return {
    data: allAlbums
  };
};

export const getAppleMusicPlaylistDetails = async (playlistId: string, musicUserToken: string): Promise<DetailedPlaylist> => {
  try {
    if (!musicUserToken) {
      throw new Error('Apple Music user token not provided');
    }

    // Remove the 'l.' prefix for catalog requests
    const catalogId = playlistId.startsWith('l.') ? playlistId.slice(2) : playlistId;

    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/playlists/${catalogId}?include=tracks,artists`,
      {
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': musicUserToken,
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
        catalogId,
      });
      throw new Error(`Apple Music API error (${response.status}): ${errorText}`);
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
        display_name: 'My Library'
      },
      tracks: tracks.map((track: any) => ({
        id: track.id,
        track_id: track.id,
        name: track.attributes.name,
        artist: {
          id: track.relationships?.artists?.data?.[0]?.id || '',
          name: track.attributes.artistName
        },
        album: {
          id: track.relationships?.albums?.data?.[0]?.id || '',
          name: track.attributes.albumName,
          image_url: track.attributes.artwork?.url || null
        },
        duration_ms: track.attributes.durationInMillis,
        track_number: track.attributes.trackNumber,
        external_url: null,
        preview_url: track.attributes.previews?.[0]?.url || null,
        service: 'apple-music' as const
      })),
      total_tracks: tracks.length,
      artwork: playlist.attributes.artwork ? {
        url: playlist.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300')
      } : null,
      external_url: null,
      service: 'apple-music' as const
    };
  } catch (error) {
    console.error('Error fetching Apple Music playlist:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching Apple Music playlist');
  }
};

export const getAppleMusicAlbumDetails = async (albumId: string, musicUserToken: string): Promise<DetailedAlbum> => {
  try {
    if (!musicUserToken) {
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
            'Music-User-Token': musicUserToken,
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
        throw new Error(`Apple Music API error (${response.status}): ${errorText}`);
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
        artwork: album.attributes.artwork ? {
          url: album.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300')
        } : null,
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
            artwork: album.attributes.artwork ? {
              url: album.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300')
            } : null
          },
          preview_url: track.attributes.previews?.[0]?.url || null,
          service: 'apple-music' as const
        })),
        external_url: null,
        service: 'apple-music' as const,
        album_type: album.attributes.playParams?.kind || 'album'
      };
    } else {
      // For catalog albums, use the catalog endpoint
      const response = await fetch(
        `https://api.music.apple.com/v1/catalog/us/albums/${albumId}?include=tracks,artists`,
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': musicUserToken,
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
        throw new Error(`Apple Music API error (${response.status}): ${errorText}`);
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
        artwork: album.attributes.artwork ? {
          url: album.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300')
        } : null,
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
            artwork: album.attributes.artwork ? {
              url: album.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300')
            } : null
          },
          preview_url: track.attributes.previews?.[0]?.url || null,
          service: 'apple-music' as const
        })),
        external_url: null,
        service: 'apple-music' as const,
        album_type: album.attributes.albumType || 'album'
      };
    }
  } catch (error) {
    console.error('Error fetching Apple Music album:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching Apple Music album');
  }
};
