import { TransferPlaylistModal } from '@/components/TransferPlaylistModal';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { usePlaylistDetails } from '@/lib/hooks/usePlaylistQueries';
import { formatDuration } from '@/lib/utils';
import { ArrowLeft, Clock, Play, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function PlaylistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const location = useLocation();
  const service = location.state?.service as
    | 'spotify'
    | 'apple-music'
    | undefined;

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login', { state: { from: `/playlist/${id}` } });
    }
  }, [user, id, navigate]);

  console.log('Playlist ID:', id);
  console.log('User ID:', user?.id);
  console.log('Service:', service);

  const {
    data: playlist,
    isLoading,
    error,
  } = usePlaylistDetails(id, user?.id, service);

  const handleTransfer = () => {
    if (playlist) {
      setIsTransferModalOpen(true);
    }
  };

  console.log('Query state:', { playlist, isLoading, error });

  if (error) {
    console.error('Error fetching playlist:', error);
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-500">
            Error loading playlist
          </h2>
          <p className="mt-2 text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !playlist) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" centered label="Loading playlist" />
      </div>
    );
  }

  if (!playlist.tracks) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-500">
            No tracks found
          </h2>
          <p className="mt-2 text-muted-foreground">
            This playlist appears to be empty
          </p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-none space-y-8 p-8">
        <Button
          variant="ghost"
          className="w-fit gap-2"
          onClick={() => navigate('/library')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>

        {/* Playlist Header */}
        <div className="flex items-start gap-8">
          <div className="relative aspect-square w-48 overflow-hidden rounded-lg">
            <img
              src={playlist.artwork.url}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-end space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium uppercase tracking-wider">
                  {playlist.service === 'spotify'
                    ? 'Spotify'
                    : playlist.service === 'apple-music'
                    ? 'Apple Music'
                    : playlist.service}
                </span>
                <span>•</span>
                <span>Playlist</span>
              </div>
              <h1 className="text-4xl font-bold mt-1">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-xl text-muted-foreground">
                  {playlist.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {playlist.owner?.display_name && (
                <>
                  <span>By {playlist.owner.display_name}</span>
                  <span>•</span>
                </>
              )}
              <span>{playlist.total_tracks} songs</span>
            </div>
            <div className="flex items-center gap-3">
              <Button size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Play
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTransfer();
                }}
              >
                <Plus className="h-5 w-5" />
                Transfer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8">
        <div className="space-y-4">
          <div className="sticky top-0 z-10 bg-background grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 px-4 py-2 text-sm text-muted-foreground">
            <span className="w-8">#</span>
            <span>Title</span>
            <span>Album</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            {playlist.tracks?.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 rounded-md px-4 py-2 hover:bg-accent cursor-pointer"
              >
                <span className="w-8 text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.artist.name}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground truncate">
                  {item.album?.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDuration(item.duration_ms)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {playlist && (
        <TransferPlaylistModal
          open={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
          sourceService={playlist.service}
          playlist={playlist}
          userId={user!.id}
          onTransferComplete={() => {
            setIsTransferModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
