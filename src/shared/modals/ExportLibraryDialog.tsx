import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  convertAlbumsToCSV,
  convertPlaylistsToCSV,
  downloadFile,
} from '@/lib/export';
import { NormalizedAlbum, Playlist } from '@/lib/types';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albums: NormalizedAlbum[];
  playlists: Playlist[];
  service: 'spotify' | 'apple-music';
}

export function ExportLibraryDialog({
  open,
  onOpenChange,
  albums,
  playlists,
  service,
}: ExportLibraryDialogProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [type, setType] = useState<'albums' | 'playlists'>('albums');

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${service}-${type}-${timestamp}.${format}`;

    if (format === 'csv') {
      const content =
        type === 'albums'
          ? convertAlbumsToCSV(albums)
          : convertPlaylistsToCSV(playlists);
      downloadFile(content, filename, 'csv');
    } else {
      const content = JSON.stringify(
        type === 'albums' ? albums : playlists,
        null,
        2
      );
      downloadFile(content, filename, 'json');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Library</DialogTitle>
          <DialogDescription>
            Export your {service} library data as a file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">What to export:</Label>
            <RadioGroup
              defaultValue={type}
              onValueChange={(value) =>
                setType(value as 'albums' | 'playlists')
              }
              className="mt-2 grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="albums"
                  id="albums"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="albums"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Albums ({albums.length})
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="playlists"
                  id="playlists"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="playlists"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Playlists ({playlists.length})
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium">Format:</Label>
            <RadioGroup
              defaultValue={format}
              onValueChange={(value) => setFormat(value as 'csv' | 'json')}
              className="mt-2 grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="csv" id="csv" className="peer sr-only" />
                <Label
                  htmlFor="csv"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  CSV
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="json"
                  id="json"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="json"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
