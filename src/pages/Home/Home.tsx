import { useAuth } from '@/contexts/auth-context';
import { getUniqueAlbumsCount } from '@/lib/api/albums';
import { getUniquePlaylists } from '@/lib/api/playlists';
import { getUserServices } from '@/lib/services/streaming-auth';
import { MobileHome } from '@/pages/Home/MobileHome';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { ServicesGrid } from '@/shared/services/ServicesGrid';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Music, PlayCircle } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  console.log('Current user:', user);

  const { data: connectedServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: () => getUserServices(user!.id),
    enabled: !!user,
  });

  const { data: uniqueAlbumsCount, error: albumsError } = useQuery({
    queryKey: ['uniqueAlbumsCount', user?.id],
    queryFn: () => getUniqueAlbumsCount(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    placeholderData: (previousData) => previousData,
  });

  const { data: uniquePlaylistsCount } = useQuery({
    queryKey: ['uniquePlaylistsCount', user?.id],
    queryFn: () => getUniquePlaylists(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  console.log('Albums query error:', albumsError);

  return (
    <ResponsiveContainer mobileContent={<MobileHome />}>
      <div className="min-h-screen w-full">
        {/* Header Section */}
        <div className="relative">
          <div className="relative max-w-[1200px] mx-auto px-6">
            {/* Welcome Section */}
            <div className="pt-16 pb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-3 text-white/60 font-sans"
                >
                  Good evening
                </motion.div>
                <h1 className="font-polymath text-5xl md:text-7xl font-bold tracking-normal text-white mb-4">
                  {user?.user_metadata?.display_name
                    ? `Welcome back, ${user.user_metadata.display_name}`
                    : 'Welcome back'}
                </h1>
              </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 transition-all duration-200 hover:border-brand-pink/50"
                >
                  <Clock className="w-8 h-8 mb-4 text-white/60 group-hover:text-brand-pink transition-colors" />
                  <div className="text-3xl font-bold mb-2 font-display text-white">
                    12h
                  </div>
                  <div className="text-white/60 group-hover:text-white/80 transition-colors font-sans">
                    Listening Time
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 transition-all duration-200 hover:border-brand-blue/50"
                >
                  <Music className="w-8 h-8 mb-4 text-white/60 group-hover:text-brand-blue transition-colors" />
                  <div className="text-3xl font-bold mb-2 font-display text-white">
                    {uniqueAlbumsCount ?? '-'}
                  </div>
                  <div className="text-white/60 group-hover:text-white/80 transition-colors font-sans">
                    Unique Albums
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="group p-6 rounded-xl bg-white/5 border border-white/10 transition-all duration-200 hover:border-brand-yellow/50"
                >
                  <PlayCircle className="w-8 h-8 mb-4 text-white/60 group-hover:text-brand-yellow transition-colors" />
                  <div className="text-3xl font-bold mb-2 font-display text-white">
                    {uniquePlaylistsCount ?? '-'}
                  </div>
                  <div className="text-white/60 group-hover:text-white/80 transition-colors font-sans">
                    Unique Playlists
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Connected Services Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pb-16"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold mb-2 font-display text-white">
                    Connected Services
                  </h2>
                  <p className="text-white/60 font-sans">
                    Manage and sync your music services
                  </p>
                </div>
                {connectedServices && connectedServices.length > 0 && (
                  <div className="text-sm px-3 py-1 rounded-full bg-white/5 text-white/80 font-sans border border-white/10">
                    {connectedServices.length} connected
                  </div>
                )}
              </div>
              <ServicesGrid services={connectedServices || []} />
            </motion.div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
