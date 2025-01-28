import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Music2, Music4 } from 'lucide-react';

interface ServiceSelectorProps {
  activeService: 'spotify' | 'apple-music';
  onServiceChange: (service: 'spotify' | 'apple-music') => void;
  disabled?: boolean;
  className?: string;
}

export function ServiceSelector({
  activeService,
  onServiceChange,
  disabled = false,
  className,
}: ServiceSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-[160px] justify-start gap-2', className)}
          disabled={disabled}
        >
          {activeService === 'spotify' ? (
            <Music4 className="h-4 w-4" />
          ) : (
            <Music2 className="h-4 w-4" />
          )}
          {activeService === 'spotify' ? 'Spotify' : 'Apple Music'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[160px]">
        <DropdownMenuRadioGroup
          value={activeService}
          onValueChange={(value) =>
            onServiceChange(value as 'spotify' | 'apple-music')
          }
        >
          <DropdownMenuRadioItem value="spotify" className="gap-2">
            <Music4 className="h-4 w-4" />
            Spotify
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="apple-music" className="gap-2">
            <Music2 className="h-4 w-4" />
            Apple Music
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
