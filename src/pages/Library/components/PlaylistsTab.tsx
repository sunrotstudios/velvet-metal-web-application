import VirtualizedPlaylistGrid from '@/components/Library/VirtualizedPlaylistGrid';
import { PlaylistCard } from '@/components/Library/PlaylistCard';
import { TabsContent } from '@/components/ui/tabs';
import { NormalizedPlaylist, ViewMode } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PlaylistsTabProps {
  playlists: NormalizedPlaylist[];
  isLoading: boolean;
  viewMode: ViewMode;
  onTransfer: (playlist: NormalizedPlaylist) => void;
}

export function PlaylistsTab({
  playlists,
  isLoading,
  viewMode,
  onTransfer,
}: PlaylistsTabProps) {
  if (isLoading) {
    return (
      <TabsContent value="playlists" className="mt-0 flex-1">
        <div className="flex h-[400px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </TabsContent>
    );
  }

  if (!playlists?.length) {
    return (
      <TabsContent value="playlists" className="mt-0 flex-1">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No playlists found</p>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="playlists" className="mt-0 flex-1">
      <VirtualizedPlaylistGrid
        items={playlists}
        viewMode={viewMode}
        ItemComponent={PlaylistCard}
        onTransfer={onTransfer}
      />
    </TabsContent>
  );
}
