import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QueryKeys } from './constants';
import { ServiceType } from '@/lib/types';
import { handleMutationError, handleQueryError } from './errors';

interface ServiceSyncStatus {
  synced_at: string | null;
  sync_in_progress: boolean;
}

export function useServiceConnection(userId: string | undefined, service: ServiceType) {
  return useQuery({
    queryKey: QueryKeys.services.connected(userId || ''),
    queryFn: async () => {
      try {
        if (!userId) return false;
        
        const { data, error } = await supabase
          .from('user_services')
          .select('service')
          .eq('user_id', userId)
          .eq('service', service);
        
        if (error) throw error;
        
        // If we have data and it's not empty, the service is connected
        return data && data.length > 0;
      } catch (error) {
        // Log the error but return false to indicate no connection
        console.error('Error checking service connection:', error);
        return false;
      }
    },
    enabled: !!userId,
  });
}

export function useInitiateSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, service }: { userId: string; service: ServiceType }) => {
      try {
        const { error } = await supabase
          .from('user_services')
          .update({ 
            sync_in_progress: true,
            synced_at: null 
          })
          .eq('user_id', userId)
          .eq('service', service);

        if (error) throw error;
        
        // Initiate sync with API
        const response = await fetch(`/api/library/${service}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to initiate sync');
        }
      } catch (error) {
        handleMutationError(error, 'Failed to initiate library sync');
        throw error;
      }
    },
    onSuccess: (_, { userId, service }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.services.sync(service, userId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.library.stored(service) });
    },
  });
}