import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { usePlaylistDetails } from '@/lib/hooks/usePlaylistQueries';
import { formatDuration } from '@/lib/utils';
import { MobilePlaylistDetails } from '@/pages/Details/MobilePlaylistDetails';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { TransferPlaylistModal } from '@/shared/modals/PlaylistTransferModal';
import { ArrowLeft, Clock, Play, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export default function PlaylistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const location = useLocation();
  const service = location.state?.service as 'spotify' | 'apple-music' | undefined;
  const previousParams = location.state?.previousParams;

  useEffect(() => {
    // Store the current library params in session storage when mounting
    const currentParams = location.state?.previousParams;
    if (currentParams) {
      sessionStorage.setItem('libraryParams', JSON.stringify(currentParams));
    }
  }, [location.state]);

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

  const handleBack = () => {
    navigate('/library');
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

  const handlePlayPlaylist = () => {
    console.log('Play playlist');
  };

  const totalDuration = playlist.tracks.reduce((acc, track) => acc + track.duration_ms, 0);

  return (
    <div className="relative min-h-screen w-full bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-[#4996df]/20 to-black/95" />
      
      <div className="relative px-6 py-8 md:px-8 lg:px-12">
        {/* Header Section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:gap-12">
          <div className="relative aspect-square w-48 md:w-64 lg:w-72">
            <img
              src={playlist.artwork?.url || ''}
              alt={playlist.name}
              className="h-full w-full rounded-xl object-cover shadow-2xl"
            />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div>
              <h4 className="font-polymath text-sm uppercase tracking-wider text-white/60">Playlist</h4>
              <h1 className="font-polymath text-4xl font-medium text-white md:text-5xl lg:text-6xl">
                {playlist.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="font-medium text-white">{playlist.owner?.display_name}</span>
              <span>•</span>
              <span>{playlist.total_tracks} tracks</span>
              <span>•</span>
              <span className="capitalize">{playlist.service}</span>
            </div>

            {playlist.description && (
              <p className="max-w-2xl text-sm text-white/60">{playlist.description}</p>
            )}

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={handlePlayPlaylist}
              >
                <Play className="mr-2 h-5 w-5" />
                Play
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setIsTransferModalOpen(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Add to Library
              </Button>
            </div>
          </div>
        </div>

        {/* Tracks Section */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-polymath text-2xl font-medium text-white">Tracks</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {playlist.tracks.map((track, index) => (
              <div
                key={track.id}
                className="group flex items-center gap-4 rounded-lg px-4 py-2 transition-colors hover:bg-white/5"
              >
                <div className="w-8 text-center text-sm text-white/40 group-hover:text-white/60">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="line-clamp-1 text-sm font-medium text-white">
                      {track.name}
                    </span>
                  </div>
                  {track.artists && (
                    <div className="line-clamp-1 text-sm text-white/60">
                      {track.artists.map((a) => a.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="w-20 text-right text-sm text-white/60">
                  {formatDuration(track.duration_ms)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferPlaylistModal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        sourceService={service || 'spotify'}
        playlist={playlist}
        userId={user?.id || ''}
        onTransferComplete={() => {
          // Don't close the modal, just update the library data
          queryClient.invalidateQueries(['storedLibrary']);
        }}
      />
    </div>
  );
}
