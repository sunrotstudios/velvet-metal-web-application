import { Card, CardContent } from '@/components/ui/card';
import { ServiceConnection } from '@/components/ServiceConnection';
import { Music, Music2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';

export function Settings() {
  const { user } = useAuth();
  const { data: connectedServices } = useConnectedServices();

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Connected Services</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music2 className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Spotify</p>
                      <p className="text-sm text-muted-foreground">
                        {connectedServices?.includes('spotify')
                          ? 'Connected'
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <ServiceConnection service="spotify" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Apple Music</p>
                      <p className="text-sm text-muted-foreground">
                        {connectedServices?.includes('apple-music')
                          ? 'Connected'
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <ServiceConnection service="apple-music" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
