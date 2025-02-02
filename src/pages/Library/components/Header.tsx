import { ServiceType } from '@/lib/types';

interface HeaderProps {
  activeService: ServiceType;
  onRefresh: () => void;
}

export const Header = ({ activeService, onRefresh }: HeaderProps) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-polymath text-4xl font-bold tracking-normal text-white mb-2">Your Library</h2>
        <p className="text-white/60 font-sans">
          Your music collection from{' '}
          {activeService === 'spotify' ? 'Spotify' : 'Apple Music'}
        </p>
      </div>
    </div>
  );
};
