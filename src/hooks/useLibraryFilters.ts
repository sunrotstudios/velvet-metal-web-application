import { ServiceType, ViewMode } from '@/lib/types';
import { useState, useEffect } from 'react';

interface LibraryFilters {
  activeService: ServiceType;
  viewMode: ViewMode;
  sortBy: string;
  activeTab: 'albums' | 'playlists';
  albumTypeFilter: 'all' | 'album' | 'single' | 'ep';
}

const defaultFilters: LibraryFilters = {
  activeService: 'spotify',
  viewMode: 'grid',
  sortBy: 'name-asc',
  activeTab: 'albums',
  albumTypeFilter: 'all',
};

export function useLibraryFilters() {
  // Initialize state from localStorage or defaults
  const [filters, setFilters] = useState<LibraryFilters>(() => {
    const savedFilters = localStorage.getItem('libraryFilters');
    return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
  });

  // Save to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem('libraryFilters', JSON.stringify(filters));
  }, [filters]);

  const updateFilters = (updates: Partial<LibraryFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  return {
    filters,
    updateFilters,
    setActiveService: (service: ServiceType) => updateFilters({ activeService: service }),
    setViewMode: (mode: ViewMode) => updateFilters({ viewMode: mode }),
    setSortBy: (sort: string) => updateFilters({ sortBy: sort }),
    setActiveTab: (tab: 'albums' | 'playlists') => updateFilters({ activeTab: tab }),
    setAlbumTypeFilter: (filter: 'all' | 'album' | 'single' | 'ep') => 
      updateFilters({ albumTypeFilter: filter }),
  };
}
