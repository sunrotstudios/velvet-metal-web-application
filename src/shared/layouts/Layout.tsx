import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/shared/layouts/Sidebar';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !toggleButtonRef.current?.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Mobile Header */}
      <div className="absolute top-0 left-0 right-0 md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black z-50">
        <Button
          ref={toggleButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <div className="text-xl tracking-tighter font-bold">
          VELVET<span className="text-gray-500">METAL</span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex flex-1 h-full">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-white/10 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 overflow-y-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-[60px] md:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
