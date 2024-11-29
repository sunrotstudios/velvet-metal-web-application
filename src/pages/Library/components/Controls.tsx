import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsList } from '@/components/ui/tabs';
import { ServiceType, ViewMode } from '@/lib/types';
import { Download, Grid, List, Music, Music2, Search } from 'lucide-react';

interface ControlsProps {
  activeService: ServiceType;
  setActiveService: (service: ServiceType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onExport: () => void;
  activeTab: string;
}

export const Controls = ({
  activeService,
  setActiveService,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onExport,
  activeTab,
}: ControlsProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        {/* Left Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            {/* Tab triggers moved to LibraryTabs component */}
          </TabsList>

          <div className="flex h-9 items-center gap-0.5 rounded-md border p-0.5">
            <Button
              variant={activeService === 'spotify' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveService('spotify')}
              className="flex-1 sm:flex-initial"
            >
              <Music className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Spotify</span>
            </Button>
            <Button
              variant={activeService === 'apple-music' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveService('apple-music')}
              className="flex-1 sm:flex-initial"
            >
              <Music2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Apple Music</span>
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="artist-asc">Artist (A-Z)</SelectItem>
              <SelectItem value="artist-desc">Artist (Z-A)</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex h-9 items-center gap-0.5 rounded-md border p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-7 w-7"
              aria-label="Grid View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-7 w-7"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onExport}
              className="h-7 w-7"
              aria-label="Export Library"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
