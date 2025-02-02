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
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { UpgradePlanModal } from '@/components/modals/UpgradePlanModal';

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: connectedServices } = useConnectedServices();
  const { username: lastFmUsername } = useLastFm();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUpgradePlanOpen, setIsUpgradePlanOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Fetch profile data
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          }
        });
    }
  }, [user]);

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
            <div className="w-full">
              <div className="flex items-start gap-6">
                <div className="rounded-full bg-white/10 hidden md:block w-20 h-20 overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-12 w-12 text-white/80" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-white">
                      {user.user_metadata?.display_name || 'User'}
                    </h3>
                    <p className="text-sm text-white/60">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white/60">Member since:</p>
                      <p className="text-sm text-white">
                        {format(new Date(user.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white/60">Status:</p>
                      <p className="text-sm text-white capitalize">
                        {profile?.subscription_tier || 'Free'} Plan
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 text-white hover:bg-white/20 border-0"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 text-white hover:bg-white/20 border-0"
                      onClick={() => setIsUpgradePlanOpen(true)}
                    >
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
              className="text-white/80 hover:text-white hover:bg-white/10"
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
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
      <div className="min-h-screen bg-black text-white">
        {/* Header Section */}
        <div className="relative">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-[30vh] pointer-events-none" />
          
          <div className="relative max-w-[1200px] mx-auto px-6">
            {/* Title Section */}
            <div className="pt-16 pb-12">
              <h1 className="font-polymath text-4xl font-bold tracking-normal text-white mb-4">Settings</h1>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {settingsSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <section.icon className="h-5 w-5 text-white/60" />
                    <h2 className="font-polymath text-xl font-medium text-white">{section.title}</h2>
                  </div>

                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                      >
                        {item.content ? (
                          item.content
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="rounded-full bg-white/10 p-2">
                                <item.icon className="h-5 w-5 text-white/80" />
                              </div>
                              <div>
                                <h3 className="font-medium text-white group-hover:text-white/90">
                                  {item.title}
                                </h3>
                                {item.subtitle && (
                                  <p className="text-sm text-white/60 group-hover:text-white/70">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>
                            {item.action}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal 
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
      <UpgradePlanModal
        open={isUpgradePlanOpen}
        onClose={() => setIsUpgradePlanOpen(false)}
      />
    </ResponsiveContainer>
  );
}
