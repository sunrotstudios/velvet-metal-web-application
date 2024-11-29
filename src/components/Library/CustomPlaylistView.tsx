import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomPlaylist, CustomTrack } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { Clock, MoreVertical, Play } from 'lucide-react';

interface CustomPlaylistViewProps {
  playlist: CustomPlaylist;
  onEdit: (playlist: CustomPlaylist) => void;
  onDelete: (playlistId: string) => void;
}

export function CustomPlaylistView({
  playlist,
  onEdit,
  onDelete,
}: CustomPlaylistViewProps) {
  return (
    <div className="flex flex-col space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start gap-8">
        <div className="relative aspect-square w-48 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          <Play className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="flex flex-col justify-end space-y-4">
          <div>
            <h1 className="text-4xl font-bold">{playlist.name}</h1>
            <p className="text-xl text-muted-foreground">
              {playlist.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{playlist.tracks.length} tracks</span>
          </div>
          <div className="flex items-center gap-3">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Play
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(playlist)}>
                  Edit Playlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(playlist.id)}
                  className="text-destructive"
                >
                  Delete Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-4 px-4 text-sm text-muted-foreground">
          <span>Title</span>
          <span>Artist</span>
          <span>Album</span>
          <Clock className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          {playlist.tracks.map((track: CustomTrack) => (
            <div
              key={track.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-4 rounded-md px-4 py-2 hover:bg-accent group"
            >
              <span className="font-medium">{track.name}</span>
              <span className="text-muted-foreground">{track.artist}</span>
              <span className="text-muted-foreground">{track.album}</span>
              <span className="text-sm text-muted-foreground">
                {track.durationMs ? formatDuration(track.durationMs) : '--:--'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
