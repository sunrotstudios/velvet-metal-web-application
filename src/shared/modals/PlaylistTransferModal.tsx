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
import { transferPlaylist } from '@/lib/services/transfer';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Music,
  Music2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface TransferProgress {
  stage:
    | 'fetching'
    | 'creating'
    | 'searching'
    | 'adding'
    | 'complete'
    | 'error';
  progress: number; // 0-100
  message: string;
  destinationPlaylistName?: string;
  error?: string;
}

interface TransferPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceService: 'spotify' | 'apple-music';
  playlist: any;
  userId: string;
  onTransferComplete?: () => void;
}

function TransferProgress({ progress }: { progress: TransferProgress }) {
  return (
    <div className="space-y-4">
      <Progress value={progress.progress} className="w-full" />
      <p className="text-center text-sm text-muted-foreground">
        {progress.message}
      </p>
    </div>
  );
}

export function TransferPlaylistModal({
  open,
  onOpenChange,
  sourceService,
  playlist,
  userId,
  onTransferComplete,
}: TransferPlaylistModalProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [progress, setProgress] = useState<TransferProgress | null>(null);
  const [targetService, setTargetService] = useState<'spotify' | 'apple-music'>(
    sourceService === 'spotify' ? 'apple-music' : 'spotify'
  );

  const handleTransfer = async () => {
    setIsTransferring(true);
    setProgress({
      stage: 'fetching',
      progress: 0,
      message: 'Starting transfer...',
    });

    try {
      const result = await transferPlaylist({
        sourceService,
        targetService,
        playlist,
        sourceToken: '', // Token will be fetched from database
        targetToken: '', // Token will be fetched from database
        userId,
        onProgress: (progress) => {
          setProgress(progress);
        },
      });

      // Call onTransferComplete callback if provided
      if (onTransferComplete) {
        onTransferComplete();
      }

      setIsTransferring(false);
    } catch (error) {
      console.error('Transfer error:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Transfer failed',
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    if (!isTransferring) {
      setProgress(null);
      setTargetService(sourceService === 'spotify' ? 'apple-music' : 'spotify');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Transfer "{playlist.name}" to{' '}
            {targetService === 'apple-music' ? 'Apple Music' : 'Spotify'}
          </DialogTitle>
          <DialogDescription>
            Choose your transfer settings below
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {!progress?.stage && (
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
          )}

          {progress && <TransferProgress progress={progress} />}

          {!progress && (
            <div className="flex items-center gap-2 rounded-md border p-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-muted-foreground">
                This process may take a few minutes depending on the playlist
                size
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {progress?.stage === 'complete' ? (
              <Button
                onClick={handleClose}
                className="bg-green-500 hover:bg-green-600"
              >
                Done
              </Button>
            ) : progress?.stage === 'error' ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleTransfer}>Retry</Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
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
