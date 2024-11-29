import { CustomPlaylistCard } from '@/components/Library/CustomPlaylistCard';
import { CustomPlaylistDialog } from '@/components/Library/CustomPlaylistDialog';
import { CustomPlaylistView } from '@/components/Library/CustomPlaylistView';
import VirtualizedPlaylistGrid from '@/components/Library/VirtualizedPlaylistGrid';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { usePlex } from '@/contexts/plex-context';
import { PlexAPI } from '@/lib/api/plex';
import pb from '@/lib/pocketbase';
import { CustomPlaylist } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CustomPlaylists() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { plexToken, isPlexConnected, connectPlex } = usePlex();

  const [selectedPlaylist, setSelectedPlaylist] =
    useState<CustomPlaylist | null>(null);
  const [isCustomPlaylistDialogOpen, setIsCustomPlaylistDialogOpen] =
    useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<
    CustomPlaylist | undefined
  >();

  const { data: userCustomPlaylists = [], isLoading } = useQuery({
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

  const { data: plexLibraries = [] } = useQuery({
    queryKey: ['plexLibraries', plexToken],
    queryFn: async () => {
      if (!plexToken) return [];
      const plexApi = new PlexAPI(plexToken);
      const servers = await plexApi.getServers();
      if (servers.length > 0) {
        return plexApi.getMusicLibrary(servers[0].id);
      }
      return [];
    },
    enabled: isPlexConnected,
  });

  const handleSaveCustomPlaylist = async (
    playlistData: Omit<CustomPlaylist, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    console.log('Saving playlist with tracks:', playlistData.tracks);

    try {
      if (!user) {
        toast.error('You must be logged in to create playlists');
        return;
      }

      if (editingPlaylist) {
        await pb.collection('customPlaylists').update(editingPlaylist.id, {
          name: playlistData.name,
          description: playlistData.description,
          tracks: playlistData.tracks,
          user: user.id,
        });
        toast.success('Playlist updated successfully');
      } else {
        await pb.collection('customPlaylists').create({
          name: playlistData.name,
          description: playlistData.description,
          tracks: playlistData.tracks,
          user: user.id,
        });
        toast.success('Playlist created successfully');
      }

      queryClient.invalidateQueries(['customPlaylists', user.id]);
      setEditingPlaylist(undefined);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast.error('Failed to save playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      await pb.collection('customPlaylists').delete(playlistId);
      toast.success('Playlist deleted successfully');
      queryClient.invalidateQueries(['customPlaylists', user?.id]);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading playlists...</h2>
        </div>
      </div>
    );
  }

  if (selectedPlaylist) {
    return (
      <div>
        <Button
          variant="ghost"
          className="m-8 gap-2"
          onClick={() => setSelectedPlaylist(null)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Playlists
        </Button>
        <CustomPlaylistView
          playlist={selectedPlaylist}
          onEdit={(playlist) => {
            setEditingPlaylist(playlist);
            setIsCustomPlaylistDialogOpen(true);
          }}
          onDelete={handleDeletePlaylist}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Custom Playlists
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your custom playlists
          </p>
        </div>
        <div className="flex gap-2">
          {!isPlexConnected && (
            <Button onClick={connectPlex} variant="outline">
              Connect Plex
            </Button>
          )}
          <Button
            onClick={() => {
              setEditingPlaylist(undefined);
              setIsCustomPlaylistDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      </div>

      <VirtualizedPlaylistGrid
        items={userCustomPlaylists}
        ItemComponent={CustomPlaylistCard}
        onTransfer={() => {}}
        onEdit={(playlist) => {
          setEditingPlaylist(playlist);
          setIsCustomPlaylistDialogOpen(true);
        }}
        onDelete={handleDeletePlaylist}
        onClick={setSelectedPlaylist}
      />

      <CustomPlaylistDialog
        open={isCustomPlaylistDialogOpen}
        onOpenChange={setIsCustomPlaylistDialogOpen}
        playlist={editingPlaylist}
        onSave={handleSaveCustomPlaylist}
      />
    </div>
  );
}
