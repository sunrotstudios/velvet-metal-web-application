import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Album, Playlist, ServiceType, ViewMode } from '@/lib/types';
import { LayoutGrid, List, Settings2 } from 'lucide-react';
import { memo } from 'react';
import { AlbumCard } from '../components/Albums/AlbumCard';
import { PlaylistCard } from '../components/Playlists/PlaylistCard';

interface MobileLibraryProps {
  isLoading: boolean;
  isError: boolean;
  albums: Album[];
  playlists: Playlist[];
  activeTab: 'albums' | 'playlists';
  setActiveTab: (tab: 'albums' | 'playlists') => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeService: ServiceType;
  setActiveService: (service: ServiceType) => void;
  onTransfer: (playlist: Playlist) => void;
  isSelectionMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  albumTypeFilter: 'all' | 'album' | 'single' | 'ep';
  setAlbumTypeFilter: (type: 'all' | 'album' | 'single' | 'ep') => void;
}

export function MobileLibrary({
  isLoading,
  isError,
  albums,
  playlists,
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  activeService,
  setActiveService,
  onTransfer,
  isSelectionMode,
  searchQuery,
  setSearchQuery,
  albumTypeFilter,
  setAlbumTypeFilter,
}: MobileLibraryProps) {
  const MemoizedAlbumCard = memo(AlbumCard);
  const MemoizedPlaylistCard = memo(PlaylistCard);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Bar with Search and Controls */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-2 p-4">
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="shrink-0"
          >
            {viewMode === 'grid' ? (
              <LayoutGrid className="h-5 w-5" />
            ) : (
              <List className="h-5 w-5" />
            )}
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Settings2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Library Settings</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service</label>
                  <Select
                    value={activeService}
                    onValueChange={(value) =>
                      setActiveService(value as ServiceType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spotify">Spotify</SelectItem>
                      <SelectItem value="apple">Apple Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeTab === 'albums' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Album Type</label>
                    <Select
                      value={albumTypeFilter}
                      onValueChange={(value) =>
                        setAlbumTypeFilter(
                          value as 'all' | 'album' | 'single' | 'ep'
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="album">Albums Only</SelectItem>
                        <SelectItem value="single">Singles Only</SelectItem>
                        <SelectItem value="ep">EPs Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'albums' | 'playlists')}
        className="flex-1 flex flex-col h-full"
      >
        <TabsList className="w-full justify-start px-4 py-2 h-12">
          <TabsTrigger value="albums" className="flex-1">
            Albums
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex-1">
            Playlists
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <LoadingSpinner centered label="Loading your library" />
        ) : isError ? (
          <div className="text-center text-red-500 p-4">
            An error occurred while loading your library. Please try again.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto h-[calc(100vh-13rem)]">
            <TabsContent
              value="albums"
              className="m-0 data-[state=active]:h-full"
            >
              {viewMode === 'grid' ? (
                <div className="p-4 grid grid-cols-2 gap-4">
                  {albums.map((album) => (
                    <MemoizedAlbumCard
                      key={album.id}
                      album={album}
                      viewMode={viewMode}
                      isSelectionMode={isSelectionMode}
                      className="w-full aspect-square"
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {albums.map((album) => (
                    <div key={album.id} className="px-6 py-4">
                      <div className="text-base leading-normal">
                        {album.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {album.artist_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="playlists"
              className="m-0 data-[state=active]:h-full"
            >
              {viewMode === 'grid' ? (
                <div className="p-4 grid grid-cols-2 gap-4">
                  {playlists.map((playlist) => (
                    <MemoizedPlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      viewMode={viewMode}
                      onTransfer={() => onTransfer(playlist)}
                      isSelectionMode={isSelectionMode}
                      className="w-full aspect-square"
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="px-6 py-4">
                      <div className="text-base leading-normal">
                        {playlist.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {playlist.trackCount} tracks
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        )}
      </Tabs>
    </div>
  );
}
