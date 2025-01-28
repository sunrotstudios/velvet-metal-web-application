import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

interface TransferLogProps {
  logs: LogEntry[];
  className?: string;
}

export function TransferLog({ logs, className }: TransferLogProps) {
  return (
    <div className={cn('h-full flex flex-col', className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="space-y-1">
          <h3 className="font-semibold tracking-tight">Transfer Log</h3>
          <p className="text-sm text-muted-foreground">
            Real-time transfer progress and status updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
              <p className="text-sm">No transfer logs yet</p>
              <p className="text-xs">
                Start a transfer to see progress updates
              </p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={cn(
                  'text-sm rounded-lg p-3 border transition-colors',
                  {
                    'bg-muted/50 border-muted/50': log.type === 'info',
                    'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-500':
                      log.type === 'success',
                    'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-500':
                      log.type === 'error',
                  }
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    {log.type === 'info' && (
                      <span className="text-blue-500">ℹ️</span>
                    )}
                    {log.type === 'success' && (
                      <span className="text-green-500">✓</span>
                    )}
                    {log.type === 'error' && (
                      <span className="text-red-500">✕</span>
                    )}
                    <span className="flex-1">{log.message}</span>
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
