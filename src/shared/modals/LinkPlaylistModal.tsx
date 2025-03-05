import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlaylistSync } from "@/lib/hooks/usePlaylistSync";
import { useUserPlaylists } from "@/lib/hooks/usePlaylistQueries";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { NormalizedPlaylist } from "@/lib/types";

interface LinkPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePlaylist: NormalizedPlaylist;
  userId: string;
  onLinkComplete?: () => void;
}

export function LinkPlaylistModal({
  open,
  onOpenChange,
  sourcePlaylist,
  userId,
  onLinkComplete,
}: LinkPlaylistModalProps) {
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<NormalizedPlaylist | null>(null);

  const { createSyncPair } = usePlaylistSync(userId);

  // Get playlists from the other service
  const targetService =
    sourcePlaylist.service === "spotify" ? "apple-music" : "spotify";
  const { data: targetPlaylists, isLoading: loadingPlaylists } =
    useUserPlaylists(userId, targetService);

  const handleLink = async () => {
    if (!selectedPlaylist) return;

    await createSyncPair.mutateAsync({
      sourcePlaylistId: sourcePlaylist.playlist_id,
      sourceService: sourcePlaylist.service,
      targetPlaylistId: selectedPlaylist.playlist_id,
      targetService: selectedPlaylist.service,
    });

    onLinkComplete?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link with {targetService} Playlist</DialogTitle>
          <DialogDescription>
            Select a playlist to sync with "{sourcePlaylist.name}". Changes made
            to either playlist will be reflected in both.
          </DialogDescription>
        </DialogHeader>

        {loadingPlaylists ? (
          <div className="flex h-48 items-center justify-center">
            <LoadingSpinner centered label="Loading playlists" />
          </div>
        ) : !targetPlaylists?.length ? (
          <div className="flex h-48 items-center justify-center text-center text-sm text-muted-foreground">
            No playlists found in your {targetService} library
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {targetPlaylists.map((playlist) => (
                <button
                  key={playlist.playlist_id}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                    selectedPlaylist?.playlist_id === playlist.playlist_id
                      ? "border-primary bg-accent"
                      : "border-border"
                  }`}
                >
                  <div className="font-medium">{playlist.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {playlist.tracks} tracks
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createSyncPair.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={!selectedPlaylist || createSyncPair.isPending}
          >
            {createSyncPair.isPending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Linking...
              </>
            ) : (
              "Link Playlists"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
