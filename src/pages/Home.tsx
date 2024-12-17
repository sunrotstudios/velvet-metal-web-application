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
    <div className="flex h-screen flex-col items-center justify-center px-4 py-12">
      {/* Hero Section */}
      <div className=" max-w-3xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-primary">
          Welcome
          {user?.user_metadata?.display_name
            ? `, ${user.user_metadata.display_name}`
            : ''}
          ! 👋
        </h1>
      </div>

      {/* Services Section */}
      <div className="w-full max-w-4xl rounded-xl bg-card p-8 shadow-lg">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Connect Your Music Services
          </h2>
        </div>

        <div className="px-4">
          <ServicesGrid />
        </div>

        {connectedServices && connectedServices.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Connected Services: {connectedServices.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
