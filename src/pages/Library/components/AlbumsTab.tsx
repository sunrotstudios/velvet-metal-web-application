import VirtualizedAlbumGrid from '@/components/Library/VirtualizedAlbumGrid';
import { AlbumListHeader } from '@/components/Library/AlbumListHeader';
import { TabsContent } from '@/components/ui/tabs';
import { NormalizedAlbum, ViewMode } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AlbumsTabProps {
  isLoading: boolean;
  isError: boolean;
  albums: NormalizedAlbum[];
  filteredAlbums: NormalizedAlbum[];
  viewMode: ViewMode;
  ItemComponent: React.ComponentType<any>;
}

export const AlbumsTab = ({
  isLoading,
  isError,
  albums,
  filteredAlbums,
  viewMode,
  ItemComponent,
}: AlbumsTabProps) => {
  return (
    <TabsContent value="albums" className="space-y-6">
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex justify-center">
          <p className="text-destructive">Failed to load albums</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="flex justify-center">
          <p>No albums available.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {viewMode === 'list' && <AlbumListHeader />}
          <VirtualizedAlbumGrid
            items={filteredAlbums}
            viewMode={viewMode}
            ItemComponent={ItemComponent}
          />
        </div>
      )}
    </TabsContent>
  );
};
