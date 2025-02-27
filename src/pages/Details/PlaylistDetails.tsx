import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { usePlaylistDetails } from '@/lib/hooks/usePlaylistQueries';
import { usePlaylistSync } from '@/lib/hooks/usePlaylistSync';
import { formatDuration } from '@/lib/utils';
import { MobilePlaylistDetails } from '@/pages/Details/MobilePlaylistDetails';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { LinkPlaylistModal } from '@/shared/modals/LinkPlaylistModal';
import { TransferPlaylistModal } from '@/shared/modals/PlaylistTransferModal';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Link as LinkIcon, Play, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export default function PlaylistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const location = useLocation();
  const service = location.state?.service as
    | 'spotify'
    | 'apple-music'
    | undefined;
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

  const { syncPairs } = usePlaylistSync(user?.id);

  // Find if this playlist is part of any sync pairs
  const syncPair =
    playlist &&
    syncPairs?.find(
      (pair) =>
        (pair.source_playlist_id === playlist.playlist_id &&
          pair.source_service === playlist.service) ||
        (pair.target_playlist_id === playlist.playlist_id &&
          pair.target_service === playlist.service)
    );

  const handleTransfer = () => {
    if (playlist) {
      setIsTransferModalOpen(true);
    }
  };

  const handleLink = () => {
    if (playlist) {
      setIsLinkModalOpen(true);
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

  const totalDuration = playlist.tracks.reduce(
    (acc, track) => acc + track.duration_ms,
    0
  );

  return (
    <ResponsiveContainer mobileContent={<MobilePlaylistDetails playlist={playlist} onTransfer={handleTransfer} />}>
      <div className="flex h-screen w-full">
        {/* Desktop Layout */}
        <div className="flex flex-col h-full w-full">
          {/* Playlist Header Section */}
          <motion.div
            className="flex flex-col space-y-8 p-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            layout
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              layout
            >
              <Button
                variant="ghost"
                className="w-fit gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-300"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
            </motion.div>

            {/* Playlist Info */}
            <div className="flex items-start gap-8">
              {playlist.artwork?.url && (
                <motion.div
                  className="relative aspect-square w-48 overflow-hidden rounded-lg shadow-lg group cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    layout: { duration: 0.3 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                  }}
                  layout
                  layoutId={`playlist-artwork-${playlist.id}`}
                >
                  <motion.img
                    src={playlist.artwork.url}
                    alt={playlist.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    layoutId={`playlist-image-${playlist.id}`}
                  />
                </motion.div>
              )}

              <motion.div
                className="flex flex-col justify-end space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-white/60">
                    Playlist
                  </h4>
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    {playlist.name}
                  </h1>
                  {playlist.owner?.display_name && (
                    <p className="text-xl text-white/60 hover:text-white transition-colors duration-200 cursor-pointer">
                      {playlist.owner.display_name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>{playlist.total_tracks} tracks</span>
                  <span>•</span>
                  <span className="capitalize">{playlist.service}</span>
                  {playlist.description && (
                    <>
                      <span>•</span>
                      <span className="max-w-2xl text-sm text-white/60">
                        {playlist.description}
                      </span>
                    </>
                  )}
                </div>

                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <motion.button
                    className="h-11 px-8 rounded-md inline-flex items-center justify-center gap-2 bg-white text-black font-medium transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95"
                    onClick={handlePlayPlaylist}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="h-5 w-5" />
                    Play
                  </motion.button>
                  <motion.button
                    className="h-11 px-8 rounded-md inline-flex items-center justify-center gap-2 border! border-white! bg-transparent! text-white! font-medium"
                    onClick={handleTransfer}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-5 w-5" />
                    Transfer
                  </motion.button>
                  {!syncPair && (
                    <motion.button
                      className="h-11 px-8 rounded-md inline-flex items-center justify-center gap-2 border! border-white! bg-transparent! text-white! font-medium"
                      onClick={handleLink}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LinkIcon className="h-5 w-5" />
                      Link
                    </motion.button>
                  )}
                  {syncPair && (
                    <motion.button
                      className="h-11 px-8 rounded-md inline-flex items-center justify-center gap-2 border! border-yellow-500! bg-yellow-500/10! text-yellow-500! font-medium"
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(234, 179, 8, 0.2)',
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LinkIcon className="h-5 w-5" />
                      Linked
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Tracks List */}
          <div className="flex-1 overflow-y-auto">
            <motion.div
              className="space-y-2 px-8 pb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {/* Track List Header */}
              <div className="sticky top-0 z-10 border-b border-white/10 bg-transparent backdrop-blur-xs">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 px-4 text-sm font-medium text-white/60">
                  <span className="w-8">#</span>
                  <span>Title</span>
                  <Clock className="h-4 w-4" />
                </div>
              </div>

              {/* Track List */}
              <div className="space-y-1 pt-2">
                {playlist.tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-white/5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.7 + index * 0.05, duration: 0.3 },
                    }}
                  >
                    <span className="w-8 text-sm text-white/40 group-hover:text-white/60 transition-colors duration-200">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white transition-colors duration-200">
                        {track.name}
                      </p>
                      <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-200">
                        {Array.isArray(track.artists)
                          ? track.artists
                              .map((artist) => artist.name)
                              .join(', ')
                          : track.artist}
                      </p>
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-200">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <TransferPlaylistModal
          open={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
          sourceService={service!}
          playlist={playlist}
          userId={user?.id!}
        />
        <LinkPlaylistModal
          open={isLinkModalOpen}
          onOpenChange={setIsLinkModalOpen}
          sourcePlaylist={playlist!}
          userId={user?.id!}
        />
      </div>
    </ResponsiveContainer>
  );
}
