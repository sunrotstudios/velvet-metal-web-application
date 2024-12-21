import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex md:hidden items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <h1 className="text-lg font-semibold">Velvet Metal</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 bg-background md:relative md:block h-full',
            sidebarOpen ? 'block' : 'hidden'
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
