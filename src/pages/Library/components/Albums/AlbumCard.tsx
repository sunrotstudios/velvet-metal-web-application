import { Card, CardContent } from '@/components/ui/card';
import { ViewMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { AlbumTransferModal } from '../AlbumTransferModal';
import { useAuth } from '@/contexts/auth-context';
import { usePrefetchAlbum } from '@/lib/hooks/useAlbumQueries';
import { Checkbox } from '../ui/checkbox';

interface AlbumCardProps {
  album: {
    id: string;
    album_id: string;
    name: string;
    artist_name: string;
    image_url: string | null;
    release_date: string;
    service: 'spotify' | 'apple-music';
    tracks_count: number;
    external_url: string | null;
    album_type: string;
  };
  viewMode: ViewMode;
  isSelectionMode: boolean;
  onSelect?: (album: AlbumCardProps['album']) => void;
  isSelected?: boolean;
}

export const AlbumCard = ({ 
  album, 
  viewMode,
  isSelectionMode,
  onSelect,
  isSelected,
}: AlbumCardProps) => {
  const navigate = useNavigate();
  const releaseYear = album.release_date?.split('-')[0];
  const { user } = useAuth();
  const { prefetchAlbum } = usePrefetchAlbum();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(album);
      return;
    }

    if (!album.album_id) {
      console.error('No album_id available for album:', album);
      return;
    }

    if (user?.id) {
      prefetchAlbum(album.album_id, user.id, album.service);
    }

    navigate(`/album/${album.album_id}`, {
      state: { service: album.service }
    });
  };

  const handleMouseEnter = () => {
    if (!isSelectionMode && user && album.album_id) {
      prefetchAlbum(album.album_id, user.id);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add play functionality here
  };

  const handleTransferClick = () => {
    setIsTransferModalOpen(true);
  };

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden border-none bg-transparent shadow-none transition-all hover:bg-accent cursor-pointer",
          viewMode === 'list' && "hover:bg-accent/5",
          isSelected && "bg-accent"
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        <CardContent className={cn(
          "p-4",
          viewMode === 'list' && "px-6 py-3"
        )}>
          <div
            className={cn(
              'flex',
              viewMode === 'grid'
                ? 'flex-col space-y-2'
                : 'flex-row items-center gap-6'
            )}
          >
            {/* Album Artwork */}
            <div
              className={cn(
                'group relative overflow-hidden rounded-xl',
                viewMode === 'grid'
                  ? 'aspect-square w-full'
                  : 'h-[72px] w-[72px] flex-shrink-0'
              )}
            >
              {album.image_url ? (
                <img
                  src={album.image_url}
                  alt={album.name}
                  className="h-full w-full object-cover transition-all group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  {/* <Music className="h-12 w-12 text-muted-foreground" /> */}
                </div>
              )}
              {!isSelectionMode && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-transform"
                    aria-label="Play album"
                    onClick={handlePlayClick}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-transform"
                    aria-label="Transfer album"
                    onClick={handleTransferClick}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {isSelectionMode && (
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect?.(album)}
                    className="h-5 w-5 rounded-sm bg-white/80 border-2 border-white/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
              )}
            </div>

            {/* Album Info */}
            {viewMode === 'grid' ? (
              <div className="flex flex-col min-w-0">
                <h3 className="line-clamp-1 text-sm font-medium">{album.name}</h3>
                <p className="line-clamp-1 text-xs sm:text-sm text-muted-foreground">
                  {album.artist_name}
                </p>
              </div>
            ) : (
              <div className="flex flex-1 items-center gap-6">
                {/* Title and Artist */}
                <div className="flex-1 min-w-0">
                  <h3 className="line-clamp-1 text-sm font-medium">{album.name}</h3>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {album.artist_name}
                  </p>
                </div>

                {/* Album Type */}
                <div className="w-24 flex-shrink-0 hidden md:block">
                  <span className="text-sm capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {album.album_type}
                  </span>
                </div>

                {/* Track Count */}
                <div className="w-24 flex-shrink-0 text-sm text-muted-foreground hidden md:block">
                  {album.tracks_count}
                </div>

                {/* Release Year */}
                <div className="w-20 flex-shrink-0 text-sm text-muted-foreground hidden md:block">
                  {releaseYear}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlbumTransferModal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        sourceService={album.service}
        album={album}
        userId={user!.id}
        onTransferComplete={() => setIsTransferModalOpen(false)}
      />
    </>
  );
};
