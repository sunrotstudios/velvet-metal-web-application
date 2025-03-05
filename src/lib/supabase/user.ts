import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';

export async function getUserServices(userId: string): Promise<ServiceType[]> {
  const { data, error } = await supabase
    .from('user_services')
    .select('service')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(row => row.service);
}

export async function syncLibrary(userId: string, service: ServiceType): Promise<void> {
  // First update sync status to in progress
  await supabase
    .from('user_services')
    .update({ 
      sync_in_progress: true,
      synced_at: null 
    })
    .eq('user_id', userId)
    .eq('service', service);

  try {
    // Trigger sync based on service type
    if (service === 'spotify') {
      await fetch('/api/library/spotify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } else if (service === 'apple-music') {
      await fetch('/api/library/apple-music/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } else if (service === 'tidal') {
      await fetch('/api/library/tidal/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    }
  } catch (error) {
    // Reset sync status on error
    await supabase
      .from('user_services')
      .update({
        sync_in_progress: false,
        synced_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('service', service);
    throw error;
  }
}