import { useQuery } from '@tanstack/react-query';
import { getUserServices } from '@/lib/services/auth';
import { useAuth } from '@/contexts/auth-context';

export function useConnectedServices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['connected-services', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return getUserServices(user.id);
    },
    enabled: !!user,
  });
}
