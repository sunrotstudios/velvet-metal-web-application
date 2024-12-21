import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  label?: string;
  centered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({
  label,
  centered = false,
  size = 'md',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3',
        centered && 'justify-center h-full'
      )}
    >
      <motion.div
        className={cn(
          'text-primary rounded-full border-2 border-primary border-t-transparent',
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
