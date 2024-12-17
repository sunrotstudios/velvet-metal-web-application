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
import { getServiceAuth } from '@/lib/services/streaming-auth';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2, Music, Music2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TransferProgress {
  stage: 'fetching' | 'creating' | 'searching' | 'adding' | 'complete' | 'error';
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
      // Get tokens from the database
      const sourceTokenData = await getServiceAuth(userId, sourceService);
      const targetTokenData = await getServiceAuth(userId, targetService);

      if (!sourceTokenData?.accessToken || !targetTokenData?.accessToken) {
        setProgress({
          stage: 'error',
          progress: 0,
          message: 'Authentication failed',
          error: 'Missing authentication tokens. Please reconnect your services.',
        });
        return;
      }

      // Store tokens in localStorage for the transfer process
      if (sourceService === 'spotify') {
        localStorage.setItem('spotify_access_token', sourceTokenData.accessToken);
        localStorage.setItem('apple_music_token', targetTokenData.accessToken);
      } else {
        localStorage.setItem('apple_music_token', sourceTokenData.accessToken);
        localStorage.setItem('spotify_access_token', targetTokenData.accessToken);
      }

      const result = await transferPlaylist({
        sourceService,
        targetService,
        playlist,
        sourceToken: sourceTokenData.accessToken,
        targetToken: targetTokenData.accessToken,
        userId,
        onProgress: (progress) => {
          if (progress.stage === 'adding' && progress.progress === 100) {
            setProgress({
              stage: 'complete',
              progress: 100,
              message: 'Transfer complete!',
            });
          } else {
            setProgress(progress);
          }
        },
      });

      // Update progress with the destination playlist name after we have the result
      setProgress((prev) => prev ? {
        ...prev,
        stage: 'complete',
        progress: 100,
        message: 'Transfer complete!',
        destinationPlaylistName: result.name,
      } : null);

      setIsTransferring(false);
    } catch (error) {
      console.error('Transfer error:', error);
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Transfer failed',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
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
            Transfer "{playlist.name}" to {targetService === 'apple-music' ? 'Apple Music' : 'Spotify'}
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

          {progress && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {progress.stage === 'complete' ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500 animate-in zoom-in" />
                ) : progress.stage === 'error' ? (
                  <XCircle className="h-8 w-8 text-red-500 animate-in zoom-in" />
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">
                      {progress.message}
                    </span>
                    {progress.stage !== 'complete' && progress.stage !== 'error' && (
                      <span className="text-muted-foreground">
                        {Math.round(progress.progress)}%
                      </span>
                    )}
                  </div>
                  {progress.stage === 'complete' && progress.destinationPlaylistName && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Created playlist: {progress.destinationPlaylistName}
                    </p>
                  )}
                  {progress.stage === 'error' && progress.error && (
                    <p className="text-sm text-red-500 mt-1">{progress.error}</p>
                  )}
                </div>
              </div>

              {progress.stage !== 'complete' && progress.stage !== 'error' && (
                <>
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
                            progress.progress >= 20 && progress.stage !== 'creating',
                        })}
                      />
                      Creating
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn('h-2 w-2 rounded-full', {
                          'bg-primary animate-pulse': progress.stage === 'searching',
                          'bg-muted': progress.progress < 30,
                          'bg-primary':
                            progress.progress >= 30 && progress.stage !== 'searching',
                        })}
                      />
                      Processing
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {!progress && (
            <div className="flex items-center gap-2 rounded-md border p-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-muted-foreground">
                This process may take a few minutes depending on the playlist size
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
                <Button onClick={handleTransfer}>
                  Retry
                </Button>
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
