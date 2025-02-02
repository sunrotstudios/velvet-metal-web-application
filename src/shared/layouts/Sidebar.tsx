import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  History,
  Home,
  Library,
  Radio,
  Settings,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onClose?: () => void;
}

const routes = [
  {
    path: '/home',
    label: 'Home',
    icon: Home,
  },
  {
    path: '/library',
    label: 'Library',
    icon: Library,
  },
  {
    path: '/transfer',
    label: 'Transfer',
    icon: ArrowLeftRight,
  },
  {
    path: '/lastfm',
    label: 'Stats',
    icon: Radio,
  },
  {
    path: '/transfer-history',
    label: 'Transfer History',
    icon: History,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="text-xl font-radlush font-extrabold hidden md:block">
          Velvet Metal
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {routes.map((route) => {
            const isActive = location.pathname === route.path;
            const Icon = route.icon;

            return (
              <Link
                key={route.path}
                to={route.path}
                onClick={handleNavigation}
                className="block"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-4 px-4 font-medium',
                      isActive
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {route.label}
                  </Button>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </nav>
    </div>
  );
}
