import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  centered?: boolean;
  label?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  centered = false,
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        centered && 'items-center justify-center min-h-[200px]',
        className
      )}
      role="status"
      aria-label={label || 'Loading'}
    >
      <div
        className={cn(
          'rounded-full border-primary/30',
          'border-t-primary',
          'animate-[spin_0.6s_linear_infinite]',
          sizeClasses[size]
        )}
      />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );
}
