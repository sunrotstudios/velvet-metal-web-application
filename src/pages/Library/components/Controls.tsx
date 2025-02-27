import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceType, ViewMode } from '@/lib/types';
import {
  Download,
  Grid,
  Library as LibraryIcon,
  List,
  ListMusic,
  Search,
} from 'lucide-react';

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
  albumTypeFilter: 'all' | 'album' | 'single' | 'ep';
  onAlbumTypeChange: (type: 'all' | 'album' | 'single' | 'ep') => void;
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
  albumTypeFilter,
  onAlbumTypeChange,
}: ControlsProps) => {
  return (
    <div className="flex flex-col space-y-2 pr-14 ">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        {/* Left Section: Tabs and Service Selection */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-white/5 p-1 text-white">
            <TabsTrigger
              value="albums"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-5 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand-blue/20 data-[state=active]:text-brand-blue data-[state=active]:shadow-2xs"
            >
              <LibraryIcon className="mr-2 h-4 w-4" />
              Albums
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-5 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand-blue/20 data-[state=active]:text-brand-blue data-[state=active]:shadow-2xs"
            >
              <ListMusic className="mr-2 h-4 w-4" />
              Playlists
            </TabsTrigger>
          </TabsList>

          <Select
            value={activeService}
            onValueChange={(value: ServiceType) => setActiveService(value)}
          >
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/10">
              <SelectItem
                value="spotify"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Spotify
              </SelectItem>
              <SelectItem
                value="apple-music"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Apple Music
              </SelectItem>
              <SelectItem
                value="tidal"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Tidal
              </SelectItem>
            </SelectContent>
          </Select>

          {activeTab === 'albums' ? (
            <Select value={albumTypeFilter} onValueChange={onAlbumTypeChange}>
              <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Album Type" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-white/10">
                <SelectItem
                  value="all"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  All Types
                </SelectItem>
                <SelectItem
                  value="album"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  Album
                </SelectItem>
                <SelectItem
                  value="single"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  Single
                </SelectItem>
                <SelectItem
                  value="ep"
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  EP
                </SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>

        {/* Middle Section: Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
          <Input
            placeholder="Search..."
            className="h-9 pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right Section: Sort and View Controls */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[130px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/10">
              <SelectItem
                value="name-asc"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Name (A-Z)
              </SelectItem>
              <SelectItem
                value="name-desc"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Name (Z-A)
              </SelectItem>
              <SelectItem
                value="artist-asc"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Artist (A-Z)
              </SelectItem>
              <SelectItem
                value="artist-desc"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Artist (Z-A)
              </SelectItem>
              <SelectItem
                value="recent"
                className="text-white focus:bg-white/10 focus:text-white"
              >
                Recent
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex h-9 items-center gap-0.5 rounded-md border border-white/10 bg-white/5 p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-7 w-7 hover:bg-white/10 hover:text-white data-[state=active]:bg-white/10"
              aria-label="Grid View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-7 w-7 hover:bg-white/10 hover:text-white data-[state=active]:bg-white/10"
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="h-7 w-7 hover:bg-white/10 hover:text-white"
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
