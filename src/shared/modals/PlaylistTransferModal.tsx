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
    | 'processing'
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
  if (progress.stage === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="rounded-full bg-green-500/20 p-3">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-white">Transfer Complete!</h3>
          <p className="text-white/60">
            Successfully transferred "{progress.destinationPlaylistName}" to your library
          </p>
        </div>
      </div>
    );
  }

  if (progress.stage === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div className="rounded-full bg-red-500/20 p-3">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-white">Transfer Failed</h3>
          <p className="text-white/60">{progress.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Progress 
        value={progress.progress} 
        className="w-full bg-white/5 [&>div]:bg-white" 
      />
      <p className="text-center text-sm text-white/60">
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
    if (!userId || isTransferring) return;
    
    setIsTransferring(true);
    setProgress({
      stage: 'processing',
      progress: 0,
      message: 'Starting transfer...',
      destinationPlaylistName: playlist.name
    });

    try {
      await transferPlaylist({
        sourceService,
        targetService,
        playlist,
        sourceToken: '', // Token will be fetched from database
        targetToken: '', // Token will be fetched from database
        userId,
        onProgress: (transferProgress) => {
          setProgress({
            ...transferProgress,
            destinationPlaylistName: playlist.name
          });
        },
      });

      // Call onTransferComplete callback if provided
      if (onTransferComplete) {
        onTransferComplete();
      }

      // Don't close the modal, just show completion state
      setIsTransferring(false);
    } catch (error) {
      console.error('Transfer error:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Transfer failed',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        destinationPlaylistName: playlist.name
      });
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    // Only allow closing if not currently transferring
    if (!isTransferring) {
      onOpenChange(false);
      // Reset state after modal is closed
      setTimeout(() => {
        setProgress(null);
        setTargetService(sourceService === 'spotify' ? 'apple-music' : 'spotify');
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 text-white border-white/10">
        {progress?.stage !== 'complete' && (
          <DialogHeader>
            <DialogTitle className="text-white">
              Transfer "{playlist.name}" to {targetService === 'apple-music' ? 'Apple Music' : 'Spotify'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Choose your transfer settings below
            </DialogDescription>
          </DialogHeader>
        )}

        <div className="space-y-6">
          {!progress?.stage && (
            <div>
              <Label className="text-sm font-medium text-white">Transfer to:</Label>
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
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors",
                      sourceService === 'spotify'
                        ? "border-white/10 bg-white/5 cursor-not-allowed opacity-50"
                        : "border-white/10 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10"
                    )}
                  >
                    <Music className="mb-2 h-6 w-6 text-white" />
                    <span className="text-white">Spotify</span>
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
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer transition-colors",
                      sourceService === 'apple-music'
                        ? "border-white/10 bg-white/5 cursor-not-allowed opacity-50"
                        : "border-white/10 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10"
                    )}
                  >
                    <Music2 className="mb-2 h-6 w-6 text-white" />
                    <span className="text-white">Apple Music</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {progress && <TransferProgress progress={progress} />}

          {!progress && (
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-white/60">
                This process may take a few minutes depending on the playlist size
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {progress?.stage === 'complete' ? (
              <Button
                onClick={handleClose}
                className="bg-green-500/20 text-green-500 hover:bg-green-500/30 min-w-[100px]"
              >
                Close
              </Button>
            ) : progress?.stage === 'error' ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransfer}
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  Retry
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isTransferring}
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransfer}
                  disabled={isTransferring}
                  className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                >
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
