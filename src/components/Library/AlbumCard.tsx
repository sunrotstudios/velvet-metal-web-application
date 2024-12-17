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
}

export const AlbumCard = ({ album, viewMode }: AlbumCardProps) => {
  const navigate = useNavigate();
  const releaseYear = album.release_date?.split('-')[0];

  const { user } = useAuth();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleClick = () => {
    if (!album.album_id) {
      console.error('No album_id available for album:', album);
      return;
    }

    navigate(`/album/${album.album_id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add play functionality here
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add playlist functionality here
  };

  const handleTransferClick = () => {
    setIsTransferModalOpen(true);
  };

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden border-none bg-transparent shadow-none transition-all hover:bg-accent cursor-pointer",
          viewMode === 'list' && "hover:bg-accent/5"
        )}
        onClick={handleClick}
      >
        <CardContent className={cn(
          "p-4",
          viewMode === 'list' && "px-4 sm:px-6 py-3"
        )}>
          <div
            className={cn(
              'flex',
              viewMode === 'grid'
                ? 'flex-col space-y-2'
                : 'flex-row items-center gap-2 sm:gap-6'
            )}
          >
            {/* Album Artwork */}
            <div
              className={cn(
                'group relative overflow-hidden rounded-xl',
                viewMode === 'grid'
                  ? 'aspect-square w-full'
                  : 'h-[50px] w-[50px] sm:h-[72px] sm:w-[72px] flex-shrink-0'
              )}
            >
              {album.image_url ? (
                <img
                  src={album.image_url}
                  alt={album.name}
                  className="h-full w-full object-cover transition-all group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted" />
              )}
              {/* Hide overlay controls on mobile */}
              <div className="absolute inset-0 hidden sm:flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
            </div>

            {/* Album Info */}
            {viewMode === 'grid' ? (
              <div className="flex flex-col min-w-0">
                <h3 className="line-clamp-1 text-sm font-medium">{album.name}</h3>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {album.artist_name}
                </p>
                {/* Mobile actions for grid view */}
                <div className="flex items-center gap-2 mt-2 sm:hidden">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 flex-1 text-xs"
                    onClick={handleTransferClick}
                  >
                    Transfer
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={handlePlayClick}
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center gap-2 sm:gap-6">
                {/* Title and Artist */}
                <div className="flex-1 min-w-0">
                  <h3 className="line-clamp-1 text-sm font-medium">{album.name}</h3>
                  <p className="line-clamp-1 text-xs sm:text-sm text-muted-foreground">
                    {album.artist_name}
                  </p>
                </div>

                {/* Mobile Actions for list view */}
                <div className="flex items-center gap-1 sm:hidden">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleTransferClick}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Desktop-only info */}
                <div className="hidden sm:block w-24 flex-shrink-0">
                  <span className="text-sm capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {album.album_type}
                  </span>
                </div>
                <div className="hidden sm:block w-24 flex-shrink-0 text-sm text-muted-foreground">
                  {album.tracks_count}
                </div>
                <div className="hidden sm:block w-20 flex-shrink-0 text-sm text-muted-foreground">
                  {releaseYear}
                </div>
                <div className="hidden sm:block w-24 flex-shrink-0 text-sm text-muted-foreground capitalize">
                  {album.service === 'apple-music' ? 'Apple Music' : 'Spotify'}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {user && (
        <AlbumTransferModal
          open={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
          sourceService={album.service}
          album={album}
          userId={user.id}
        />
      )}
    </>
  );
};
