import { ExportLibraryDialog } from '@/components/ExportLibraryDialog';
import { AlbumCard } from '@/components/Library/AlbumCard';
import { PlaylistCard } from '@/components/Library/PlaylistCard';
import { LibrarySkeleton } from '@/components/LibrarySkeleton';
import { TransferPlaylistModal } from '@/components/TransferPlaylistModal';
import { Tabs } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { useDebounce } from '@/hooks/useDebounce';
import { useFilters } from '@/hooks/useFilters';
import pb from '@/lib/pocketbase';
import { getStoredLibrary, syncLibrary } from '@/lib/services';
import { Playlist, ServiceType, ViewMode } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlbumsTab } from './components/AlbumsTab';
import { Controls } from './components/Controls';
import { Header } from './components/Header';
import { PlaylistsTab } from './components/PlaylistsTab';

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeService, setActiveService] = useState<ServiceType>('spotify');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [activeTab, setActiveTab] = useState<'albums' | 'playlists'>('albums');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized components
  const MemoizedAlbumCard = memo(AlbumCard);
  const MemoizedPlaylistCard = memo(PlaylistCard);

  // Get user services and check connection
  const { data: userServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const record = await pb.collection('users').getOne(user.id);
      return record.connectedServices || [];
    },
    enabled: !!user,
  });

  const isServiceConnected = userServices?.some(
    (service: any) => service.id === activeService && service.connected
  );
  // Get Stored Library
  const { data, isLoading, isError } = useQuery({
    queryKey: ['storedLibrary', activeService],
    queryFn: async () => {
      try {
        const data = await getStoredLibrary(user!.id, activeService);
        console.log('Stored Library Data:', data);
        return data;
      } catch (error) {
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
    enabled: !!activeService && !!user && isServiceConnected,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    select: (data) => {
      const processed = {
        albums: Array.isArray(data.albums)
          ? data.albums
          : data.albums?.items || data.albums?.data || [],
        playlists: Array.isArray(data.playlists)
          ? data.playlists
          : data.playlists?.items || data.playlists?.data || [],
        lastSynced: data.lastSynced,
      };
      return processed;
    },
  });

  const { filteredAlbums, filteredPlaylists } = useFilters(
    data?.albums || [],
    data?.playlists || [],
    debouncedSearchQuery,
    sortBy
  );
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
  const handleTransfer = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsTransferModalOpen(true);
  };

  if (!isServiceConnected) {
    return <LibrarySkeleton />;
  }

  return (
    <>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <Header activeService={activeService} onRefresh={handleManualRefresh} />

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
          />

          <AlbumsTab
            isLoading={isLoading}
            isError={isError}
            albums={data?.albums || []}
            filteredAlbums={filteredAlbums}
            viewMode={viewMode}
            ItemComponent={MemoizedAlbumCard}
          />

          <PlaylistsTab
            isLoading={isLoading}
            isError={isError}
            playlists={data?.playlists || []}
            filteredPlaylists={filteredPlaylists}
            viewMode={viewMode}
            ItemComponent={MemoizedPlaylistCard}
            onTransfer={handleTransfer}
          />
        </Tabs>
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
          onTransferComplete={() => {
            setSelectedPlaylist(null);
            queryClient.invalidateQueries(['storedLibrary']);
          }}
        />
      )}
    </>
  );
}
