import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useLastFm } from '@/contexts/last-fm-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import { ResponsiveContainer } from '@/shared/layouts/ResponsiveContainer';
import { ServiceConnection } from '@/shared/services/ServiceConnection';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  Cloud,
  ExternalLink,
  HelpCircle,
  LogOut,
  Moon,
  Music,
  Music2,
  Radio,
  Trash2,
  User,
} from 'lucide-react';
import { MobileSettings } from './MobileSettings';
import { format } from 'date-fns';

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: connectedServices } = useConnectedServices();
  const { username: lastFmUsername } = useLastFm();

  if (!user) return null;

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

  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        {
          id: 'profile',
          icon: User,
          content: (
            <div className="w-full p-6">
              <div className="flex items-start gap-6">
                <div className="rounded-full bg-primary/10 p-4 hidden md:flex">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user.user_metadata?.display_name || 'User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Member since:</p>
                      <p className="text-sm">
                        {format(new Date(user.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Status:</p>
                      <p className="text-sm">Free Plan</p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Music Services',
      icon: Cloud,
      items: services.map((service) => ({
        id: service.type,
        icon: service.icon,
        title: service.name,
        subtitle: service.isConnected
          ? service.username
            ? `Connected as ${service.username}`
            : 'Connected'
          : 'Not connected',
        action: <ServiceConnection service={service.type} />,
      })),
    },
    {
      title: 'Preferences',
      icon: Moon,
      items: [
        {
          id: 'notifications',
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Manage your notification preferences',
          action: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
      ],
    },
    {
      title: 'Support',
      icon: HelpCircle,
      items: [
        {
          id: 'help',
          icon: ExternalLink,
          title: 'Help Center',
          subtitle: 'Get help with Velvet Metal',
          action: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
      ],
    },
    {
      title: 'Account Actions',
      icon: User,
      items: [
        {
          id: 'signout',
          icon: LogOut,
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          action: (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ),
        },
        {
          id: 'delete',
          icon: Trash2,
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          action: (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to delete your account? This action cannot be undone.'
                  )
                ) {
                  // TODO: Implement account deletion
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <ResponsiveContainer mobileContent={<MobileSettings />}>
      <div className="min-h-screen bg-background">
        <div className="container max-w-[1200px] py-12 px-4">
          <h1 className="text-2xl font-medium mb-12">Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {settingsSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  <h2 className="font-medium">{section.title}</h2>
                </div>

                <Card>
                  <div className="divide-y">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: sectionIndex * 0.1 + itemIndex * 0.05,
                        }}
                        className={`hover:bg-muted/50 transition-colors ${
                          item.content ? '' : 'flex items-center justify-between p-4'
                        }`}
                      >
                        {item.content ? (
                          item.content
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-primary/10 p-2">
                                <item.icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                            {item.action}
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
