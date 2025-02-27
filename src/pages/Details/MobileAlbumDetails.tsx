import { Button } from '@/components/ui/button';
import { AlbumTrack, DetailedAlbum } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { ArrowLeft, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileAlbumDetailsProps {
  album: DetailedAlbum;
}

export function MobileAlbumDetails({ album }: MobileAlbumDetailsProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const options = {
      threshold: 0,
      rootMargin: '-80px 0px 0px 0px' // Adjust this value to control when the collapse happens
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsCollapsed(!entry.isIntersecting);
    }, options);

    if (headerRef.current) {
      observerRef.current.observe(headerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs supports-backdrop-filter:bg-background/60 transition-all duration-300">
        <div className="flex items-center p-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className={cn(
            "flex items-center gap-4 transition-opacity duration-300",
            isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {album.artwork?.url && (
              <img
                src={album.artwork.url}
                alt={album.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold truncate">{album.name}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {album.artistName}
              </p>
            </div>
          </div>
          <Button size="icon" className="shrink-0 ml-auto">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Album Info */}
        <div ref={headerRef} className="p-6 pb-4 bg-background">
          <div className={cn(
            "aspect-square w-full max-w-sm mx-auto mb-4 transition-all duration-300",
            isCollapsed && "scale-95 opacity-0"
          )}>
            <img
              src={album.artwork.url}
              alt={album.name}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className={cn(
            "space-y-1 text-center transition-all duration-300",
            isCollapsed && "scale-95 opacity-0"
          )}>
            <h2 className="text-xl font-semibold">{album.name}</h2>
            <p className="text-muted-foreground">{album.artistName}</p>
            <p className="text-sm text-muted-foreground">
              {album.releaseDate.split('-')[0]} • {album.trackCount} songs
            </p>
          </div>
        </div>

        {/* Tracks List */}
        <div className="divide-y divide-border pb-24">
          {album.tracks.map((track: AlbumTrack, index: number) => (
            <div
              key={track.id}
              className="flex items-center px-6 py-3 hover:bg-muted/50"
            >
              <div className="w-8 text-center text-sm text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0 px-4">
                <div className="truncate">{track.name}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {track.artistName}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDuration(track.durationMs)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
