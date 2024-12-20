import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { History, Home, Library, Radio, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
    path: '/lastfm',
    label: 'Last.fm Stats',
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

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-6 px-4 text-2xl font-semibold tracking-tight">
            Velvet Metal
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.path}
                variant={
                  location.pathname === route.path ? 'secondary' : 'ghost'
                }
                className={cn('w-full justify-start', {
                  'bg-secondary': location.pathname === route.path,
                })}
                asChild
              >
                <Link to={route.path}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
