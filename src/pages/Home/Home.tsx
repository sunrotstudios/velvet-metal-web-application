import { useAuth } from '@/contexts/auth-context';
import { getUniqueAlbumsCount } from '@/lib/api/albums';
import { getUniquePlaylists } from '@/lib/api/playlists';
import { getUserServices } from '@/lib/services/streaming-auth';
import { MobileHome } from '@/pages/Home/MobileHome';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Music, PlayCircle, LineChart, Heart, PlusCircle, Check, Music2, AppleIcon, Waves } from 'lucide-react';
import { WeirdDesigns } from '@/styles/abstract-designs';
import { cn } from '@/lib/utils';
import { ServiceType } from '@/lib/services/streaming-auth';

export default function Home() {
  const { user } = useAuth();

  const { data: connectedServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: () => getUserServices(user!.id),
    enabled: !!user,
  });

  const { data: uniqueAlbumsCount } = useQuery({
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

  // Sample recent albums data (replace with actual data from API)
  const recentAlbums = [
    { id: 1, title: "Midnight Horizon", artist: "Aurora Skies", cover: "/images/visions-of-you.jpeg" },
    { id: 2, title: "Velvet Dreams", artist: "The Crystal Method", cover: "/images/visions-of-you.jpeg" },
    { id: 3, title: "Urban Legends", artist: "DJ Shadow", cover: "/images/visions-of-you.jpeg" },
  ];

  // Service definitions (normally these would be imported from a shared file)
  const servicesList = [
    {
      id: 'spotify' as ServiceType,
      name: 'Spotify',
      icon: Music2,
      color: 'bg-[#1DB954]',
      textColor: 'text-[#1DB954]',
      bgColor: 'bg-green-100',
    },
    {
      id: 'apple-music' as ServiceType,
      name: 'Apple Music',
      icon: AppleIcon,
      color: 'bg-[#FC3C44]',
      textColor: 'text-[#FC3C44]',
      bgColor: 'bg-red-100',
    },
    {
      id: 'tidal' as ServiceType,
      name: 'Tidal',
      icon: Waves,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <ResponsiveContainer mobileContent={<MobileHome />}>
      <div className="min-h-screen w-full bg-[#F5F0E8]">
        {/* Main Content */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Header Card */}
          <motion.div
            className="bg-white rounded-[24px] border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 w-full mb-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundImage: `
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-6">
              {/* Title now on the left */}
              <h1
                className="text-4xl sm:text-5xl font-black w-2/3 md:w-1/2"
                style={{
                  fontFamily: "Mondwest",
                  textShadow: "3px 3px 0px rgba(168, 85, 247, 0.3)",
                }}
              >
                {user?.user_metadata?.display_name
                  ? `Hey, ${user.user_metadata.display_name}`
                  : 'Welcome back'}
              </h1>

              {/* Designs now on the right */}
              <div className="w-1/3 md:w-1/2 flex justify-end">
                <div className="w-full">
                  <div className="hidden md:block">
                    <WeirdDesigns />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section within the same card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-purple-100 border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
                }}
              >
                <Clock className="w-6 h-6 mb-3 text-black" />
                <div className="text-2xl font-bold mb-1 font-black">
                  12h
                </div>
                <div className="text-black/80 text-sm font-medium">
                  Listening Time
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-yellow-100 border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(245, 158, 11, 0.1) 5px, rgba(245, 158, 11, 0.1) 10px)'
                }}
              >
                <Music className="w-6 h-6 mb-3 text-black" />
                <div className="text-2xl font-bold mb-1 font-black">
                  {uniqueAlbumsCount ?? '-'}
                </div>
                <div className="text-black/80 text-sm font-medium">
                  Unique Albums
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-sky-100 border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(14, 165, 233, 0.1) 5px, rgba(14, 165, 233, 0.1) 10px)'
                }}
              >
                <PlayCircle className="w-6 h-6 mb-3 text-black" />
                <div className="text-2xl font-bold mb-1 font-black">
                  {uniquePlaylistsCount ?? '-'}
                </div>
                <div className="text-black/80 text-sm font-medium">
                  Unique Playlists
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Content Grid - Three main cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Recent Albums */}
            <div className="md:col-span-1">
              <div className="overflow-hidden rounded-xl border-3 border-black relative bg-white h-full min-h-[300px]">
                <div className="absolute top-2 left-2 bg-yellow-300 rounded-full py-1 px-3 border-2 border-black font-medium text-xs z-10">
                  RECENT ALBUMS
                </div>
                <div className="px-4 pt-12 pb-4">
                  <div className="grid grid-cols-1 gap-4">
                    {recentAlbums.map((album) => (
                      <div key={album.id} className="flex items-center p-3 rounded-lg hover:bg-black/5 transition-colors">
                        <div className="h-16 w-16 rounded-lg border-2 border-black overflow-hidden mr-3">
                          <img 
                            src={album.cover} 
                            alt={album.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate">{album.title}</h3>
                          <p className="text-sm text-black/70 truncate">{album.artist}</p>
                        </div>
                        <div className="bg-black rounded-full w-8 h-8 border-2 border-black flex items-center justify-center cursor-pointer transform rotate-45 hover:bg-black/80 transition-colors">
                          <div className="transform -rotate-45 text-white text-base">→</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Services - Redesigned */}
            <div className="md:col-span-1">
              <div className="rounded-xl border-3 border-black p-4 bg-white h-full min-h-[300px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    CONNECTED SERVICES
                  </h2>
                  <p className="text-xs text-black/70">
                    Your active connections
                  </p>
                </div>
                <div className="flex-1 space-y-3">
                  {servicesList.map((service) => {
                    const isConnected = connectedServices?.includes(service.id);
                    return (
                      <div 
                        key={service.id}
                        className={cn(
                          "flex items-center p-3 border-2 border-black rounded-lg transition-all",
                          isConnected ? service.bgColor : "bg-gray-100",
                          "hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full border-2 border-black flex items-center justify-center mr-3",
                          isConnected ? service.color : "bg-white"
                        )}>
                          <service.icon className={cn(
                            "w-5 h-5",
                            isConnected ? "text-white" : service.textColor
                          )} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{service.name}</h3>
                          <p className="text-xs text-black/70">
                            {isConnected ? "Connected" : "Click to connect"}
                          </p>
                        </div>
                        {isConnected && (
                          <div className="bg-green-500 rounded-full w-6 h-6 border border-black flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="md:col-span-1">
              <div className="border-3 border-black rounded-xl p-4 bg-purple-100 h-full min-h-[300px]" style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(168, 85, 247, 0.1) 5px, rgba(168, 85, 247, 0.1) 10px)'
              }}>
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-bold">
                    QUICK ACTIONS
                  </h2>
                </div>
                <div className="border-t-2 border-black pt-3 space-y-3">
                  {[
                    { icon: <PlayCircle className="w-5 h-5" />, text: "Play random album", bg: "bg-yellow-300" },
                    { icon: <Heart className="w-5 h-5" />, text: "View favorites", bg: "bg-pink-300" },
                    { icon: <LineChart className="w-5 h-5" />, text: "See listening stats", bg: "bg-blue-300" },
                    { icon: <PlusCircle className="w-5 h-5" />, text: "Create new playlist", bg: "bg-green-300" },
                  ].map((action, index) => (
                    <button 
                      key={index} 
                      className={`w-full ${action.bg} border-2 border-black rounded-lg py-3 px-4 font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center`}
                    >
                      <span className="mr-2">{action.icon}</span>
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action - Made taller */}
          <div className="bg-purple-600 py-8 px-6 rounded-xl text-center relative overflow-hidden border-3 border-black">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255, 255, 255, 0.5) 8px, rgba(255, 255, 255, 0.5) 10px),
                repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255, 255, 255, 0.3) 12px, rgba(255, 255, 255, 0.3) 14px)
              `,
              mixBlendMode: 'overlay'
            }}></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                Connect All Your Music Services for a Complete Experience
              </h2>
              <button
                className="bg-black text-white px-6 py-3 rounded-md font-bold text-base border-2 border-white hover:opacity-90 transition-opacity"
              >
                ADD MORE SERVICES
              </button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}