import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewMode, Playlist } from '@/lib/types';
import { Play, Plus } from 'lucide-react';

interface PlaylistCardProps {
  playlist: Playlist;
  viewMode: ViewMode;
  onTransfer: (playlist: Playlist) => void;
}

export const PlaylistCard = ({
  playlist,
  viewMode,
  onTransfer,
}: PlaylistCardProps) => {
  const getTrackCount = () => {
    if (playlist.tracks?.total) return playlist.tracks.total;
    if (playlist.attributes?.trackCount) return playlist.attributes.trackCount;
    return 0;
  };

  const getArtworkUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('api.spotify.com')) return url;
    return url.replace('{w}', '500').replace('{h}', '500');
  };

  const playlistName = playlist.name || playlist.attributes?.name;
  const trackCount = getTrackCount();

  return (
    <Card
      className="group relative overflow-hidden border-none bg-transparent shadow-none transition-all hover:bg-accent"
      role="button"
      tabIndex={0}
      aria-label={`Playlist: ${playlistName}`}
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
          <img
            src={getArtworkUrl(
              playlist.images?.[0]?.url || playlist.attributes?.artwork?.url
            )}
            alt={`${playlistName} cover`}
            className="h-full w-full object-cover transition-all duration-300 group-hover/image:scale-105"
          />
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
                {playlistName}
              </h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => onTransfer(playlist)}
              aria-label={`Transfer playlist: ${playlistName}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
