import { Button } from '@/components/ui/button';
import { ServiceType } from '@/lib/types';
import { Music, Music2 } from 'lucide-react';

interface ServiceToggleProps {
  activeService: ServiceType;
  setActiveService: (service: ServiceType) => void;
}

export const ServiceToggle = ({
  activeService,
  setActiveService,
}: ServiceToggleProps) => {
  return (
    <div className="flex items-center gap-0.5 rounded-md border p-0.5">
      <Button
        variant={activeService === 'spotify' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setActiveService('spotify')}
        className="flex items-center gap-2"
      >
        <Music className="h-4 w-4" />
        <span className="hidden sm:inline">Spotify</span>
      </Button>
      <Button
        variant={activeService === 'apple-music' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setActiveService('apple-music')}
        className="flex items-center gap-2"
      >
        <Music2 className="h-4 w-4" />
        <span className="hidden sm:inline">Apple Music</span>
      </Button>
    </div>
  );
};
