import { syncSpotifyLibrary } from '@/lib/services/spotify-library';
import { syncAppleMusicLibrary } from '@/lib/services/apple-music-library';
import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';

interface LibraryItem {
  id: string;
  name: string;
  artist: string;
  type: 'album' | 'playlist' | 'track';
  addedAt: string;
  service: ServiceType;
}

export async function updateUserLibrary(userId: string, items: LibraryItem[]) {
  const { data: existingItems, error: fetchError } = await supabase
    .from('user_library_items')
    .select('id, service')
    .eq('user_id', userId);

  if (fetchError) {
    console.error('Error fetching existing library items:', fetchError);
    throw fetchError;
  }

  // Find new items
  const existingIds = new Set(existingItems?.map(item => item.id));
  const newItems = items.filter(item => !existingIds.has(item.id));

  if (newItems.length > 0) {
    const { error: insertError } = await supabase
      .from('user_library_items')
      .insert(newItems.map(item => ({
        user_id: userId,
        ...item
      })));

    if (insertError) {
      console.error('Error inserting new library items:', insertError);
      throw insertError;
    }
  }

  return newItems;
}

export async function syncUserLibraries(userId: string, service: ServiceType) {
  try {
    console.log(`Starting library sync for user ${userId} and service ${service}`);

    // Get service connection info
    const { data: serviceConnection, error: connectionError } = await supabase
      .from('user_services')
      .select('*')
      .eq('user_id', userId)
      .eq('service', service)
      .single();

    if (connectionError || !serviceConnection) {
      throw new Error(`No service connection found for ${service}`);
    }

    let libraryItems = [];
    if (service === 'spotify') {
      libraryItems = await syncSpotifyLibrary(userId, serviceConnection.access_token);
    } else if (service === 'apple-music') {
      libraryItems = await syncAppleMusicLibrary(userId);
    }

    // Store library items in database
    await updateUserLibrary(userId, libraryItems);

    console.log(`Library sync completed for ${service}`);
  } catch (error) {
    console.error(`Library sync failed for ${service}:`, error);
    throw error;
  }
}
