// Invalidate the service connection query to update UI
import { ServiceConnection } from '@/components/ServiceConnection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ServiceSyncProgress } from '@/components/ui/sync-progress';
import { useAuth } from '@/contexts/auth-context';
import { getUserServices } from '@/lib/services/streaming-auth';
import { syncLibrary } from '@/lib/services/sync';
import { ServiceType, SyncProgress } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

interface SyncProgress {
  phase: string;
  current: number;
  total: number;
  service: string;
}

const steps = ['Account', 'Services', 'Sync'];

export function MultiStepRegistration() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
  });
  const [syncProgress, setSyncProgress] = useState<
    Record<ServiceType, SyncProgress>
  >({});

  // Effect to handle registration completion
  useEffect(() => {
    if (user && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [user, currentStep]);

  // Effect to handle rate limit countdown
  useEffect(() => {
    if (rateLimitSeconds === null) return;
    if (rateLimitSeconds <= 0) {
      setRateLimitSeconds(null);
      return;
    }

    const timer = setTimeout(() => {
      setRateLimitSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [rateLimitSeconds]);

  const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rateLimitSeconds !== null) {
      toast.error(
        `Please wait ${rateLimitSeconds} seconds before trying again`
      );
      return;
    }

    setLoading(true);

    if (
      !registrationData.email ||
      !registrationData.password ||
      !registrationData.name
    ) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await register(
        registrationData.email,
        registrationData.password,
        registrationData.name
      );
      // Don't set currentStep here, let the effect handle it
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        // Extract rate limit seconds from error message
        const match = error.message.match(/after (\d+) seconds/);
        if (match) {
          const seconds = parseInt(match[1], 10);
          setRateLimitSeconds(seconds);
          toast.error(`Please wait ${seconds} seconds before trying again`);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleServicesComplete = async () => {
    if (!user) {
      toast.error('Please create an account first');
      return;
    }

    try {
      const connectedServices = await getUserServices(user.id);
      if (connectedServices.length === 0) {
        toast.error('Please connect at least one service');
        return;
      }
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to check connected services:', error);
      toast.error('Failed to verify connected services');
    }
  };

  const handleSyncComplete = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const connectedServices = await getUserServices(user.id);

      // Initialize progress for each service
      const initialProgress = connectedServices.reduce(
        (acc, service) => ({
          ...acc,
          [service]: {
            phase: 'albums' as const,
            current: 0,
            total: 100,
            service,
          },
        }),
        {} as Record<ServiceType, SyncProgress>
      );
      setSyncProgress(initialProgress);

      // Sync libraries for connected services
      const syncPromises = connectedServices.map((service) =>
        syncLibrary(user.id, service, (progress) => {
          setSyncProgress((prev) => ({
            ...prev,
            [service]: progress,
          }));
        })
      );

      await Promise.all(syncPromises);
      toast.success('Libraries synced successfully!');
      navigate('/library');
    } catch (error) {
      console.error('Failed to sync libraries:', error);
      toast.error('Failed to sync libraries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-accent/10 p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-center">Create an account</CardTitle>
            <Progress value={((currentStep + 1) / steps.length) * 100} />
            <p className="text-center text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Name"
                    value={registrationData.name}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    minLength={2}
                    disabled={loading || rateLimitSeconds !== null}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={registrationData.email}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    disabled={loading || rateLimitSeconds !== null}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={registrationData.password}
                    onChange={(e) =>
                      setRegistrationData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    minLength={6}
                    disabled={loading || rateLimitSeconds !== null}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || rateLimitSeconds !== null}
                >
                  {loading
                    ? 'Creating Account...'
                    : rateLimitSeconds !== null
                    ? `Wait ${rateLimitSeconds}s...`
                    : 'Continue'}
                </Button>
              </form>
            )}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <ServiceConnection
                    service="spotify"
                    onConnect={() => toast.success('Connected to Spotify')}
                  />
                  <ServiceConnection
                    service="apple-music"
                    onConnect={() => toast.success('Connected to Apple Music')}
                  />
                </div>
                <Button
                  onClick={handleServicesComplete}
                  className="w-full"
                  disabled={loading}
                >
                  Continue
                </Button>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Syncing your music libraries...
                </p>
                <div className="space-y-4">
                  {Object.entries(syncProgress).map(([service, progress]) => (
                    <ServiceSyncProgress
                      key={service}
                      serviceName={service as ServiceType}
                      progress={progress}
                    />
                  ))}
                </div>
                <Button
                  disabled={loading}
                  onClick={handleSyncComplete}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Start Sync'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
