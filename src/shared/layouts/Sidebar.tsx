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
      <div className="p-6">
        <Link to="/" className="block">
          <span className="text-xl font-semibold text-text dark:text-darkText">
            Velvet Metal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {routes.map(({ path: href, label, icon: Icon }) => {
            const isActive = href === location.pathname;
            return (
              <Link
                key={label}
                to={href}
                className="block group"
                onClick={handleNavigation}
              >
                <motion.div
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ease-in-out',
                    isActive
                      ? 'text-text dark:text-darkText hover:text-text dark:hover:text-darkText'
                      : 'text-text/60 dark:text-darkText/60 hover:text-text dark:hover:text-darkText'
                  )}
                  layout
                  layoutId={`nav-item-${label}`}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <motion.div
                    className="flex items-center gap-2 w-full"
                    initial={false}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </motion.div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </nav>
    </div>
  );
}
