import { useQuery, useMutation, useQueryClient, useInfiniteQuery, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QueryKeys } from "./constants";
import { ServiceType, Album, UserPlaylist, LibraryContentType } from "@/lib/types";
import { handleQueryError } from './errors';
import { getStoredLibrary, getPaginatedLibrary, LibraryData, PaginatedLibraryOptions } from '@/lib/services/library';

export function useLibrary(userId: string | undefined, service: ServiceType) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: QueryKeys.library.stored(service),
    queryFn: async (): Promise<LibraryData> => {
      try {
        if (!userId) throw new Error("User ID is required");
        return await getStoredLibrary(userId, service);
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function usePaginatedLibrary(
  userId: string | undefined, 
  service: ServiceType,
  contentType: LibraryContentType = 'albums',
  options: PaginatedLibraryOptions = {}
) {
  const {
    limit = 50,
    sortField = 'name',
    sortDirection = 'asc',
    search = '',
  } = options;
  
  return useInfiniteQuery({
    queryKey: QueryKeys.library.paginated(service, contentType, sortField, sortDirection, search),
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) throw new Error("User ID is required");
      return getPaginatedLibrary(userId, service, contentType, {
        ...options,
        offset: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage.hasMore) return undefined;
      return lastPageParam + limit;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

// Prefetch helper function to be used in layout or navigation components
export async function prefetchLibraryData(
  queryClient: QueryClient,
  userId: string, 
  service: ServiceType
) {
  // Prefetch basic library data
  await queryClient.prefetchQuery({
    queryKey: QueryKeys.library.stored(service),
    queryFn: async () => getStoredLibrary(userId, service),
  });
  
  // Prefetch first page of paginated albums with default sorting
  await queryClient.prefetchInfiniteQuery({
    queryKey: QueryKeys.library.paginated(service, 'albums', 'name', 'asc', ''),
    queryFn: async ({ pageParam = 0 }) => {
      return getPaginatedLibrary(userId, service, 'albums', {
        offset: pageParam,
        limit: 250, // Load more items initially
      });
    },
    initialPageParam: 0,
  });
  
  // Prefetch first page of paginated playlists
  await queryClient.prefetchInfiniteQuery({
    queryKey: QueryKeys.library.paginated(service, 'playlists', 'name', 'asc', ''),
    queryFn: async ({ pageParam = 0 }) => {
      return getPaginatedLibrary(userId, service, 'playlists', {
        offset: pageParam,
        limit: 250,
      });
    },
    initialPageParam: 0,
  });
  
  // Also prefetch recent sort order for albums as it's commonly used
  await queryClient.prefetchInfiniteQuery({
    queryKey: QueryKeys.library.paginated(service, 'albums', 'added_at', 'desc', ''),
    queryFn: async ({ pageParam = 0 }) => {
      return getPaginatedLibrary(userId, service, 'albums', {
        offset: pageParam,
        limit: 250,
        sortField: 'added_at',
        sortDirection: 'desc',
      });
    },
    initialPageParam: 0,
  });
}

export function useLibraryStats(userId: string | undefined) {
  return useQuery({
    queryKey: QueryKeys.library.root,
    queryFn: async () => {
      try {
        if (!userId) throw new Error("User ID is required");

        const { data, error } = await supabase.rpc('get_library_stats', {
          p_user_id: userId
        });

        if (error) throw error;

        return {
          totalAlbums: data?.total_albums || 0,
          uniqueAlbums: data?.unique_albums || 0,
          totalPlaylists: data?.total_playlists || 0,
          lastSync: data?.last_sync,
        };
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useInitiateLibrarySync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, service }: { userId: string; service: ServiceType }) => {
      const { error } = await supabase.rpc('initiate_library_sync', {
        p_user_id: userId,
        p_service: service,
      });

      if (error) throw error;
    },
    onSuccess: (_, { userId, service }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: QueryKeys.library.stored(service) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.services.sync(service, userId) });
    },
  });
}

// These functions have been moved to useServices.ts to avoid conflicts