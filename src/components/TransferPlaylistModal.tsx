import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Music, Music2 } from 'lucide-react';
import { toast } from 'sonner';
import { transferPlaylist } from '@/lib/services/transfer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TransferProgress {
  stage: 'fetching' | 'creating' | 'searching' | 'adding';
  progress: number; // 0-100
  message: string;
}

interface TransferPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceService: 'spotify' | 'apple-music';
  playlist: any;
  onTransferComplete?: () => void;
}

export function TransferPlaylistModal({
  open,
  onOpenChange,
  sourceService,
  playlist,
  onTransferComplete,
}: TransferPlaylistModalProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const [targetService, setTargetService] = useState<'spotify' | 'apple-music'>(
    sourceService === 'spotify' ? 'apple-music' : 'spotify'
  );

  const sourceToken = localStorage.getItem(
    sourceService === 'spotify' ? 'spotify_access_token' : 'apple_music_token'
  );
  const targetToken = localStorage.getItem(
    targetService === 'spotify' ? 'spotify_access_token' : 'apple_music_token'
  );

  const handleTransfer = async () => {
    if (!sourceToken || !targetToken) {
      toast.error('Missing authentication tokens');
      return;
    }

    setIsTransferring(true);
    setProgress({
      stage: 'fetching',
      progress: 0,
      message: 'Starting transfer...',
    });

    try {
      await transferPlaylist({
        sourceService,
        targetService,
        playlist,
        sourceToken,
        targetToken,
        onProgress: setProgress,
      });

      // Don't close the modal immediately
      setIsTransferring(false);
      // Success message will be shown in the progress indicator
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Failed to transfer playlist');
      setIsTransferring(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Playlist</DialogTitle>
          <DialogDescription>
            Transfer "{playlist?.name || playlist?.attributes?.name}" to another
            service
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Transfer to:</Label>
            <RadioGroup
              defaultValue={targetService}
              onValueChange={(value) =>
                setTargetService(value as 'spotify' | 'apple-music')
              }
              className="mt-2 grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="spotify"
                  id="spotify"
                  disabled={sourceService === 'spotify'}
                  className="peer sr-only"
                />
                <Label
                  htmlFor="spotify"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Music className="mb-2 h-6 w-6" />
                  Spotify
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="apple-music"
                  id="apple-music"
                  disabled={sourceService === 'apple-music'}
                  className="peer sr-only"
                />
                <Label
                  htmlFor="apple-music"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Music2 className="mb-2 h-6 w-6" />
                  Apple Music
                </Label>
              </div>
            </RadioGroup>
          </div>

          {progress ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  {progress.message}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress.progress)}%
                </span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div
                    className={cn('h-2 w-2 rounded-full', {
                      'bg-primary animate-pulse': progress.stage === 'fetching',
                      'bg-primary': progress.stage !== 'fetching',
                    })}
                  />
                  Fetching
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn('h-2 w-2 rounded-full', {
                      'bg-primary animate-pulse': progress.stage === 'creating',
                      'bg-muted': progress.progress < 20,
                      'bg-primary':
                        progress.progress >= 20 &&
                        progress.stage !== 'creating',
                    })}
                  />
                  Creating
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn('h-2 w-2 rounded-full', {
                      'bg-primary animate-pulse':
                        progress.stage === 'searching',
                      'bg-muted': progress.progress < 30,
                      'bg-primary':
                        progress.progress >= 30 &&
                        progress.stage !== 'searching',
                    })}
                  />
                  Processing
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border p-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-muted-foreground">
                This process may take a few minutes depending on the playlist
                size
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {progress?.progress === 100 ? (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onTransferComplete?.();
                }}
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isTransferring}
                >
                  Cancel
                </Button>
                <Button onClick={handleTransfer} disabled={isTransferring}>
                  {isTransferring && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Transfer
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
