import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QueryKeys } from './constants';
import { AuthUser } from '@/lib/supabase';
import { handleQueryError, handleMutationError } from './errors';

export function useUser(userId?: string) {
  return useQuery({
    queryKey: QueryKeys.user.root,
    queryFn: async () => {
      try {
        if (!userId) return null;
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user as AuthUser;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // Consider user data fresh for 30 minutes
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { 
      userId: string; 
      updates: { display_name?: string; avatar?: string; }
    }) => {
      try {
        const { error } = await supabase.auth.updateUser({
          data: updates
        });

        if (error) throw error;
      } catch (error) {
        handleMutationError(error, 'Failed to update profile');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.user.root });
    },
  });
}