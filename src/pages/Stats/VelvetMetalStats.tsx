import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useQuery } from '@tanstack/react-query';
import { Music2, ListMusic, Library } from 'lucide-react';
import { StatCard } from './StatCard';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

export const VelvetMetalStats: React.FC = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['velvet-metal-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [spotifyAlbums, spotifyPlaylists, appleMusicAlbums, appleMusicPlaylists] = await Promise.all([
        supabase
          .from('albums')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('service', 'spotify'),
        supabase
          .from('playlists')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('service', 'spotify'),
        supabase
          .from('albums')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('service', 'apple-music'),
        supabase
          .from('playlists')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('service', 'apple-music'),
      ]);

      return {
        spotify: {
          albums: spotifyAlbums.count || 0,
          playlists: spotifyPlaylists.count || 0,
        },
        appleMusic: {
          albums: appleMusicAlbums.count || 0,
          playlists: appleMusicPlaylists.count || 0,
        },
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalAlbums = (stats?.spotify.albums ?? 0) + (stats?.appleMusic.albums ?? 0);
  const totalPlaylists = (stats?.spotify.playlists ?? 0) + (stats?.appleMusic.playlists ?? 0);

  return (
    <div className="space-y-6">      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Albums"
          value={totalAlbums.toLocaleString()}
          icon={Library}
          delay={0.1}
        />
        <StatCard
          title="Total Playlists"
          value={totalPlaylists.toLocaleString()}
          icon={ListMusic}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Spotify Library</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Albums</span>
                  <span className="font-medium">{stats?.spotify.albums.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Playlists</span>
                  <span className="font-medium">{stats?.spotify.playlists.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Apple Music Library</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Albums</span>
                  <span className="font-medium">{stats?.appleMusic.albums.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Playlists</span>
                  <span className="font-medium">{stats?.appleMusic.playlists.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
