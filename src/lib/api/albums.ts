import { supabase } from '@/lib/supabase';

export async function getUniqueAlbumsCount(userId: string) {
  const { data, error } = await supabase
    .rpc('count_unique_albums', { user_id_param: userId });

  if (error) {
    console.error('Error fetching unique albums count:', error);
    throw error;
  }

  return data || 0;
}
