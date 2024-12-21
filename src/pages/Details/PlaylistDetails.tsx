import { MobilePlaylistDetails } from '@/components/Details/MobilePlaylistDetails';
import { TransferPlaylistModal } from '@/components/TransferPlaylistModal';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { usePlaylistDetails } from '@/lib/hooks/usePlaylistQueries';
import { formatDuration } from '@/lib/utils';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner centered label="Loading playlist details" />
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <>
      <TransferPlaylistModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        playlist={playlist}
      />
      <ResponsiveContainer
        mobileContent={
          <MobilePlaylistDetails
            playlist={playlist}
            onTransfer={handleTransfer}
          />
        }
      >
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
                {playlist.artwork?.url ? (
                  <img
                    src={playlist.artwork.url}
                    alt={playlist.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
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

          {/* Track List */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr>
                  <th className="w-12 px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Artist</th>
                  <th className="px-4 py-2 text-left">Album</th>
                  <th className="w-24 px-4 py-2 text-left">
                    <Clock className="h-4 w-4" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {(playlist.tracks || []).map((track, index) => (
                  <tr
                    key={track.id || index}
                    className="group hover:bg-muted/50"
                  >
                    <td className="px-4 py-2 text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2">{track.name}</td>
                    <td className="px-4 py-2">
                      {playlist.service === 'spotify'
                        ? track.artists.map((a) => a.name).join(', ')
                        : track.artist.name}
                    </td>
                    <td className="px-4 py-2">{track.album?.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {formatDuration(track.duration_ms)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ResponsiveContainer>
    </>
  );
}
