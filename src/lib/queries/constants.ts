import { ServiceType, LibraryContentType } from "@/lib/types";

export const QueryKeys = {
  user: {
    root: ['user'] as const,
    services: (userId: string) => ['user', userId, 'services'] as const,
    stats: (userId: string) => ['user', userId, 'stats'] as const,
  },
  library: {
    root: ['library'] as const,
    stored: (service: ServiceType) => ['storedLibrary', service] as const,
    paginated: (
      service: ServiceType,
      contentType: LibraryContentType, 
      sortField: string, 
      sortDirection: string, 
      search: string
    ) => ['library', 'paginated', service, contentType, sortField, sortDirection, search] as const,
    sync: (userId: string, service: string) => ['library', userId, service, 'sync'] as const,
    stats: (userId: string) => ['library', 'stats', userId] as const,
  },
  services: {
    root: ['services'] as const,
    connected: (userId: string) => ['services', userId, 'connected'] as const,
    sync: (service: ServiceType, userId: string) => ['services', 'sync', service, userId] as const,
    connection: (service: ServiceType, userId: string) => ['services', 'connection', service, userId] as const,
  },
} as const;