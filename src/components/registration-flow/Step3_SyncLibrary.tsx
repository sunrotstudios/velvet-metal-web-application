import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth-context';
import { getAllSpotifyAlbums } from '@/lib/api/spotify';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Step3_SyncLibraryProps {
  onComplete: () => void;
}

export function Step3_SyncLibrary({ onComplete }: Step3_SyncLibraryProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) {
      syncLibrary();
    }
  }, [user]);

  const syncLibrary = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setProgress(0);

      // Get all albums from Spotify
      await getAllSpotifyAlbums(user.id, '', (current, total) => {
        setProgress(Math.round((current / total) * 100));
      });

      toast.success('Library synced successfully');
      onComplete();
    } catch (error: any) {
      console.error('Failed to sync library:', error);
      toast.error('Failed to sync library');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Syncing Library</h1>
        <p className="text-sm text-muted-foreground">
          We're syncing your music library
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <p className="text-center text-sm text-muted-foreground">
          {loading
            ? `${progress}% complete`
            : progress === 100
            ? 'Sync complete!'
            : 'Starting sync...'}
        </p>
        {!loading && progress < 100 && (
          <Button className="w-full" onClick={syncLibrary}>
            Retry Sync
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
