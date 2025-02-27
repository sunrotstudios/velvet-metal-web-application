import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getServiceAuth } from '@/lib/services/streaming-auth';
import { transferAlbum, transferPlaylist } from '@/lib/services/transfer';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, Music, Music2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TransferProgress {
  itemId: string;
  stage:
    | 'fetching'
    | 'creating'
    | 'searching'
    | 'adding'
    | 'complete'
    | 'error';
  progress: number;
  message: string;
  destinationName?: string;
  error?: string;
}

interface BulkTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceService: 'spotify' | 'apple-music';
  items: any[];
  itemType: 'playlist' | 'album';
  userId: string;
  onTransferComplete?: () => void;
}

export function BulkTransferModal({
  open,
  onOpenChange,
  sourceService,
  items,
  itemType,
  userId,
  onTransferComplete,
}: BulkTransferModalProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState<Record<string, TransferProgress>>(
    {}
  );
  const [destinationService, setDestinationService] = useState<
    'spotify' | 'apple-music'
  >(sourceService === 'spotify' ? 'apple-music' : 'spotify');

  const handleTransfer = async () => {
    setIsTransferring(true);

    try {
      const sourceTokenData = await getServiceAuth(userId, sourceService);
      const targetTokenData = await getServiceAuth(userId, destinationService);

      if (!sourceTokenData?.accessToken || !targetTokenData?.accessToken) {
        toast.error('Authentication failed. Please reconnect your services.');
        return;
      }

      // Store tokens in localStorage for the transfer process
      if (sourceService === 'spotify') {
        localStorage.setItem(
          'spotify_access_token',
          sourceTokenData.accessToken
        );
        localStorage.setItem('apple_music_token', targetTokenData.accessToken);
      } else {
        localStorage.setItem('apple_music_token', sourceTokenData.accessToken);
        localStorage.setItem(
          'spotify_access_token',
          targetTokenData.accessToken
        );
      }

      // Transfer items in parallel with a limit
      const batchSize = 3; // Process 3 items at a time
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (item) => {
            try {
              setProgress((prev) => ({
                ...prev,
                [item.id]: {
                  itemId: item.id,
                  stage: 'fetching',
                  progress: 0,
                  message: `Starting transfer of "${item.name}"...`,
                },
              }));

              if (itemType === 'playlist') {
                await transferPlaylist({
                  sourceService,
                  destinationService,
                  playlist: item,
                  sourceToken: sourceTokenData.accessToken,
                  targetToken: targetTokenData.accessToken,
                  userId,
                  onProgress: (currentProgress) => {
                    setProgress((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...currentProgress,
                        itemId: item.id,
                      },
                    }));
                  },
                });
              } else {
                await transferAlbum({
                  sourceService,
                  destinationService,
                  album: item,
                  sourceToken: sourceTokenData.accessToken,
                  targetToken: targetTokenData.accessToken,
                  userId,
                  onProgress: (currentProgress) => {
                    setProgress((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...currentProgress,
                        itemId: item.id,
                      },
                    }));
                  },
                });
              }
            } catch (error) {
              setProgress((prev) => ({
                ...prev,
                [item.id]: {
                  itemId: item.id,
                  stage: 'error',
                  progress: 0,
                  message: 'Transfer failed',
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Unknown error occurred',
                },
              }));
            }
          })
        );
      }

      toast.success(`All ${itemType}s transferred successfully!`);
      onTransferComplete?.();
    } catch (error) {
      toast.error(`Failed to transfer ${itemType}s`);
    } finally {
      setIsTransferring(false);
    }
  };

  const allComplete =
    Object.keys(progress).length > 0 &&
    Object.values(progress).every(
      (p) => p.stage === 'complete' || p.stage === 'error'
    );

  const totalProgress =
    Object.values(progress).reduce((sum, p) => sum + p.progress, 0) /
    items.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Transfer {items.length}{' '}
            {itemType === 'playlist' ? 'Playlists' : 'Albums'}
          </DialogTitle>
          <DialogDescription>
            Choose where you want to transfer your{' '}
            {itemType === 'playlist' ? 'playlists' : 'albums'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Destination Service</Label>
            <RadioGroup
              defaultValue={destinationService}
              onValueChange={(value: 'spotify' | 'apple-music') =>
                setDestinationService(value)
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="spotify"
                  id="spotify"
                  className="peer sr-only"
                  disabled={sourceService === 'spotify' || isTransferring}
                />
                <Label
                  htmlFor="spotify"
                  className={cn(
                    'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary',
                    (sourceService === 'spotify' || isTransferring) &&
                      'cursor-not-allowed opacity-50'
                  )}
                >
                  <Music2 className="mb-3 h-6 w-6" />
                  Spotify
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="apple-music"
                  id="apple-music"
                  className="peer sr-only"
                  disabled={sourceService === 'apple-music' || isTransferring}
                />
                <Label
                  htmlFor="apple-music"
                  className={cn(
                    'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary',
                    (sourceService === 'apple-music' || isTransferring) &&
                      'cursor-not-allowed opacity-50'
                  )}
                >
                  <Music className="mb-3 h-6 w-6" />
                  Apple Music
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>
              Selected {itemType === 'playlist' ? 'Playlists' : 'Albums'}
            </Label>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="grid grid-cols-6 gap-2 p-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-md"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-md">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Music2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      {progress[item.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                          {progress[item.id].stage === 'complete' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : progress[item.id].stage === 'error' ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-[10px] text-red-400">
                                Failed
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              <span className="text-[10px] text-white">
                                {progress[item.id].progress.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-1">
                      <p className="truncate text-[10px] font-medium text-white">
                        {item.name}
                      </p>
                      <p className="truncate text-[8px] text-white/80">
                        {item.artist_name || item.owner_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {isTransferring ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Progress value={totalProgress} className="h-2" />
                <span className="min-w-[3rem] text-sm text-muted-foreground">
                  {totalProgress.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transferring {items.length}{' '}
                {itemType === 'playlist' ? 'playlists' : 'albums'}...
              </p>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={handleTransfer} disabled={isTransferring}>
                {isTransferring ? 'Transferring...' : 'Start Transfer'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
