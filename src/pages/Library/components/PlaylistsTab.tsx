import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { NormalizedPlaylist, ViewMode } from '@/lib/types';
import { BulkTransferModal } from '@/shared/modals/BulkTransferModal';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { PlaylistCard } from './Playlists/PlaylistCard';
import VirtualizedPlaylistGrid from './Playlists/VirtualizedPlaylistGrid';

interface PlaylistsTabProps {
  playlists: NormalizedPlaylist[];
  isLoading: boolean;
  viewMode: ViewMode;
  onTransfer: (playlist: NormalizedPlaylist) => void;
  isSelectionMode: boolean;
}

interface PlaylistsTabHandle {
  deselectAll: () => void;
}

export const PlaylistsTab = forwardRef<PlaylistsTabHandle, PlaylistsTabProps>(
  (
    {
      playlists,
      isLoading,
      viewMode,
      onTransfer,
      isSelectionMode,
    }: PlaylistsTabProps,
    ref
  ) => {
    const { user } = useAuth();
    const [selectedPlaylists, setSelectedPlaylists] = useState<
      NormalizedPlaylist[]
    >([]);
    const [isBulkTransferModalOpen, setIsBulkTransferModalOpen] =
      useState(false);

    useEffect(() => {
      if (!isSelectionMode) {
        setSelectedPlaylists([]);
      }
    }, [isSelectionMode]);

    useImperativeHandle(ref, () => ({
      deselectAll: () => {
        setSelectedPlaylists([]);
      },
    }));

    const toggleSelection = (playlist: NormalizedPlaylist) => {
      setSelectedPlaylists((prev) => {
        const isSelected = prev.some((p) => p.id === playlist.id);
        if (isSelected) {
          return prev.filter((p) => p.id !== playlist.id);
        } else {
          return [...prev, playlist];
        }
      });
    };

    const selectAll = () => {
      setSelectedPlaylists(playlists);
    };

    const deselectAll = () => {
      setSelectedPlaylists([]);
    };

    if (isLoading) {
      return (
        <TabsContent value="playlists" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </TabsContent>
      );
    }

    if (!playlists?.length) {
      return (
        <TabsContent value="playlists" className="space-y-6">
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-muted-foreground">No playlists found</p>
          </div>
        </TabsContent>
      );
    }

    const allFromSameService = selectedPlaylists.every(
      (p) => p.service === selectedPlaylists[0]?.service
    );

    return (
      <TabsContent value="playlists" className="space-y-6">
        {isSelectionMode && (
          <div className=" flex flex-col items-center ">
            <div className="flex items-center gap-4">
              {selectedPlaylists.length >= 0 && (
                <>
                  <Button variant="outline" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" onClick={deselectAll}>
                    Deselect All
                  </Button>
                  {allFromSameService && (
                    <Button onClick={() => setIsBulkTransferModalOpen(true)}>
                      Transfer {selectedPlaylists.length} Playlists
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <VirtualizedPlaylistGrid
          items={playlists}
          viewMode={viewMode}
          ItemComponent={(props) => (
            <div className="relative group">
              <PlaylistCard
                {...props}
                onTransfer={onTransfer}
                isSelectionMode={isSelectionMode}
                onSelect={toggleSelection}
              />
              {isSelectionMode && (
                <Checkbox
                  className="absolute h-5 w-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground [&[data-state=checked]>span]:rounded-full"
                  checked={selectedPlaylists.some(
                    (p) => p.id === props.playlist.id
                  )}
                  onCheckedChange={() => toggleSelection(props.playlist)}
                  style={{
                    right: '1rem',
                    bottom: '1.25rem',
                  }}
                />
              )}
            </div>
          )}
          onTransfer={onTransfer}
        />

        {selectedPlaylists.length > 0 && (
          <BulkTransferModal
            open={isBulkTransferModalOpen}
            onOpenChange={setIsBulkTransferModalOpen}
            sourceService={selectedPlaylists[0].service}
            playlists={selectedPlaylists}
            userId={user!.id}
            onTransferComplete={() => {
              setIsBulkTransferModalOpen(false);
              setSelectedPlaylists([]);
            }}
          />
        )}
      </TabsContent>
    );
  }
);
