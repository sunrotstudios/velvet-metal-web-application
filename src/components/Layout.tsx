import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}