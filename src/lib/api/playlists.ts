import { supabase } from '@/lib/supabase';

export async function getUniquePlaylists(userId: string) {
  const { data, error } = await supabase
    .rpc('count_unique_playlists', { user_id_param: userId });

  if (error) {
    console.error('Error fetching unique playlists count:', error);
    throw error;
  }

  return data || 0;
}
