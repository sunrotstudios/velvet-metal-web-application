import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "./constants";

export function invalidateUserQueries(queryClient: QueryClient, userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QueryKeys.user.root }),
    queryClient.invalidateQueries({ queryKey: QueryKeys.user.services(userId) }),
    queryClient.invalidateQueries({ queryKey: QueryKeys.user.stats(userId) }),
  ]);
}

export function invalidateServiceQueries(
  queryClient: QueryClient,
  userId: string,
  service: string
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: QueryKeys.services.sync(service, userId) }),
    queryClient.invalidateQueries({ queryKey: QueryKeys.library.stored(service) }),
  ]);
}

export function prefetchUserData(queryClient: QueryClient, userId: string) {
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: QueryKeys.user.services(userId),
      queryFn: () => fetch(`/api/user/${userId}/services`).then(r => r.json()),
    }),
    queryClient.prefetchQuery({
      queryKey: QueryKeys.user.stats(userId),
      queryFn: () => fetch(`/api/user/${userId}/stats`).then(r => r.json()),
    }),
  ]);
}