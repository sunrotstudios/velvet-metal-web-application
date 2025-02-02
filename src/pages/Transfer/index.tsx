import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ServiceSelector } from '@/components/ui/service-selector';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getServiceAuth } from '@/lib/services/streaming-auth';
import {
  TransferProgress,
  transferLibrary,
  verifyTransfer,
} from '@/lib/services/transfer-service';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { TransferLog } from './TransferLog';
import { useToast } from '@/components/ui/use-toast';

interface LogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

export default function Transfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fromService, setFromService] = useState<'spotify' | 'apple-music'>(
    'spotify'
  );
  const [toService, setToService] = useState<'spotify' | 'apple-music'>(
    'apple-music'
  );
  const [isTransferring, setIsTransferring] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState<TransferProgress>({
    current: 0,
    total: 0,
    stage: 'processing',
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs((prev) => [...prev, { type, message, timestamp: new Date() }]);
    if (message.includes('Transfer complete')) {
      setIsCompleted(true);
      setIsTransferring(false);
    }
  };

  const handleTransfer = async () => {
    if (!user) return;

    setIsTransferring(true);
    setIsCompleted(false);
    setLogs([]); // Clear previous logs
    setProgress({ current: 0, total: 0, stage: 'processing' });

    try {
      // Get Apple Music token from streaming auth service
      const appleMusicAuth = await getServiceAuth(user.id, 'apple-music');
      if (!appleMusicAuth?.musicUserToken) {
        throw new Error(
          'Apple Music authentication required. Please connect your Apple Music account first.'
        );
      }

      await transferLibrary(
        user.id,
        fromService,
        toService,
        {
          spotify_token: user.spotify_token,
          apple_music_token: appleMusicAuth.musicUserToken,
        },
        setProgress,
        addLog
      );

      toast({
        title: 'Transfer Started',
        description: 'Your transfer has started and will continue in the background.',
      });
    } catch (error) {
      console.error('Transfer failed:', error);
      toast({
        title: 'Transfer Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred during the transfer. Please try again.',
        variant: 'destructive',
      });
      setIsTransferring(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-12">
      <div className="space-y-6">
        <div>
          <h1 className="font-radlush text-4xl font-medium text-white">
            Transfer Library
          </h1>
          <p className="text-lg text-white/80 mt-2">
            Seamlessly transfer your music collection between streaming
            services.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3 p-8 bg-gradient-to-b from-zinc-900 to-zinc-950 border-white/20">
            <div className="space-y-8">
              {/* Service Selection */}
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-12">
                  <div className="space-y-3 text-center">
                    <p className="text-sm font-medium text-white">From</p>
                    <ServiceSelector
                      activeService={fromService}
                      onServiceChange={setFromService}
                      disabled={isTransferring}
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <ArrowRight className="h-6 w-6 text-white/60" />
                  </div>

                  <div className="space-y-3 text-center">
                    <p className="text-sm font-medium text-white">To</p>
                    <ServiceSelector
                      activeService={toService}
                      onServiceChange={setToService}
                      disabled={isTransferring}
                    />
                  </div>
                </div>

                {/* Progress Section */}
                {(isTransferring || isCompleted) && (
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 ease-in-out",
                          isCompleted ? "bg-green-400" : "bg-white"
                        )}
                        style={{
                          width: isCompleted
                            ? "100%"
                            : `${Math.max(
                                5,
                                (progress.current / Math.max(1, progress.total)) * 100
                              )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm text-white/80">
                      <span>Progress</span>
                      <span>
                        {isCompleted
                          ? "Complete"
                          : progress.total > 0
                          ? `${Math.round(
                              (progress.current / progress.total) * 100
                            )}%`
                          : "Starting..."}
                      </span>
                    </div>
                    {progress.total > 0 && progress.current <= progress.total && !isCompleted && (
                      <p className="text-sm text-center text-white/80">
                        {progress.stage === 'processing' && (
                          `Processing ${progress.current.toLocaleString()} of ${progress.total.toLocaleString()} albums`
                        )}
                        {progress.stage === 'matching' && (
                          `Matching ${progress.current.toLocaleString()} of ${progress.total.toLocaleString()} albums in Apple Music`
                        )}
                        {progress.stage === 'adding' && (
                          `Adding ${progress.current.toLocaleString()} of ${progress.total.toLocaleString()} albums to your library`
                        )}
                      </p>
                    )}
                    {isCompleted && (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Transfer Complete</span>
                        </div>
                        <p className="text-sm text-white/80">
                          Successfully transferred {progress.total.toLocaleString()} albums to your library
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleTransfer}
                    disabled={isTransferring || fromService === toService}
                    className={cn(
                      "bg-white/20 text-white hover:bg-white/30 border-0",
                      (isTransferring || fromService === toService) && "opacity-50"
                    )}
                  >
                    {isTransferring ? (
                      <LoadingSpinner className="mr-2 h-4 w-4 text-white" />
                    ) : null}
                    {isTransferring
                      ? "Transferring..."
                      : isCompleted
                      ? "Start New Transfer"
                      : "Start Transfer"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <TransferLog logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}
