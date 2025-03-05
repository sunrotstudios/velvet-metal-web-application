import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/auth-context";
import { useAlbumDetails } from "@/lib/hooks/useAlbumQueries";
import { AlbumTrack } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { MobileAlbumDetails } from "@/pages/Details/MobileAlbumDetails";
import { ResponsiveContainer } from "@/shared/layouts/ResponsiveContainer";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Play, Plus } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import logger from "../../lib/logger";

export default function AlbumDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const service =
    location.state?.service ||
    (id?.startsWith("l.") ? "apple-music" : "spotify");
  const previousParams = location.state?.previousParams;

  useEffect(() => {
    if (!user) {
      logger.info("No user found, redirecting to login");
      navigate("/login", { state: { from: `/album/${id}` } });
    }
  }, [user, id, navigate]);

  useEffect(() => {
    // Store the current library params in session storage when mounting
    const currentParams = location.state?.previousParams;
    if (currentParams) {
      sessionStorage.setItem("libraryParams", JSON.stringify(currentParams));
    }
  }, [location.state]);

  const {
    data: album,
    isLoading,
    error,
  } = useAlbumDetails(id, user?.id, service);

  logger.info("Query state:", { album, isLoading, error });

  if (error) {
    console.error("Error fetching album:", error);
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-500">
            Error loading album
          </h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner centered label="Loading album details" />
      </div>
    );
  }

  if (!album) {
    return null;
  }

  const handleBack = () => {
    navigate("/library");
  };

  const handlePlayAlbum = () => {
    // implement play album logic
  };

  const setIsTransferModalOpen = () => {
    // implement set is transfer modal open logic
  };

  const defaultAlbumArt = ""; // implement default album art logic

  const totalDuration = album.tracks.reduce(
    (acc, track) => acc + track.durationMs,
    0
  );

  return (
    <ResponsiveContainer mobileContent={<MobileAlbumDetails album={album} />}>
      <div className="flex h-screen w-full">
        {/* Desktop Layout */}
        <div className="flex flex-col h-full w-full">
          {/* Album Header Section */}
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

            {/* Album Info */}
            <div className="flex items-start gap-8">
              {album.artwork?.url && (
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
                  layoutId={`album-artwork-${album.id}`}
                >
                  <motion.img
                    src={album.artwork.url || defaultAlbumArt}
                    alt={album.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    layoutId={`album-image-${album.id}`}
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
                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    {album.name}
                  </h1>
                  <p className="text-xl text-white/60 hover:text-white transition-colors duration-200 cursor-pointer">
                    {album.artistName}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>{new Date(album.releaseDate).getFullYear()}</span>
                  <span>•</span>
                  <span>{album.totalTracks} songs</span>
                  {album.label && (
                    <>
                      <span>•</span>
                      <span>{album.label}</span>
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
                    onClick={handlePlayAlbum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="h-5 w-5" />
                    Play
                  </motion.button>
                  <motion.button
                    className="h-11 px-8 rounded-md inline-flex items-center justify-center gap-2 border border-white bg-transparent text-white font-medium transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95"
                    onClick={() => setIsTransferModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-5 w-5" />
                    Transfer
                  </motion.button>
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
                {album.tracks.map((track: AlbumTrack, index) => (
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
                      {track.trackNumber}
                    </span>
                    <div>
                      <p className="font-medium text-white transition-colors duration-200">
                        {track.name}
                      </p>
                      <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-200">
                        {track.artistName}
                      </p>
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-200">
                      {formatDuration(track.durationMs)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
