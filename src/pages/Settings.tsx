import { Card, CardContent } from '@/components/ui/card';
import { ServiceConnection } from '@/components/ServiceConnection';
import { Music, Music2, Radio, LogOut, Trash2, Album, ListMusic } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import { useLastFm } from '@/contexts/LastFmContext';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getStoredLibrary } from '@/lib/services';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: connectedServices } = useConnectedServices();
  const { username: lastFmUsername } = useLastFm();

  // Fetch library statistics
  const { data: spotifyLibrary } = useQuery({
    queryKey: ['storedLibrary', 'spotify'],
    queryFn: () => getStoredLibrary(user!.id, 'spotify'),
    enabled: !!user && connectedServices?.includes('spotify'),
  });

  const { data: appleMusicLibrary } = useQuery({
    queryKey: ['storedLibrary', 'apple-music'],
    queryFn: () => getStoredLibrary(user!.id, 'apple-music'),
    enabled: !!user && connectedServices?.includes('apple-music'),
  });

  const totalAlbums = (spotifyLibrary?.albums?.length || 0) + (appleMusicLibrary?.albums?.length || 0);
  const totalPlaylists = (spotifyLibrary?.playlists?.length || 0) + (appleMusicLibrary?.playlists?.length || 0);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    toast.error('Account deletion is not yet implemented');
  };

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
        {/* Profile Section */}
        <div>
          <h2 className="text-lg font-medium mb-4">Profile</h2>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <Album className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-semibold">{totalAlbums}</p>
                      <p className="text-sm text-muted-foreground">Total Albums</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <ListMusic className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-semibold">{totalPlaylists}</p>
                      <p className="text-sm text-muted-foreground">Total Playlists</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connected Services Section */}
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
