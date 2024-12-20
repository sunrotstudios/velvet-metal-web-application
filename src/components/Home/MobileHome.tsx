import { ServicesGrid } from '@/components/ServicesGrid';
import { useAuth } from '@/contexts/auth-context';
import { getUserServices } from '@/lib/services/streaming-auth';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export function MobileHome() {
  const { user } = useAuth();
  const { data: connectedServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: () => getUserServices(user!.id),
    enabled: !!user,
  });

  return (
    <div className="h-full w-full overflow-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 bg-background p-6 text-center z-10"
      >
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome
          {user?.user_metadata?.display_name
            ? `, ${user.user_metadata.display_name}`
            : ''}
          ! 👋
        </h1>
      </motion.div>

      {/* Content */}
      <div className="px-4 pb-24">
        {/* Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="rounded-xl bg-card p-6 shadow-lg">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold">
                Connect Your Music Services
              </h2>
            </div>

            <ServicesGrid />

            {connectedServices && connectedServices.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Connected Services: {connectedServices.length}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats or Recent Activity */}
        <div className="mt-8 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-4 rounded-lg bg-card shadow"
          >
            <h3 className="font-semibold mb-2">Quick Start</h3>
            <p className="text-sm text-muted-foreground">
              Connect your first music service to start managing your library
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="p-4 rounded-lg bg-card shadow"
          >
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              Check out our guide on how to get started with Velvet Metal
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
