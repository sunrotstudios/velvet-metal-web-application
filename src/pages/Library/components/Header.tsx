import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ServiceType } from '@/lib/types';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeService: ServiceType;
  onRefresh: () => void;
}

export const Header = ({ activeService, onRefresh }: HeaderProps) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Library</h2>
        <p className="text-muted-foreground">
          Your music collection from{' '}
          {activeService === 'spotify' ? 'Spotify' : 'Apple Music'}
        </p>
      </div>
      {/* Refresh button temporarily hidden until fully developed */}
      {/* <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                className="h-8 w-8"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Library</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div> */}
    </div>
  );
};
