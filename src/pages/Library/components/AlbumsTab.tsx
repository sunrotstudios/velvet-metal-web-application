import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { NormalizedAlbum, ViewMode } from '@/lib/types';
import { BulkTransferModal } from '@/shared/modals/BulkTransferModal';
import { Loader2 } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { AlbumListHeader } from './Albums/AlbumListHeader';
import VirtualizedAlbumGrid from './Albums/VirtualizedAlbumGrid';

interface AlbumsTabProps {
  isLoading: boolean;
  isError: boolean;
  albums: NormalizedAlbum[];
  filteredAlbums: NormalizedAlbum[];
  viewMode: ViewMode;
  ItemComponent: React.ComponentType<any>;
  isSelectionMode: boolean;
}

interface AlbumsTabHandle {
  deselectAll: () => void;
}

export const AlbumsTab = forwardRef<AlbumsTabHandle, AlbumsTabProps>(
  (
    {
      isLoading,
      isError,
      albums,
      filteredAlbums,
      viewMode,
      ItemComponent,
      isSelectionMode,
    }: AlbumsTabProps,
    ref
  ) => {
    const { user } = useAuth();
    const [selectedAlbums, setSelectedAlbums] = useState<NormalizedAlbum[]>([]);
    const [isBulkTransferModalOpen, setIsBulkTransferModalOpen] =
      useState(false);

    useEffect(() => {
      if (!isSelectionMode) {
        setSelectedAlbums([]);
      }
    }, [isSelectionMode]);

    useImperativeHandle(ref, () => ({
      deselectAll: () => {
        setSelectedAlbums([]);
      },
    }));

    const toggleSelection = (album: NormalizedAlbum) => {
      setSelectedAlbums((prev) => {
        const isSelected = prev.some((a) => a.id === album.id);
        if (isSelected) {
          return prev.filter((a) => a.id !== album.id);
        } else {
          return [...prev, album];
        }
      });
    };

    const selectAll = () => {
      setSelectedAlbums(filteredAlbums);
    };

    const deselectAll = () => {
      setSelectedAlbums([]);
    };

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
          <>
            {isSelectionMode && (
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedAlbums.length === filteredAlbums.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAll();
                        } else {
                          deselectAll();
                        }
                      }}
                      className="h-5 w-5 rounded-sm border-2"
                    />
                    <span className="text-sm font-medium">
                      Select All ({filteredAlbums.length} albums)
                    </span>
                  </div>
                  {selectedAlbums.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedAlbums.length} selected
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setIsBulkTransferModalOpen(true)}
                      >
                        Transfer Albums
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-1">
              {viewMode === 'list' && <AlbumListHeader />}
              <VirtualizedAlbumGrid
                items={filteredAlbums}
                viewMode={viewMode}
                ItemComponent={ItemComponent}
                isSelectionMode={isSelectionMode}
                onSelect={toggleSelection}
                selectedItems={selectedAlbums}
              />
            </div>
            {selectedAlbums.length > 0 && (
              <BulkTransferModal
                open={isBulkTransferModalOpen}
                onOpenChange={setIsBulkTransferModalOpen}
                sourceService={selectedAlbums[0].service}
                items={selectedAlbums}
                itemType="album"
                userId={user!.id}
                onTransferComplete={() => {
                  setIsBulkTransferModalOpen(false);
                  setSelectedAlbums([]);
                }}
              />
            )}
          </>
        )}
      </TabsContent>
    );
  }
);
