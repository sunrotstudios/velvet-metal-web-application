import { Card } from '@/components/ui/card';
import { NormalizedAlbum, ViewMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface AlbumCardProps {
  album: NormalizedAlbum;
  viewMode: ViewMode;
}

export const AlbumCard = ({ album, viewMode }: AlbumCardProps) => {
  const navigate = useNavigate();
  const releaseYear = album.releaseDate?.split('-')[0];

  const handleClick = () => {
    const albumId = album.sourceId || album.id;

    if (!albumId) {
      console.error('No valid ID available for album:', album);
      return;
    }

    if (!/^[0-9A-Za-z]{22}$/.test(albumId)) {
      console.error('Invalid Spotify album ID format:', albumId);
      return;
    }

    navigate(`/album/${albumId}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add play functionality here
  };

  const handleAddToPlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add playlist functionality here
  };

  return (
    <Card
      className="group relative overflow-hidden border-none bg-transparent shadow-none transition-all hover:bg-accent cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={cn(
          'flex',
          viewMode === 'grid'
            ? 'flex-col space-y-2'
            : 'flex-row items-center gap-3'
        )}
      >
        <div
          className={cn(
            'group relative overflow-hidden rounded-xl',
            viewMode === 'grid'
              ? 'aspect-square w-full'
              : 'h-16 w-16 sm:h-20 sm:w-20'
          )}
        >
          <img
            src={album.artwork.url}
            alt={`${album.name} cover`}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-transform"
              aria-label="Play album"
              onClick={handlePlayClick}
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="line-clamp-1 text-sm font-medium">{album.name}</h3>
          <p className="line-clamp-1 text-xs sm:text-sm text-muted-foreground">
            {album.artistName}
          </p>
          {viewMode === 'list' && (
            <p className="mt-1 text-xs text-muted-foreground">{releaseYear}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
