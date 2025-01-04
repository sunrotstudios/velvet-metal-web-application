import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { useDebounce } from '@/hooks/useDebounce';
import { getStoredLibrary, syncLibrary } from '@/lib/services';
import { getUserServices } from '@/lib/services/streaming-auth';
import { Playlist, ServiceType, ViewMode } from '@/lib/types';
import { LibrarySkeleton } from '@/pages/Library/components/LibrarySkeleton';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { ExportLibraryDialog } from '@/shared/modals/ExportLibraryDialog';
import { TransferPlaylistModal } from '@/shared/modals/PlaylistTransferModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { memo, useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AlbumCard } from './components/Albums/AlbumCard';
import { AlbumsTab } from './components/AlbumsTab';
import { Controls } from './components/Controls';
import { Header } from './components/Header';
import { MobileLibrary } from './components/MobileLibrary';
import { PlaylistCard } from './components/Playlists/PlaylistCard';
import { PlaylistsTab } from './components/PlaylistsTab';
import { motion } from 'framer-motion';

export default function Library() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const playlistsTabRef = useRef(null);
  const albumsTabRef = useRef(null);

  // Store current params in session storage when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentParams = Object.fromEntries(searchParams.entries());
      sessionStorage.setItem('libraryParams', JSON.stringify(currentParams));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [searchParams]);

  // Restore params from session storage or location state
  useEffect(() => {
    const state = location.state as { previousParams?: Record<string, string> } | null;
    if (state?.previousParams) {
      setSearchParams(state.previousParams);
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      const storedParams = sessionStorage.getItem('libraryParams');
      if (storedParams) {
        setSearchParams(JSON.parse(storedParams));
        sessionStorage.removeItem('libraryParams');
      }
    }
  }, [location]);

  // Get filter values from URL params with defaults
  const activeService = (searchParams.get('service') as ServiceType) || 'spotify';
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
  const sortBy = searchParams.get('sort') || 'name-asc';
  const activeTab = (searchParams.get('tab') as 'albums' | 'playlists') || 'albums';
  const albumTypeFilter = (searchParams.get('albumType') as 'all' | 'album' | 'single' | 'ep') || 'all';

  // Update URL params handlers
  const setActiveService = (service: ServiceType) => {
    setSearchParams(prev => {
      prev.set('service', service);
      return prev;
    });
  };

  const setViewMode = (mode: ViewMode) => {
    setSearchParams(prev => {
      prev.set('view', mode);
      return prev;
    });
  };

  const setSortBy = (sort: string) => {
    setSearchParams(prev => {
      prev.set('sort', sort);
      return prev;
    });
  };

  const setActiveTab = (tab: 'albums' | 'playlists') => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    });
  };

  const setAlbumTypeFilter = (type: 'all' | 'album' | 'single' | 'ep') => {
    setSearchParams(prev => {
      prev.set('albumType', type);
      return prev;
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized components
  const MemoizedAlbumCard = memo(AlbumCard);
  const MemoizedPlaylistCard = memo(PlaylistCard);

  const filterItems = (items: any[], query: string, sort: string, type?: string) => {
    let filtered = items;

    // Filter by search query
    if (query) {
      filtered = items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by album type if applicable
    if (type && type !== 'all') {
      filtered = filtered.filter(item => item.album_type === type);
    }

    // Sort items
    filtered.sort((a, b) => {
      const [field, direction] = sort.split('-');
      const aValue = a[field]?.toLowerCase() || '';
      const bValue = b[field]?.toLowerCase() || '';
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return filtered;
  };

  // Get user services and check connection
  const { data: userServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: async () => {
      console.log('Fetching Services for User:', user?.id);
      if (!user) return [];
      const services = await getUserServices(user.id);
      console.log('User Services:', services);
      return services;
    },
    enabled: !!user,
  });

  const isServiceConnected = userServices?.includes(activeService);

  // Get Stored Library
  const { data, isLoading, isError } = useQuery({
    queryKey: ['storedLibrary', activeService],
    queryFn: async () => {
      try {
        console.log('Fetching Library for Service:', activeService);
        const data = await getStoredLibrary(user!.id, activeService);

        return data;
      } catch (error) {
        console.error('Error fetching library:', error);
        if (error.status === 404) {
          return {
            albums: [],
            playlists: [],
            lastSynced: null,
          };
        }
        throw error;
      }
    },
    enabled:
      !!activeService && !!user && !!isServiceConnected && !servicesLoading,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    select: (data) => {
      const processed = {
        albums: Array.isArray(data.albums)
          ? data.albums.map((album) => ({
              ...album,
              name: album.name || '',
              artistName: album.artist_name || '',
              albumType: album.album_type?.toLowerCase() || 'album',
              artwork: {
                url: album.image_url,
                width: null,
                height: null,
              },
              trackCount: album.tracks_count || 0,
            }))
          : [],
        playlists: Array.isArray(data.playlists)
          ? data.playlists.map((playlist) => ({
              ...playlist,
              name: playlist.name || '',
              description: playlist.description || '',
              tracks: {
                total: playlist.tracks_count || 0,
                href: null,
              },
              artwork: {
                url: playlist.image_url,
                width: null,
                height: null,
              },
            }))
          : [],
        lastSynced: data.lastSynced,
      };

      return processed;
    },
  });

  const filteredAlbums = filterItems(data?.albums || [], debouncedSearchQuery, sortBy, albumTypeFilter);
  const filteredPlaylists = filterItems(data?.playlists || [], debouncedSearchQuery, sortBy);

  const handleManualRefresh = async () => {
    try {
      const accessToken = localStorage.getItem(
        activeService === 'spotify'
          ? 'spotify_access_token'
          : 'apple_music_token'
      );
      const refreshToken = localStorage.getItem('spotify_refresh_token');

      if (!isServiceConnected) {
        toast.error(
          `Please connect your ${
            activeService === 'spotify' ? 'Spotify' : 'Apple Music'
          } account first`
        );
        navigate('/');
        return;
      }

      if (activeService === 'spotify' && (!accessToken || !refreshToken)) {
        toast.error('Please reconnect your Spotify account');
        navigate('/');
        return;
      }

      if (activeService === 'apple-music' && !accessToken) {
        toast.error('Please reconnect your Apple Music account');
        navigate('/');
        return;
      }

      await syncLibrary(user!.id, activeService);
      queryClient.invalidateQueries(['storedLibrary', activeService]);
      toast.success('Library refreshed successfully!');
    } catch (error) {
      console.error('Failed to refresh library:', error);
      if (error instanceof Error && error.message.includes('token')) {
        toast.error(
          `Please reconnect your ${
            activeService === 'spotify' ? 'Spotify' : 'Apple Music'
          } account`
        );
        navigate('/');
      } else {
        toast.error('Failed to refresh library. Please try again.');
      }
    }
  };

  const handleAlbumTypeChange = (
    albumType: 'all' | 'album' | 'single' | 'ep'
  ) => {
    setAlbumTypeFilter(albumType);
    toast.info(`Showing ${albumType} albums`);
  };

  const handleTransfer = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsTransferModalOpen(true);
  };

  const handleToggleSelection = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      if (activeTab === 'playlists' && playlistsTabRef.current) {
        playlistsTabRef.current.deselectAll();
      } else if (activeTab === 'albums' && albumsTabRef.current) {
        albumsTabRef.current.deselectAll();
      }
    }
  };

  if (!isServiceConnected) {
    return <LibrarySkeleton />;
  }

  return (
    <ResponsiveContainer
      mobileContent={
        <MobileLibrary
          isLoading={isLoading}
          isError={isError}
          albums={filteredAlbums}
          playlists={filteredPlaylists}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeService={activeService}
          setActiveService={setActiveService}
          onTransfer={handleTransfer}
          isSelectionMode={isSelectionMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          albumTypeFilter={albumTypeFilter}
          setAlbumTypeFilter={setAlbumTypeFilter}
        />
      }
    >
      <div className="flex h-screen flex-col bg-background">
        {/* Fixed Header Section */}
        <div className="flex-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 pb-2"
          >
            <Header
              activeService={activeService}
              onRefresh={handleManualRefresh}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="px-8"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <Controls
                activeService={activeService}
                setActiveService={setActiveService}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onExport={() => setIsExportOpen(true)}
                activeTab={activeTab}
                albumTypeFilter={albumTypeFilter}
                onAlbumTypeChange={handleAlbumTypeChange}
                isSelectionMode={isSelectionMode}
                onToggleSelection={handleToggleSelection}
              />

              {/* Scrollable Content Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex-1 overflow-y-auto pb-8"
              >
                {isError ? (
                  <div className="text-center text-red-500">
                    An error occurred while loading your library. Please try
                    again.
                  </div>
                ) : (
                  <>
                    {activeTab === 'albums' && (
                      <AlbumsTab
                        ref={albumsTabRef}
                        isLoading={isLoading}
                        isError={isError}
                        albums={data?.albums || []}
                        filteredAlbums={filteredAlbums}
                        viewMode={viewMode}
                        ItemComponent={MemoizedAlbumCard}
                        isSelectionMode={isSelectionMode}
                      />
                    )}
                    {activeTab === 'playlists' && (
                      <PlaylistsTab
                        ref={playlistsTabRef}
                        playlists={filteredPlaylists}
                        isLoading={isLoading}
                        viewMode={viewMode}
                        onTransfer={handleTransfer}
                        isSelectionMode={isSelectionMode}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </Tabs>
          </motion.div>
        </div>

        <ExportLibraryDialog
          open={isExportOpen}
          onOpenChange={setIsExportOpen}
          albums={data?.albums || []}
          playlists={data?.playlists || []}
          service={activeService}
        />

        {selectedPlaylist && (
          <TransferPlaylistModal
            open={isTransferModalOpen}
            onOpenChange={setIsTransferModalOpen}
            sourceService={activeService}
            playlist={selectedPlaylist}
            userId={user!.id}
            onTransferComplete={() => {
              setSelectedPlaylist(null);
              queryClient.invalidateQueries(['storedLibrary']);
            }}
          />
        )}
      </div>
    </ResponsiveContainer>
  );
}
