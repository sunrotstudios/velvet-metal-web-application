import { refreshSpotifyToken } from '@/lib/api/spotify';
import { isTokenExpired } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';
import {
  addAppleMusicAlbumToLibrary,
  searchAppleMusicAlbum,
} from '../api/apple-music';
import { addSpotifyAlbumToLibrary, searchSpotifyAlbum } from '../api/spotify';
import { getServiceAuth, saveServiceAuth } from './streaming-auth';

const APPLE_DEVELOPER_TOKEN =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZLVkRTNjc2NVMifQ.eyJpYXQiOjE3MzE0NTQ2OTEsImV4cCI6MTc0NzAwNjY5MSwiaXNzIjoiRFlXNEFHOTQ0MiJ9.Us6UP86UTEZJtCdyVLlOGGj-hw_pZ4lu4Pk-htEbolgWrph6P_toc9INvLhzVgVlD5ToyiD_m8CssZlPunUGHw';

interface Track {
  name: string;
  artist: string;
  album: string;
  isrc?: string;
}

interface TransferPlaylistParams {
  sourceService: 'spotify' | 'apple-music';
  targetService: 'spotify' | 'apple-music';
  playlist: any;
  sourceToken: string;
  targetToken: string;
  onProgress?: (progress: TransferProgress) => void;
  userId: string;
}

interface TransferAlbumParams {
  sourceService: ServiceType;
  destinationService: ServiceType;
  album: any;
  sourceToken: string;
  targetToken: string;
  onProgress?: (progress: TransferProgress) => void;
  userId: string;
}

export interface TransferHistoryRecord {
  id?: string;
  user: string;
  sourceService: 'spotify' | 'apple-music';
  targetService: 'spotify' | 'apple-music';
  sourcePlaylistId: string;
  sourcePlaylistName: string;
  targetPlaylistId?: string;
  targetPlaylistName?: string;
  tracksTotal: number;
  tracksTransferred: number;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface TransferProgress {
  stage: 'fetching' | 'creating' | 'searching' | 'adding';
  progress: number;
  message: string;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureFreshToken(
  service: 'spotify' | 'apple-music',
  token: string,
  userId: string
) {
  const auth = await getServiceAuth(userId, service);
  if (!auth) {
    throw new Error(`No ${service} authentication found`);
  }

  if (service === 'spotify') {
    const expiresAt = auth.expiresAt?.getTime() || 0;
    const refreshToken = auth.refreshToken;

    if (isTokenExpired(expiresAt / 1000) && refreshToken) {
      try {
        const newAuth = await refreshSpotifyToken(refreshToken);

        // Save the new tokens
        await saveServiceAuth(userId, service, {
          accessToken: newAuth.access_token,
          refreshToken: newAuth.refresh_token,
          expiresAt: new Date(Date.now() + newAuth.expires_in * 1000),
        });

        return newAuth.access_token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        throw new Error(
          'Your Spotify session has expired. Please reconnect your account.'
        );
      }
    }
    return auth.accessToken;
  } else if (service === 'apple-music') {
    if (!auth.musicUserToken) {
      throw new Error(
        'Apple Music user token not found. Please reconnect your account.'
      );
    }

    // For Apple Music, we need to ensure the Music User Token is still valid
    try {
      // Try to make a test request to verify the token
      const response = await fetch(
        'https://api.music.apple.com/v1/me/library/albums',
        {
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': auth.musicUserToken,
          },
        }
      );

      if (!response.ok) {
        console.error(
          'Apple Music token validation failed:',
          await response.text()
        );
        throw new Error('Apple Music token validation failed');
      }

      return auth.musicUserToken;
    } catch (error) {
      console.error('Apple Music token validation failed:', error);
      throw new Error(
        'Your Apple Music session has expired. Please reconnect your account.'
      );
    }
  }
  return token;
}

async function retryWithBackoff(
  fn: () => Promise<any>,
  retries = 3,
  baseDelay = 1000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      return result || { success: true };
    } catch (error: any) {
      if (
        error?.message?.includes('API capacity exceeded') &&
        i < retries - 1
      ) {
        const delayTime = baseDelay * Math.pow(2, i);
        console.log(`Rate limited. Retrying in ${delayTime}ms...`);
        await delay(delayTime);
        continue;
      }
      throw error;
    }
  }
}

async function createPlaylist(
  service: 'spotify' | 'apple-music',
  { name, description }: { name: string; description: string },
  token: string,
  userId: string
) {
  const freshToken = await ensureFreshToken(service, token, userId);

  console.log(`Creating playlist in ${service}:`, { name, description });

  if (service === 'spotify') {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${freshToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        public: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Spotify playlist:', errorText);
      throw new Error('Failed to create Spotify playlist');
    }

    const data = await response.json();
    console.log('Successfully created Spotify playlist:', data);
    return {
      id: data.id,
      name: data.name,
    };
  } else {
    const response = await fetch(
      'https://api.music.apple.com/v1/me/library/playlists',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: {
            name,
            description,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Apple Music playlist:', errorText);
      throw new Error('Failed to create Apple Music playlist');
    }

    const data = await response.json();
    console.log('Successfully created Apple Music playlist:', data);
    return {
      id: data.data[0].id,
      name: data.data[0].attributes.name,
    };
  }
}

export async function transferPlaylist({
  sourceService,
  targetService,
  playlist,
  sourceToken,
  targetToken,
  onProgress,
  userId,
}: TransferPlaylistParams) {
  let transfer;

  try {
    // Get playlist tracks
    const tracks = await getPlaylistTracks(
      sourceService,
      playlist.playlist_id || playlist.id,
      sourceToken,
      userId
    );

    // Create transfer record with track count
    transfer = await createTransfer(userId, sourceService, targetService, {
      sourcePlaylistId: playlist.playlist_id || playlist.id,
      sourcePlaylistName: playlist.name || playlist.attributes?.name,
      tracksCount: tracks.length,
    });

    onProgress?.({
      stage: 'fetching',
      progress: 0,
      message: 'Fetching tracks from source playlist...',
    });

    onProgress?.({
      stage: 'fetching',
      progress: 20,
      message: `Found ${tracks.length} tracks`,
    });

    onProgress?.({
      stage: 'creating',
      progress: 25,
      message: 'Creating new playlist in target service...',
    });

    const newPlaylist = await createPlaylist(
      targetService,
      {
        name: playlist.name || playlist.attributes?.name,
        description: `Transferred from ${sourceService} using Velvet Metal`,
      },
      targetToken,
      userId
    );

    await updateTransferStatus(transfer.id, 'in_progress', undefined);

    onProgress?.({
      stage: 'creating',
      progress: 30,
      message: 'Playlist created successfully',
    });

    const transferredTracks = await addTracksToPlaylist(
      targetService,
      newPlaylist.id,
      tracks,
      targetToken,
      (current) => {
        const searchProgress = (current / tracks.length) * 70;
        onProgress?.({
          stage: 'searching',
          progress: Math.min(30 + searchProgress, 99),
          message: `Processing tracks (${current}/${tracks.length})`,
        });

        updateTransferStatus(transfer.id, 'in_progress', undefined);
      }
    );

    await updateTransferStatus(transfer.id, 'success', undefined);

    onProgress?.({
      stage: 'adding',
      progress: 100,
      message: 'Transfer complete! You can now close this window.',
    });

    return newPlaylist;
  } catch (error: any) {
    if (transfer) {
      await updateTransferStatus(transfer.id, 'failed', error.message);
    }
    throw error;
  }
}

async function getPlaylistTracks(
  service: 'spotify' | 'apple-music',
  playlistId: string,
  token: string,
  userId: string
): Promise<Track[]> {
  const freshToken = await ensureFreshToken(service, token, userId);

  console.log(`Fetching tracks from ${service} playlist ${playlistId}`);

  if (service === 'spotify') {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch Spotify tracks:', errorText);
      throw new Error('Failed to fetch Spotify tracks');
    }

    const data = await response.json();
    console.log(`Found ${data.items.length} tracks in Spotify playlist`);

    return data.items.map((item: any) => {
      const track = {
        name: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        isrc: item.track.external_ids?.isrc,
      };
      console.log('Processed Spotify track:', track);
      return track;
    });
  } else {
    const response = await fetch(
      `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': token,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch Apple Music tracks:', errorText);
      throw new Error('Failed to fetch Apple Music tracks');
    }

    const data = await response.json();
    console.log(`Found ${data.data.length} tracks in Apple Music playlist`);

    return data.data.map((item: any) => {
      const track = {
        name: item.attributes.name,
        artist: item.attributes.artistName,
        album: item.attributes.albumName,
        isrc: item.attributes.isrc,
      };
      console.log('Processed Apple Music track:', track);
      return track;
    });
  }
}

async function addTracksToPlaylist(
  service: 'spotify' | 'apple-music',
  playlistId: string,
  tracks: Track[],
  token: string,
  onProgress?: (current: number) => void
) {
  const freshToken = await ensureFreshToken(service, token, userId);

  console.log(
    `Starting to add ${tracks.length} tracks to ${service} playlist ${playlistId}`
  );

  if (service === 'spotify') {
    const trackUris = await Promise.all(
      tracks.map(async (track, index) => {
        console.log(`[${index + 1}/${tracks.length}] Searching for track:`, {
          name: track.name,
          artist: track.artist,
          isrc: track.isrc,
        });

        const query = track.isrc
          ? `isrc:${track.isrc}`
          : `track:${track.name} artist:${track.artist}`;

        console.log('Search query:', query);

        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            query
          )}&type=track&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${freshToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to search Spotify track:', errorText);
          return null;
        }

        const data = await response.json();
        const uri = data.tracks.items[0]?.uri;
        if (uri) {
          console.log(`✓ Found track: ${uri}`);
        } else {
          console.warn(
            `✗ No match found for: ${track.name} by ${track.artist}`
          );
        }
        return uri;
      })
    );

    const validTrackUris = trackUris.filter(Boolean);
    console.log(
      `Found ${validTrackUris.length}/${tracks.length} tracks on Spotify`
    );

    if (validTrackUris.length === 0) {
      console.warn('No tracks were found to add to the playlist');
      return;
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: validTrackUris,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to add tracks to playlist:', errorText);
      throw new Error('Failed to add tracks to Spotify playlist');
    }

    console.log('Successfully added tracks to Spotify playlist');
    return response.json();
  } else {
    const trackIds = await Promise.all(
      tracks.map(async (track, index) => {
        await delay(1000);
        return retryWithBackoff(async () => {
          console.log(`[${index + 1}/${tracks.length}] Searching for track:`, {
            name: track.name,
            artist: track.artist,
            isrc: track.isrc,
          });

          const query = encodeURIComponent(`${track.name} ${track.artist}`);
          const response = await fetch(
            `https://api.music.apple.com/v1/catalog/us/search?term=${query}&types=songs&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
                'Music-User-Token': token,
              },
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to search Apple Music track:', errorText);
            throw new Error(errorText);
          }

          const data = await response.json();
          const songId = data.results?.songs?.data?.[0]?.id;

          if (songId) {
            console.log(`✓ Found track: ${songId}`);
          } else {
            console.warn(
              `✗ No match found for: ${track.name} by ${track.artist}`
            );
          }
          return songId;
        });
      })
    );

    const validTrackIds = trackIds.filter(Boolean);
    console.log(
      `Found ${validTrackIds.length}/${tracks.length} tracks on Apple Music`
    );

    if (validTrackIds.length === 0) {
      console.warn('No tracks were found to add to the playlist');
      return;
    }

    return retryWithBackoff(async () => {
      const response = await fetch(
        `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            'Music-User-Token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: validTrackIds.map((id) => ({
              id,
              type: 'songs',
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          'Failed to add tracks to Apple Music playlist:',
          errorText
        );
        throw new Error('Failed to add tracks to Apple Music playlist');
      }

      console.log('Successfully added tracks to Apple Music playlist');
      return { success: true };
    });
  }
}

export async function transferAlbum({
  sourceService,
  destinationService,
  album,
  sourceToken,
  targetToken,
  onProgress,
  userId,
}: TransferAlbumParams): Promise<void> {
  let transferId: string;
  try {
    const freshToken = await ensureFreshToken(
      destinationService,
      targetToken,
      userId
    );

    onProgress?.({
      stage: 'fetching',
      progress: 0,
      message: 'Getting album details...',
    });

    // Get track count from source service
    let trackCount = 0;
    try {
      const tracks = await getAlbumTracks(sourceService, album.id, sourceToken, userId);
      trackCount = tracks.length;
    } catch (error) {
      console.error('Failed to get track count:', error);
      // Continue with transfer even if we can't get track count
    }

    // Create transfer record
    transferId = await createTransfer(userId, sourceService, destinationService, {
      type: 'album',
      sourceAlbumId: album.id,
      sourceAlbumName: album.name,
      tracksCount: trackCount
    });

    onProgress?.({
      stage: 'searching',
      progress: 25,
      message: 'Searching for album...',
    });

    // Search for the album in the target service
    const searchQuery = `${album.name} ${album.artist_name}`;
    const albumQuery = album.name;
    const artistQuery = album.artist_name;
    let targetAlbumId: string | null = null;

    try {
      if (destinationService === 'spotify') {
        const result = await searchSpotifyAlbum(searchQuery, freshToken);
        targetAlbumId = result?.id || null;
      } else {
        const result = await searchAppleMusicAlbum(
          albumQuery,
          artistQuery,
          freshToken
        );
        targetAlbumId = result?.id || null;
      }
    } catch (error) {
      const errorMessage = 'Failed to find album in target service';
      console.error(errorMessage, error);
      await updateTransferStatus(transferId, 'failed', errorMessage);
      throw new Error(errorMessage);
    }

    if (!targetAlbumId) {
      const errorMessage = 'Album not found in target service';
      await updateTransferStatus(transferId, 'failed', errorMessage);
      throw new Error(errorMessage);
    }

    onProgress?.({
      stage: 'adding',
      progress: 50,
      message: 'Adding album to your library...',
    });

    // Add the album to the user's library
    try {
      if (destinationService === 'spotify') {
        await addSpotifyAlbumToLibrary(targetAlbumId, freshToken);
      } else {
        await addAppleMusicAlbumToLibrary(targetAlbumId, freshToken);
      }
    } catch (error) {
      const errorMessage = 'Failed to add album to library';
      console.error(errorMessage, error);
      await updateTransferStatus(transferId, 'failed', errorMessage);
      throw new Error(errorMessage);
    }

    // Update transfer record with target album ID and mark as success
    await supabase
      .from('transfers')
      .update({
        metadata: {
          type: 'album',
          sourceAlbumId: album.id,
          sourceAlbumName: album.name,
          targetAlbumId: targetAlbumId,
          tracksCount: trackCount
        },
        status: 'success',
        completed_at: new Date().toISOString()
      })
      .eq('id', transferId);

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Album transfer complete!',
    });
  } catch (error) {
    console.error('Album transfer error:', error);
    throw error;
  }
}

async function getAlbumTracks(
  service: 'spotify' | 'apple-music',
  albumId: string,
  token: string,
  userId: string
): Promise<Track[]> {
  const freshToken = await ensureFreshToken(service, token, userId);

  if (service === 'spotify') {
    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${freshToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch album tracks from Spotify');
    }

    const data = await response.json();
    return data.items.map((track: any) => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album?.name || '',
      isrc: track.external_ids?.isrc,
    }));
  } else {
    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/albums/${albumId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
          'Music-User-Token': freshToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch album tracks from Apple Music');
    }

    const data = await response.json();
    return data.data.map((track: any) => ({
      name: track.attributes.name,
      artist: track.attributes.artistName,
      album: track.attributes.albumName,
      isrc: track.attributes.isrc,
    }));
  }
}

async function addTracksToLibrary(
  service: 'spotify' | 'apple-music',
  tracks: Track[],
  token: string,
  onProgress?: (current: number) => void
) {
  const freshToken = await ensureFreshToken(service, token, userId);
  let addedCount = 0;

  if (service === 'spotify') {
    // Spotify allows adding tracks in batches
    const trackUris = await Promise.all(
      tracks.map(async (track) => {
        try {
          const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
              `isrc:${track.isrc}`
            )}&type=track&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${freshToken}`,
              },
            }
          );

          if (!searchResponse.ok) {
            throw new Error('Failed to search track on Spotify');
          }

          const searchData = await searchResponse.json();
          const spotifyTrack = searchData.tracks.items[0];

          if (spotifyTrack) {
            return spotifyTrack.uri;
          }

          // Fallback to name + artist search if ISRC search fails
          const fallbackResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(
              `track:${track.name} artist:${track.artist}`
            )}&type=track&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${freshToken}`,
              },
            }
          );

          if (!fallbackResponse.ok) {
            throw new Error('Failed to search track on Spotify');
          }

          const fallbackData = await fallbackResponse.json();
          return fallbackData.tracks.items[0]?.uri;
        } catch (error) {
          console.error(`Failed to find track: ${track.name}`, error);
          return null;
        }
      })
    );

    const validTrackUris = trackUris.filter(Boolean);

    // Add tracks in batches of 50
    for (let i = 0; i < validTrackUris.length; i += 50) {
      const batch = validTrackUris.slice(i, i + 50);
      const response = await fetch('https://api.spotify.com/v1/me/tracks', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: batch,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tracks to Spotify library');
      }

      addedCount += batch.length;
      onProgress?.(addedCount);
      await delay(1000); // Rate limiting
    }
  } else {
    // Apple Music requires adding tracks one by one
    for (const track of tracks) {
      try {
        const searchResponse = await fetch(
          `https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${track.isrc}`,
          {
            headers: {
              Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
              'Music-User-Token': freshToken,
            },
          }
        );

        if (!searchResponse.ok) {
          throw new Error('Failed to search track on Apple Music');
        }

        const searchData = await searchResponse.json();
        const appleMusicTrack = searchData.data[0];

        if (appleMusicTrack) {
          const response = await fetch(
            'https://api.music.apple.com/v1/me/library',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${APPLE_DEVELOPER_TOKEN}`,
                'Music-User-Token': freshToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: [
                  {
                    id: appleMusicTrack.id,
                    type: 'songs',
                  },
                ],
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to add track to Apple Music library');
          }

          addedCount++;
          onProgress?.(addedCount);
          await delay(1000); // Rate limiting
        }
      } catch (error) {
        console.error(`Failed to add track: ${track.name}`, error);
      }
    }
  }
}

export async function createTransfer(
  userId: string,
  sourceService: ServiceType,
  destinationService: ServiceType,
  metadata?: Record<string, any>
): Promise<string> {
  const { data, error } = await supabase
    .from('transfers')
    .insert({
      user_id: userId,
      source_service: sourceService,
      destination_service: destinationService,
      status: 'pending',
      created_at: new Date().toISOString(),
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateTransferStatus(
  transferId: string,
  status: Transfer['status'],
  error?: string
) {
  const { data, error: updateError } = await supabase
    .from('transfers')
    .update({
      status,
      error,
      ...(status === 'success' || status === 'failed'
        ? { completed_at: new Date().toISOString() }
        : {}),
    })
    .eq('id', transferId)
    .select()
    .single();

  if (updateError) throw updateError;
  return data;
}

export async function getRecentTransfers(userId: string) {
  const { data, error } = await supabase
    .from('transfers')
    .select(
      `
      *,
      source_playlist:source_playlist_id (*),
      target_playlist:target_playlist_id (*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}
