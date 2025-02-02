import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={cn('flex flex-col h-[400px] max-h-[400px] bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg border border-white/20', className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 shrink-0 bg-white/5">
        <div>
          <h3 className="font-radlush text-lg font-medium text-white">Transfer Log</h3>
          <p className="text-sm text-white/60">
            Real-time transfer progress and status updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 text-white/60">
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
                    'bg-white/5 border-white/10 text-white': log.type === 'info',
                    'bg-green-500/10 border-green-500/20 text-green-400':
                      log.type === 'success',
                    'bg-red-500/10 border-red-500/20 text-red-400':
                      log.type === 'error',
                  }
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    {log.type === 'info' && (
                      <span className="text-blue-400">ℹ️</span>
                    )}
                    {log.type === 'success' && (
                      <span className="text-green-400">✓</span>
                    )}
                    {log.type === 'error' && (
                      <span className="text-red-400">✕</span>
                    )}
                    <span className="flex-1">{log.message}</span>
                  </span>
                  <span className="text-xs text-white/40 whitespace-nowrap">
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
      </div>
    </div>
  );
}
