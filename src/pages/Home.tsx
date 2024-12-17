import { ServicesGrid } from '@/components/ServicesGrid';
import { useAuth } from '@/contexts/auth-context';
import { getUserServices } from '@/lib/services/streaming-auth';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const { user } = useAuth();
  const { data: connectedServices } = useQuery({
    queryKey: ['userServices', user?.id],
    queryFn: () => getUserServices(user!.id),
    enabled: !!user,
  });

  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Connect Your Music Services</h2>
        <p className="text-muted-foreground">
          Connect your favorite music services to sync and manage your music
          library in one place.
        </p>
        <ServicesGrid />
      </div>
    </div>
  );
}
