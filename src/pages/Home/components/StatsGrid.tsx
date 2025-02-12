import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { getUniqueAlbumsCount } from '@/lib/api/albums';
import { getUniquePlaylists } from '@/lib/api/playlists';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Music, PlayCircle } from 'lucide-react';

export function StatsGrid() {
  const { user } = useAuth();

  const { data: uniqueAlbumsCount } = useQuery({
    queryKey: ['uniqueAlbumsCount', user?.id],
    queryFn: () => getUniqueAlbumsCount(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: uniquePlaylistsCount } = useQuery({
    queryKey: ['uniquePlaylistsCount', user?.id],
    queryFn: () => getUniquePlaylists(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const stats = [
    {
      id: 'listening-time',
      name: 'Listening Time',
      value: '12h',
      icon: Clock,
    },
    {
      id: 'unique-albums',
      name: 'Unique Albums',
      value: uniqueAlbumsCount,
      icon: Music,
    },
    {
      id: 'unique-playlists',
      name: 'Unique Playlists',
      value: uniquePlaylistsCount?.length,
      icon: PlayCircle,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {stats.map((stat) => (
        <Card
          key={stat.id}
          className="group transition-all duration-200 hover:border-main/50"
        >
          <CardContent className="p-6">
            <stat.icon className="w-8 h-8 mb-4 text-text/60 group-hover:text-main transition-colors" />
            <div className="text-3xl font-bold mb-2 text-text">
              {stat.value ?? '-'}
            </div>
            <div className="text-text/60 group-hover:text-text/80 transition-colors">
              {stat.name}
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
