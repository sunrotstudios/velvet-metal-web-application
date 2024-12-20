import { NormalizedAlbum, NormalizedPlaylist } from '@/lib/types';
import { useMemo } from 'react';

export const useFilters = (
  albums: NormalizedAlbum[],
  playlists: NormalizedPlaylist[],
  debouncedSearchQuery: string,
  sortBy: string,
  albumTypeFilter?: 'all' | 'album' | 'single' | 'ep'
) => {
  const sortFunction = (
    a: NormalizedAlbum,
    b: NormalizedAlbum,
    key: string,
    order: string
  ) => {
    let aValue = '';
    let bValue = '';

    if (key === 'name') {
      aValue = a?.name?.toLowerCase() ?? '';
      bValue = b?.name?.toLowerCase() ?? '';
    } else if (key === 'artist') {
      aValue = a?.artistName?.toLowerCase() ?? '';
      bValue = b?.artistName?.toLowerCase() ?? '';
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  };

  const normalizedPlaylists = useMemo(() => {
    if (!playlists) return [];
    // Filter out any null or undefined playlists
    return playlists.filter(
      (playlist): playlist is NormalizedPlaylist =>
        playlist != null && typeof playlist === 'object' && 'name' in playlist
    );
  }, [playlists]);

  const filteredAlbums = useMemo(() => {
    // Filter out any null or undefined albums
    const validAlbums = albums.filter((album): album is NormalizedAlbum => {
      const isValid =
        album != null &&
        typeof album === 'object' &&
        'name' in album &&
        'artistName' in album;

      if (!isValid) {
        console.log('Invalid album:', album);
      }
      return isValid;
    });

    let result = validAlbums;

    // Apply album type filter
    if (albumTypeFilter && albumTypeFilter !== 'all') {
      result = result.filter((album) => {
        const normalizedAlbumType = String(album.albumType).toLowerCase();
        const normalizedFilterType = String(albumTypeFilter).toLowerCase();
        const matches = normalizedAlbumType === normalizedFilterType;

        return matches;
      });
    }

    if (debouncedSearchQuery) {
      result = result.filter(
        (album) =>
          album.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          album.artistName
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase())
      );
    }

    if (sortBy) {
      const [key, order] = sortBy.split('-');
      result = [...result].sort((a, b) => sortFunction(a, b, key, order));
    }

    return result;
  }, [albums, debouncedSearchQuery, sortBy, albumTypeFilter]);

  const filteredPlaylists = useMemo(() => {
    let result = normalizedPlaylists;

    if (debouncedSearchQuery) {
      result = result.filter((playlist) =>
        playlist?.name
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())
      );
    }

    if (sortBy) {
      const [key, order] = sortBy.split('-');
      result = [...result].sort((a, b) => {
        const aValue = a?.name?.toLowerCase() ?? '';
        const bValue = b?.name?.toLowerCase() ?? '';
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [normalizedPlaylists, debouncedSearchQuery, sortBy]);

  return {
    filteredAlbums,
    filteredPlaylists,
  };
};
