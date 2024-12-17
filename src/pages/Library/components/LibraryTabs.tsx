import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LibraryIcon, ListMusic } from 'lucide-react';

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const LibraryTabs = ({ activeTab, onTabChange }: LibraryTabsProps) => {
  return (
    <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
      <TabsTrigger
        value="albums"
        onClick={() => onTabChange('albums')}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-5 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      >
        <LibraryIcon className="mr-2 h-4 w-4" />
        Albums
      </TabsTrigger>
      <TabsTrigger
        value="playlists"
        onClick={() => onTabChange('playlists')}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-5 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      >
        <ListMusic className="mr-2 h-4 w-4" />
        Playlists
      </TabsTrigger>
    </TabsList>
  );
};
