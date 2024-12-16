import VirtualizedPlaylistGrid from '@/components/Library/VirtualizedPlaylistGrid';
import { TabsContent } from '@/components/ui/tabs';
import { NormalizedPlaylist, ViewMode } from '@/lib/types';

interface PlaylistsTabProps {
  playlists: NormalizedPlaylist[];
  filteredPlaylists: NormalizedPlaylist[];
  viewMode: ViewMode;
  ItemComponent: React.ComponentType<any>;
  onTransfer: (playlist: NormalizedPlaylist) => void;
}

export const PlaylistsTab = ({
  playlists,
  filteredPlaylists,
  viewMode,
  ItemComponent,
  onTransfer,
}: PlaylistsTabProps) => {
  return (
    <TabsContent value="playlists" className="space-y-6">
      {playlists.length === 0 ? (
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
