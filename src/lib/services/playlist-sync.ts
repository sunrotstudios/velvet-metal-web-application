import { supabase } from '@/lib/supabase';
import { getSpotifyPlaylistTracks, addTracksToSpotifyPlaylist, removeTracksFromSpotifyPlaylist } from '@/lib/api/spotify';
import { getAppleMusicPlaylistTracks, addTracksToAppleMusicPlaylist, removeTracksFromAppleMusicPlaylist } from '@/lib/api/apple-music';

type ServiceType = 'spotify' | 'apple-music';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  isrc?: string;
}

export async function syncPlaylistChanges(
  userId: string,
  sourcePlaylistId: string,
  sourceService: ServiceType,
  targetPlaylistId: string,
  targetService: ServiceType
) {
  try {
    // Get access tokens for both services
    const { data: tokens } = await supabase
      .from('user_services')
      .select('service, access_token')
      .eq('user_id', userId)
      .in('service', [sourceService, targetService]);

    if (!tokens) throw new Error('Could not find service tokens');

    const sourceToken = tokens.find(t => t.service === sourceService)?.access_token;
    const targetToken = tokens.find(t => t.service === targetService)?.access_token;

    if (!sourceToken || !targetToken) {
      throw new Error('Missing access tokens');
    }

    // Get tracks from both playlists
    const sourceTracks = await getPlaylistTracks(sourceService, sourceToken, sourcePlaylistId);
    const targetTracks = await getPlaylistTracks(targetService, targetToken, targetPlaylistId);

    // Find differences
    const tracksToAdd = findMissingTracks(sourceTracks, targetTracks);
    const tracksToRemove = findMissingTracks(targetTracks, sourceTracks);

    // Apply changes to target playlist
    if (tracksToAdd.length > 0) {
      await addTracksToPlaylist(targetService, targetToken, targetPlaylistId, tracksToAdd);
    }

    if (tracksToRemove.length > 0) {
      await removeTracksFromPlaylist(targetService, targetToken, targetPlaylistId, tracksToRemove);
    }

    // Update last synced timestamp
    await supabase
      .from('playlist_sync_pairs')
      .update({
        last_synced_at: new Date().toISOString(),
        error_count: 0,
        last_error: null,
        last_error_at: null,
      })
      .eq('source_playlist_id', sourcePlaylistId)
      .eq('target_playlist_id', targetPlaylistId);

    return { tracksAdded: tracksToAdd.length, tracksRemoved: tracksToRemove.length };
  } catch (error) {
    // Update error status
    await supabase
      .from('playlist_sync_pairs')
      .update({
        error_count: supabase.sql`error_count + 1`,
        last_error: error instanceof Error ? error.message : 'Unknown error',
        last_error_at: new Date().toISOString(),
      })
      .eq('source_playlist_id', sourcePlaylistId)
      .eq('target_playlist_id', targetPlaylistId);

    throw error;
  }
}

async function getPlaylistTracks(
  service: ServiceType,
  token: string,
  playlistId: string
): Promise<Track[]> {
  switch (service) {
    case 'spotify':
      return getSpotifyPlaylistTracks(token, playlistId);
    case 'apple-music':
      return getAppleMusicPlaylistTracks(token, playlistId);
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
}

async function addTracksToPlaylist(
  service: ServiceType,
  token: string,
  playlistId: string,
  tracks: Track[]
) {
  switch (service) {
    case 'spotify':
      return addTracksToSpotifyPlaylist(token, playlistId, tracks);
    case 'apple-music':
      return addTracksToAppleMusicPlaylist(token, playlistId, tracks);
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
}

async function removeTracksFromPlaylist(
  service: ServiceType,
  token: string,
  playlistId: string,
  tracks: Track[]
) {
  switch (service) {
    case 'spotify':
      return removeTracksFromSpotifyPlaylist(token, playlistId, tracks);
    case 'apple-music':
      return removeTracksFromAppleMusicPlaylist(token, playlistId, tracks);
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
}

function findMissingTracks(sourceTracks: Track[], targetTracks: Track[]): Track[] {
  return sourceTracks.filter(sourceTrack => {
    // First try to match by ISRC (most accurate)
    if (sourceTrack.isrc) {
      return !targetTracks.some(t => t.isrc === sourceTrack.isrc);
    }
    
    // Fall back to matching by name and artist
    return !targetTracks.some(
      t =>
        t.name.toLowerCase() === sourceTrack.name.toLowerCase() &&
        t.artist.toLowerCase() === sourceTrack.artist.toLowerCase()
    );
  });
}

// Set up real-time sync using Supabase Edge Functions
export async function setupPlaylistSyncListener() {
  const channel = supabase
    .channel('playlist-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'playlist_sync_pairs',
      },
      async (payload) => {
        if (!payload.new || !payload.new.sync_enabled) return;

        const { user_id, source_playlist_id, source_service, target_playlist_id, target_service } =
          payload.new;

        await syncPlaylistChanges(
          user_id,
          source_playlist_id,
          source_service,
          target_playlist_id,
          target_service
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
