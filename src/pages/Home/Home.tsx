import { useAuth } from '@/contexts/auth-context';
import { getUserServices } from '@/lib/services/streaming-auth';
import { MobileHome } from '@/pages/Home/MobileHome';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { ServicesGrid } from '@/shared/services/ServicesGrid';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const { data: connectedServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: () => getUserServices(user!.id),
    enabled: !!user,
  });

  return (
    <ResponsiveContainer mobileContent={<MobileHome />}>
      {/* Desktop Layout */}
      <div className="min-h-screen bg-background">
        <div className="container max-w-[1200px] py-12 px-4">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-medium text-primary mb-2">
              {user?.user_metadata?.display_name
                ? `Hi ${user.user_metadata.display_name}`
                : 'Welcome'}
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your music, all in one place
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-medium mb-6">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-xl bg-card shadow-sm border border-border/50">
                <div className="text-4xl font-semibold text-primary mb-2">
                  12h
                </div>
                <div className="text-sm text-muted-foreground">
                  Listened this week
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card shadow-sm border border-border/50">
                <div className="text-4xl font-semibold text-primary mb-2">
                  Rock
                </div>
                <div className="text-sm text-muted-foreground">Top Genre</div>
              </div>
              <div className="p-6 rounded-xl bg-card shadow-sm border border-border/50">
                <div className="text-4xl font-semibold text-primary mb-2">
                  142
                </div>
                <div className="text-sm text-muted-foreground">
                  Unique Tracks
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card shadow-sm border border-border/50">
                <div className="text-4xl font-semibold text-primary mb-2">
                  5
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </motion.div>

          {/* Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium">Connected Services</h2>
              {connectedServices && (
                <span className="text-base text-muted-foreground">
                  {connectedServices.length} connected
                </span>
              )}
            </div>
            <div>
              <ServicesGrid />
            </div>
          </motion.div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
