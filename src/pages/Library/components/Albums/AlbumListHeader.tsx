import { cn } from '@/lib/utils';

interface AlbumListHeaderProps {
  className?: string;
}

export function AlbumListHeader({ className }: AlbumListHeaderProps) {
  return (
    <div className={cn(
      "hidden md:flex items-center gap-6 px-6 py-2 text-sm font-medium text-muted-foreground bg-accent/5",
      className
    )}>
      {/* Album Info Column */}
      <div className="w-[72px]" /> {/* Space for album artwork */}
      <div className="flex-1">Title</div>

      {/* Additional Info Columns */}
      <div className="w-24 shrink-0">Type</div>
      <div className="w-24 shrink-0">Tracks</div>
      <div className="w-20 shrink-0">Year</div>
      <div className="w-24 shrink-0">Service</div>
    </div>
  );
}
