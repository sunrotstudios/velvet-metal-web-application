import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import pb from '@/lib/pocketbase';
import { CustomPlaylist } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCustomPlaylistMenuProps {
  track: {
    name: string;
    artistName: string;
    albumName: string;
    isrc?: string;
    durationMs?: number;
  };
}

export function AddToCustomPlaylistMenu({
  track,
}: AddToCustomPlaylistMenuProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: customPlaylists = [] } = useQuery({
    queryKey: ['customPlaylists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const records = await pb.collection('customPlaylists').getFullList({
        filter: `user = "${user.id}"`,
        sort: '-created',
      });
      return records;
    },
    enabled: !!user,
  });

  const handleAddToPlaylist = async (playlist: CustomPlaylist) => {
    try {
      const newTrack = {
        id: crypto.randomUUID(),
        name: track.name,
        artist: track.artistName,
        album: track.albumName,
        isrc: track.isrc,
        durationMs: track.durationMs,
      };

      const updatedTracks = [...playlist.tracks, newTrack];

      await pb.collection('customPlaylists').update(playlist.id, {
        tracks: updatedTracks,
      });

      queryClient.invalidateQueries(['customPlaylists', user?.id]);
      toast.success(`Added "${track.name}" to ${playlist.name}`);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      toast.error('Failed to add track to playlist');
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {customPlaylists.length === 0 ? (
          <DropdownMenuItem disabled>No custom playlists</DropdownMenuItem>
        ) : (
          customPlaylists.map((playlist) => (
            <DropdownMenuItem
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist)}
            >
              {playlist.name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
