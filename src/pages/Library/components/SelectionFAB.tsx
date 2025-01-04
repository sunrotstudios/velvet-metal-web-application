import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectionFABProps {
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleSelection: () => void;
  onConfirmSelection: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SelectionFAB({
  isSelectionMode,
  selectedCount,
  totalCount,
  onToggleSelection,
  onConfirmSelection,
  onSelectAll,
  onDeselectAll,
}: SelectionFABProps) {
  return (
    <AnimatePresence>
      {isSelectionMode && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50"
        >
          <div className="flex items-center gap-2 rounded-full border bg-background/80 p-1.5 backdrop-blur-md shadow-lg">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-background"
              onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
            >
              <CheckSquare className={cn(
                "h-5 w-5",
                selectedCount === totalCount && "text-primary"
              )} />
            </Button>
            <div className="px-4">
              <span className="text-sm font-medium">
                {selectedCount} of {totalCount} selected
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-background"
              onClick={onToggleSelection}
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="default"
              className={cn(
                'h-9 w-9 rounded-full',
                selectedCount === 0 && 'pointer-events-none opacity-50'
              )}
              onClick={onConfirmSelection}
            >
              <Check className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
