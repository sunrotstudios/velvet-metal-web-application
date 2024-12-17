import { Progress } from '@/components/ui/progress';
import { ServiceType, SyncProgress } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

interface SyncProgressProps {
  progress: SyncProgress;
  serviceName: ServiceType;
}

export function ServiceSyncProgress({
  progress,
  serviceName,
}: SyncProgressProps) {
  const isComplete = progress.phase === 'complete';
  const percent = Math.round((progress.current / progress.total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          <span className="capitalize">{serviceName}</span>
        </div>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <Progress
        value={percent}
        className={cn(
          'h-1.5',
          isComplete && 'bg-green-500/20',
          progress.phase === 'albums' && 'bg-blue-500/20',
          progress.phase === 'playlists' && 'bg-purple-500/20'
        )}
      />
      <p className="text-xs text-muted-foreground capitalize">
        {progress.phase === 'complete'
          ? 'Sync complete'
          : `Syncing ${progress.phase}...`}
      </p>
    </div>
  );
}
