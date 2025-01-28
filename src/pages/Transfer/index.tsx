import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ServiceSelector } from '@/components/ui/service-selector';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { getServiceAuth } from '@/lib/services/streaming-auth';
import {
  transferLibrary,
  verifyTransfer,
} from '@/lib/services/transfer-service';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { TransferLog } from './TransferLog';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    setLogs((prev) => [...prev, { type, message, timestamp: new Date() }]);
  };

  const handleVerify = async () => {
    if (!user) return;

    setIsVerifying(true);
    try {
      // Get Apple Music token
      const appleMusicAuth = await getServiceAuth(user.id, 'apple-music');
      if (!appleMusicAuth?.musicUserToken) {
        throw new Error('Apple Music authentication required');
      }

      const result = await verifyTransfer(
        user.id,
        appleMusicAuth.musicUserToken,
        addLog
      );

      toast({
        title: 'Transfer Verification Complete',
        description: `Found ${result.found} out of ${result.total} albums in your Apple Music library`,
        variant: result.found === result.total ? 'default' : 'warning',
      });
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: 'Verification Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred during verification',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTransfer = async () => {
    if (!user) return;

    setIsTransferring(true);
    setLogs([]); // Clear previous logs
    setProgress({ current: 0, total: 0 });

    try {
      // Get Apple Music token from streaming auth service
      const appleMusicAuth = await getServiceAuth(user.id, 'apple-music');
      if (!appleMusicAuth?.musicUserToken) {
        throw new Error(
          'Apple Music authentication required. Please connect your Apple Music account first.'
        );
      }

      const { successCount, failureCount } = await transferLibrary(
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
        title: 'Transfer Complete',
        description: `Successfully transferred ${successCount} albums${
          failureCount > 0 ? `, ${failureCount} failed` : ''
        }`,
        variant: failureCount > 0 ? 'warning' : 'default',
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
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Transfer Library
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Seamlessly transfer your music collection between streaming
            services.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3 p-8">
            <div className="space-y-8">
              {/* Service Selection */}
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-12">
                  <div className="space-y-3 text-center">
                    <p className="text-sm font-medium">From</p>
                    <ServiceSelector
                      activeService={fromService}
                      onServiceChange={setFromService}
                      disabled={isTransferring}
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="space-y-3 text-center">
                    <p className="text-sm font-medium">To</p>
                    <ServiceSelector
                      activeService={toService}
                      onServiceChange={setToService}
                      disabled={isTransferring}
                    />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isTransferring && progress.total > 0 && (
                <div className="space-y-3">
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-in-out"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {Math.round((progress.current / progress.total) * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Processing {progress.current.toLocaleString()} of{' '}
                    {progress.total.toLocaleString()} albums
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleTransfer}
                  disabled={isTransferring || isVerifying}
                  size="lg"
                  className="w-36"
                >
                  {isTransferring ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Transferring
                    </>
                  ) : (
                    'Start Transfer'
                  )}
                </Button>

                <Button
                  onClick={handleVerify}
                  disabled={isTransferring || isVerifying}
                  variant="outline"
                  size="lg"
                  className="w-36"
                >
                  {isVerifying ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Verifying
                    </>
                  ) : (
                    'Verify Transfer'
                  )}
                </Button>
              </div>

              {/* Information Box */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>
                      The transfer process will attempt to match and transfer
                      your entire music library
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>
                      Transfer time varies based on library size and network
                      conditions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>
                      Some albums may not transfer if they're unavailable on the
                      destination service
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>
                      Use the verify function to check the status of transferred
                      albums
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Transfer Log */}
          <Card className="lg:col-span-2">
            <TransferLog logs={logs} className="h-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
