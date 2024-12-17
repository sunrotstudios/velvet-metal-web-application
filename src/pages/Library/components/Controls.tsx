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
    <div className="flex flex-col">
      {/* Mobile Controls */}
      <div className="flex flex-col space-y-2 md:hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-10 pl-9 w-full bg-background border-none shadow-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between bg-muted/40 rounded-lg p-1">
          <TabsList className="h-9 w-full bg-transparent">
            <TabsTrigger 
              value="albums" 
              className="flex-1 data-[state=active]:bg-background rounded-md"
            >
              <LibraryIcon className="mr-2 h-4 w-4" />
              Albums
            </TabsTrigger>
            <TabsTrigger 
              value="playlists" 
              className="flex-1 data-[state=active]:bg-background rounded-md"
            >
              <ListMusic className="mr-2 h-4 w-4" />
              Playlists
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Controls Row */}
        <div className="flex gap-2">
          <Select value={activeService} onValueChange={(value: ServiceType) => setActiveService(value)}>
            <SelectTrigger className="h-9 flex-1 bg-muted/40 border-none">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="apple-music">Apple Music</SelectItem>
              <SelectItem value="tidal">Tidal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[110px] bg-muted/40 border-none">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="artist-asc">Artist (A-Z)</SelectItem>
              <SelectItem value="artist-desc">Artist (Z-A)</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex h-9 rounded-md bg-muted/40 p-1">
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
          </div>
        </div>

        {/* Album Type Filter (Only show when Albums tab is active) */}
        {activeTab === 'albums' && (
          <Select value={albumTypeFilter} onValueChange={onAlbumTypeChange}>
            <SelectTrigger className="h-9 w-full bg-muted/40 border-none">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="album">Albums Only</SelectItem>
              <SelectItem value="single">Singles Only</SelectItem>
              <SelectItem value="ep">EPs Only</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:grid gap-4 grid-cols-[1fr_auto_auto]">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <TabsList className="h-9">
            <TabsTrigger value="albums">
              <LibraryIcon className="mr-2 h-4 w-4" />
              Albums
            </TabsTrigger>
            <TabsTrigger value="playlists">
              <ListMusic className="mr-2 h-4 w-4" />
              Playlists
            </TabsTrigger>
          </TabsList>

          <Select value={activeService} onValueChange={(value: ServiceType) => setActiveService(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="apple-music">Apple Music</SelectItem>
              <SelectItem value="tidal">Tidal</SelectItem>
            </SelectContent>
          </Select>

          {activeTab === 'albums' && (
            <Select value={albumTypeFilter} onValueChange={onAlbumTypeChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Album Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="album">Album</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="ep">EP</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Middle Section: Search */}
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
            <SelectTrigger className="w-[130px]">
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
