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
        className="group relative overflow-hidden border-none bg-transparent shadow-none transition-all hover:bg-accent cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-4">
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-transform"
                  aria-label="Transfer album"
                  onClick={handleTransferClick}
                >
                  <ArrowLeftRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="line-clamp-1 text-sm font-medium">{album.name}</h3>
              <p className="line-clamp-1 text-xs sm:text-sm text-muted-foreground">
                {album.artist_name}
              </p>
              {viewMode === 'list' && (
                <p className="mt-1 text-xs text-muted-foreground">{releaseYear}</p>
              )}
            </div>
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
