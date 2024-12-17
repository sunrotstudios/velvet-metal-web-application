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
import { transferAlbum } from '@/lib/services/transfer';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2, Music, Music2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TransferProgress {
  stage: 'fetching' | 'creating' | 'searching' | 'adding';
  progress: number; // 0-100
  message: string;
}

interface AlbumTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceService: 'spotify' | 'apple-music';
  album: any;
  userId: string;
  onTransferComplete?: () => void;
}

export function AlbumTransferModal({
  open,
  onOpenChange,
  sourceService,
  album,
  userId,
  onTransferComplete,
}: AlbumTransferModalProps) {
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
      toast.error('Please connect both services first');
      return;
    }

    setIsTransferring(true);
    setProgress(null);

    try {
      await transferAlbum({
        sourceService,
        targetService,
        album,
        sourceToken,
        targetToken,
        onProgress: setProgress,
        userId,
      });

      toast.success('Album transferred successfully!');
      onTransferComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Failed to transfer album');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Album</DialogTitle>
          <DialogDescription>
            Transfer "{album?.name}" to another service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isTransferring ? (
            <>
              <div className="space-y-4">
                <Label>Transfer to:</Label>
                <RadioGroup
                  value={targetService}
                  onValueChange={(value: 'spotify' | 'apple-music') =>
                    setTargetService(value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="spotify"
                      id="spotify"
                      disabled={sourceService === 'spotify'}
                    />
                    <Label
                      htmlFor="spotify"
                      className={cn(
                        'flex items-center gap-2',
                        sourceService === 'spotify' && 'opacity-50'
                      )}
                    >
                      <Music2 className="h-4 w-4" />
                      Spotify
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="apple-music"
                      id="apple-music"
                      disabled={sourceService === 'apple-music'}
                    />
                    <Label
                      htmlFor="apple-music"
                      className={cn(
                        'flex items-center gap-2',
                        sourceService === 'apple-music' && 'opacity-50'
                      )}
                    >
                      <Music className="h-4 w-4" />
                      Apple Music
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleTransfer}>Start Transfer</Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {progress ? (
                  <>
                    <Progress value={progress.progress} />
                    <span className="text-sm text-muted-foreground">
                      {progress.progress.toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
              {progress?.message && (
                <p className="text-sm text-muted-foreground">
                  {progress.message}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
