import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomPlaylist } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreVertical, Music, Plus } from 'lucide-react';

interface CustomPlaylistCardProps {
  playlist: CustomPlaylist;
  viewMode: ViewMode;
  onTransfer: (playlist: CustomPlaylist) => void;
  onEdit: (playlist: CustomPlaylist) => void;
  onDelete: (playlistId: string) => void;
}

export const CustomPlaylistCard = ({
  playlist,
  viewMode,
  onTransfer,
  onEdit,
  onDelete,
}: CustomPlaylistCardProps) => {
  return (
    <Card
      className="group relative overflow-hidden border-none bg-card/40 shadow-none transition-all hover:bg-card/80"
      role="button"
      tabIndex={0}
      aria-label={`Playlist: ${playlist.name}`}
    >
      <div
        className={cn(
          'flex',
          viewMode === 'grid' ? 'flex-col' : 'flex-row items-center gap-4'
        )}
      >
        <div
          className={cn(
            'group/image relative overflow-hidden rounded-md transition-shadow duration-300',
            viewMode === 'grid' ? 'aspect-square w-full' : 'h-20 w-20',
            'shadow-md group-hover:shadow-lg'
          )}
        >
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="flex flex-1 flex-col space-y-1 p-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-1 font-medium leading-tight tracking-tight">
                {playlist.name}
              </h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {playlist.tracks.length}{' '}
                {playlist.tracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onTransfer(playlist)}
                aria-label="Transfer playlist"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(playlist)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(playlist.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
