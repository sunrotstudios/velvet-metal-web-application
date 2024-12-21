import { ServiceConnection } from '@/components/ServiceConnection';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useLastFm } from '@/contexts/last-fm-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import { Music, Music2, Radio } from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const { data: connectedServices } = useConnectedServices();
  const { username: lastFmUsername } = useLastFm();

  if (!user) {
    return null;
  }

  const services = [
    {
      name: 'Spotify',
      icon: Music2,
      type: 'spotify' as const,
      isConnected: connectedServices?.includes('spotify'),
    },
    {
      name: 'Apple Music',
      icon: Music,
      type: 'apple-music' as const,
      isConnected: connectedServices?.includes('apple-music'),
    },
    {
      name: 'Last.fm',
      icon: Radio,
      type: 'lastfm' as const,
      isConnected: !!lastFmUsername,
      username: lastFmUsername,
    },
  ];

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Connected Services</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              {services.map((service) => (
                <div
                  key={service.type}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <service.icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.isConnected
                          ? service.username
                            ? `Connected as ${service.username}`
                            : 'Connected'
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <ServiceConnection service={service.type} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Settings;
