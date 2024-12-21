import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useLastFm } from '@/contexts/last-fm-context';
import { useConnectedServices } from '@/lib/hooks/useConnectedServices';
import { ServiceConnection } from '@/shared/services/ServiceConnection';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Cloud,
  ExternalLink,
  HelpCircle,
  LogOut,
  Music,
  Music2,
  Radio,
  Trash2,
  User,
} from 'lucide-react';

export function MobileSettings() {
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
          title:
            user.user_metadata?.display_name || user.email || 'Your Account',
          subtitle: user.email,
          action: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
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
    <div className="h-full overflow-y-auto bg-background">
      <div className="divide-y">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="px-4 py-4"
          >
            <div className="flex items-center gap-2 mb-4">
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
                    className="flex items-center justify-between p-4"
                  >
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
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
