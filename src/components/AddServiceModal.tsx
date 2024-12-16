import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Music, Music2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import { authorizeSpotify } from '@/lib/services/spotify-auth';
import { authorizeAppleMusic } from '@/lib/services/apple-music-auth';
import { syncAppleMusicLibrary } from '@/lib/services/apple-music-library';
import { toast } from '@/components/ui/use-toast';

export function AddServiceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingService, setSyncingService] = useState<'spotify' | 'apple-music' | null>(null);
  
  const { user } = useAuth();
  const { refetch: refetchConnectedServices } = useConnectedServices();

  const handleConnect = async (service: 'spotify' | 'apple-music') => {
    if (!user) return;
    
    try {
      setSyncingService(service);
      setIsSyncing(true);
      setSyncProgress(0);
      
      // Start the connection process
      if (service === 'spotify') {
        // Store the current URL to return to after auth
        sessionStorage.setItem('auth_callback_url', window.location.pathname);
        // This will redirect to Spotify
        await authorizeSpotify(user.id);
        return; // Don't continue after redirect
      } else {
        await authorizeAppleMusic(user.id);
        
        // Start syncing Apple Music library in the background
        toast.promise(
          syncAppleMusicLibrary(user.id, (progress) => {
            setSyncProgress(progress);
          }),
          {
            loading: 'Syncing Apple Music library...',
            success: 'Library sync complete!',
            error: 'Failed to sync library',
          }
        );
      }

      await refetchConnectedServices();
      setIsOpen(false);
      
      toast.success(`Connected to ${service === 'spotify' ? 'Spotify' : 'Apple Music'}`);
    } catch (error) {
      console.error(`Failed to connect to ${service}:`, error);
      toast({
        title: 'Error',
        description: `Failed to connect to ${
          service === 'spotify' ? 'Spotify' : 'Apple Music'
        }. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      if (service !== 'spotify') { // Don't reset for Spotify since we're redirecting
        setIsSyncing(false);
        setSyncingService(null);
        setSyncProgress(0);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Music Service</DialogTitle>
          <DialogDescription>
            Choose a music service to connect to your account
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={() => handleConnect('spotify')}
            disabled={isSyncing}
          >
            <Music className="h-4 w-4" />
            Connect Spotify
            {syncingService === 'spotify' && (
              <Progress value={syncProgress} className="ml-2" />
            )}
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={() => handleConnect('apple-music')}
            disabled={isSyncing}
          >
            <Music2 className="h-4 w-4" />
            Connect Apple Music
            {syncingService === 'apple-music' && (
              <Progress value={syncProgress} className="ml-2" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
