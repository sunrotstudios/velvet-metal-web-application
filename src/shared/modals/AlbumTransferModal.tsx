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
      <DialogContent className="bg-black border border-white/10">
        <DialogHeader>
          <DialogTitle className="font-polymath text-2xl text-white">Transfer Album</DialogTitle>
          <DialogDescription className="text-white/60">
            Transfer "{album?.name}" to another service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isTransferring ? (
            <>
              <div className="space-y-4">
                <Label className="text-white/80">Transfer to:</Label>
                <RadioGroup
                  value={targetService}
                  onValueChange={(value: 'spotify' | 'apple-music') =>
                    setTargetService(value)
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="spotify"
                      id="spotify"
                      disabled={sourceService === 'spotify'}
                      className="border-white/20 text-white"
                    />
                    <Label
                      htmlFor="spotify"
                      className={cn(
                        'flex items-center gap-2 text-white cursor-pointer',
                        sourceService === 'spotify' && 'opacity-50'
                      )}
                    >
                      <Music2 className="h-4 w-4" />
                      Spotify
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem
                      value="apple-music"
                      id="apple-music"
                      disabled={sourceService === 'apple-music'}
                      className="border-white/20 text-white"
                    />
                    <Label
                      htmlFor="apple-music"
                      className={cn(
                        'flex items-center gap-2 text-white cursor-pointer',
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
                <Button 
                  onClick={handleTransfer}
                  className="bg-white/10 text-white hover:bg-white/20 border-0"
                >
                  Start Transfer
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {progress ? (
                  <>
                    <Progress 
                      value={progress.progress} 
                      className="bg-white/5"
                      indicatorClassName="bg-white"
                    />
                    <span className="text-sm text-white/60">
                      {progress.progress.toFixed(0)}%
                    </span>
                  </>
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                )}
              </div>
              {progress?.message && (
                <p className="text-sm text-white/60">
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
