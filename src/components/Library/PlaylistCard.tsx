import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NormalizedPlaylist, ViewMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Play, Plus } from 'lucide-react';

interface PlaylistCardProps {
  playlist: NormalizedPlaylist;
  viewMode: ViewMode;
  onTransfer: (playlist: NormalizedPlaylist) => void;
}

export const PlaylistCard = ({
  playlist,
  viewMode,
  onTransfer,
}: PlaylistCardProps) => {
  if (!playlist) {
    return null;
  }

  // Get artwork URL safely with fallback
  const artworkUrl = playlist.artwork?.url || '';

  return (
    <Card
      className="group relative overflow-hidden border-none bg-transparent shadow-none transition-all hover:bg-accent"
      role="button"
      tabIndex={0}
      aria-label={`Playlist: ${playlist.name}`}
    >
      <div
        className={cn(
          'flex',
          viewMode === 'grid'
            ? 'flex-col space-y-3'
            : 'flex-row items-center gap-4'
        )}
      >
        <div
          className={cn(
            'group/image relative overflow-hidden rounded-md',
            viewMode === 'grid' ? 'aspect-square w-full' : 'h-20 w-20'
          )}
        >
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt={`${playlist.name} cover`}
              className="h-full w-full object-cover transition-all duration-300 group-hover/image:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover/image:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-transform"
            >
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col space-y-1 p-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="line-clamp-1 font-medium leading-none">
                {playlist.name}
              </h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {playlist.tracks?.total || 0}{' '}
                {playlist.tracks?.total === 1 ? 'track' : 'tracks'}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onTransfer(playlist)}
              aria-label={`Transfer playlist: ${playlist.name}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
