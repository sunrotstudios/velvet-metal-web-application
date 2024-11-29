import VirtualizedPlaylistGrid from '@/components/Library/VirtualizedPlaylistGrid';
import { TabsContent } from '@/components/ui/tabs';
import { NormalizedPlaylist, ViewMode } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface PlaylistsTabProps {
  isLoading: boolean;
  isError: boolean;
  playlists: NormalizedPlaylist[];
  filteredPlaylists: NormalizedPlaylist[];
  viewMode: ViewMode;
  ItemComponent: React.ComponentType<any>;
  onTransfer: (playlist: NormalizedPlaylist) => void;
}

export const PlaylistsTab = ({
  isLoading,
  isError,
  playlists,
  filteredPlaylists,
  viewMode,
  ItemComponent,
  onTransfer,
}: PlaylistsTabProps) => {
  return (
    <TabsContent value="playlists" className="space-y-6">
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex justify-center">
          <p className="text-destructive">Failed to load playlists</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex justify-center">
          <p>No playlists available.</p>
        </div>
      ) : (
        <VirtualizedPlaylistGrid
          items={filteredPlaylists}
          viewMode={viewMode}
          ItemComponent={ItemComponent}
          onTransfer={onTransfer}
        />
      )}
    </TabsContent>
  );
};
