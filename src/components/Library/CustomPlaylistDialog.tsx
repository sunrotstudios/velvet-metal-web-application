import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomPlaylist, CustomTrack } from '@/lib/types';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface CustomPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlist?: CustomPlaylist;
  onSave: (
    playlist: Omit<CustomPlaylist, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
}

export function CustomPlaylistDialog({
  open,
  onOpenChange,
  playlist,
  onSave,
}: CustomPlaylistDialogProps) {
  const [name, setName] = useState(playlist?.name || '');
  const [description, setDescription] = useState(playlist?.description || '');
  const [tracks, setTracks] = useState<CustomTrack[]>(playlist?.tracks || []);

  const handleAddTrack = () => {
    setTracks([
      ...tracks,
      { id: crypto.randomUUID(), name: '', artist: '', album: '' },
    ]);
  };

  const handleRemoveTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleTrackChange = (
    index: number,
    field: keyof CustomTrack,
    value: string
  ) => {
    setTracks(
      tracks.map((track, i) =>
        i === index ? { ...track, [field]: value } : track
      )
    );
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      tracks: tracks.filter(
        (track) => track.name && track.artist && track.album
      ),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {playlist ? 'Edit Playlist' : 'Create Custom Playlist'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Playlist"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Tracks</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddTrack}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Track
              </Button>
            </div>
            <div className="space-y-4">
              {tracks.map((track, index) => (
                <div key={track.id} className="flex gap-2 items-start">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <Input
                      placeholder="Track name"
                      value={track.name}
                      onChange={(e) =>
                        handleTrackChange(index, 'name', e.target.value)
                      }
                    />
                    <Input
                      placeholder="Artist"
                      value={track.artist}
                      onChange={(e) =>
                        handleTrackChange(index, 'artist', e.target.value)
                      }
                    />
                    <Input
                      placeholder="Album"
                      value={track.album}
                      onChange={(e) =>
                        handleTrackChange(index, 'album', e.target.value)
                      }
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveTrack(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || tracks.length === 0}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
