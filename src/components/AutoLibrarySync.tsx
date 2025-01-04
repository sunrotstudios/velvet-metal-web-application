import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLibrarySync } from '@/lib/hooks/useLibrarySync';

const SYNC_INTERVAL = 1000 * 60 * 30; // 30 minutes

export function AutoLibrarySync() {
  const { user } = useAuth();
  const { syncAllLibraries, lastSyncTimes } = useLibrarySync();

  useEffect(() => {
    if (!user) return;

    // Check if we need to sync
    const needsSync = Object.entries(lastSyncTimes ?? {}).some(([_, lastSync]) => {
      if (!lastSync) return true;
      const timeSinceLastSync = Date.now() - lastSync.getTime();
      return timeSinceLastSync > SYNC_INTERVAL;
    });

    if (needsSync) {
      syncAllLibraries();
    }

    // Set up periodic sync
    const interval = setInterval(() => {
      syncAllLibraries();
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [user, lastSyncTimes, syncAllLibraries]);

  return null;
}
