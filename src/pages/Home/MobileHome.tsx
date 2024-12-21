import { useAuth } from '@/contexts/auth-context';
import { getUserServices } from '@/lib/services/streaming-auth';
import { ServicesGrid } from '@/shared/services/ServicesGrid';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Music2, PlusCircle } from 'lucide-react';

export function MobileHome() {
  const { user } = useAuth();
  const { data: connectedServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: () => getUserServices(user!.id),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-medium text-primary mb-2">
            {user?.user_metadata?.display_name
              ? `Hi ${user.user_metadata.display_name}`
              : 'Welcome'}
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your music, all in one place
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-medium mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start p-4">
              <div className="text-3xl font-semibold text-primary mb-1">12h</div>
              <div className="text-sm text-muted-foreground">Listened this week</div>
            </div>
            <div className="flex flex-col items-start p-4">
              <div className="text-3xl font-semibold text-primary mb-1">Rock</div>
              <div className="text-sm text-muted-foreground">Top Genre</div>
            </div>
            <div className="flex flex-col items-start p-4">
              <div className="text-3xl font-semibold text-primary mb-1">142</div>
              <div className="text-sm text-muted-foreground">Unique Tracks</div>
            </div>
            <div className="flex flex-col items-start p-4">
              <div className="text-3xl font-semibold text-primary mb-1">5</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Connected Services</h2>
            {connectedServices && (
              <span className="text-sm text-muted-foreground">
                {connectedServices.length} connected
              </span>
            )}
          </div>
          <div className="rounded-xl bg-card shadow-sm border border-border/50">
            <ServicesGrid />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
