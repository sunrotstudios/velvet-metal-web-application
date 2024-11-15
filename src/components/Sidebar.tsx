import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, Library, Settings } from 'lucide-react';

const routes = [
  {
    path: '/',
    label: 'Home',
    icon: Home,
  },
  {
    path: '/library',
    label: 'Library',
    icon: Library,
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
                variant={location.pathname === route.path ? 'secondary' : 'ghost'}
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
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Connected Services
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2"></div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}