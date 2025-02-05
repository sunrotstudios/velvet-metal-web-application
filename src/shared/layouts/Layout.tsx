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
    <div
      className="flex min-h-screen bg-cover bg-center bg-no-repeat overscroll-none"
      style={{
        backgroundImage: 'url("/images/background.jpg")',
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        backgroundBlendMode: 'multiply',
      }}
    >
      {/* Mobile Header */}
      <div className="absolute top-0 left-0 right-0 md:hidden flex items-center justify-between p-4 z-50">
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
        <div className="w-10" />
      </div>

      <div className="flex flex-1">
        <div
          ref={sidebarRef}
          className={cn(
            'w-64',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <main className="flex-1 overflow-y-auto pt-[60px] md:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
