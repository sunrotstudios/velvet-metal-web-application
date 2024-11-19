import { Skeleton } from '@/components/ui/skeleton';

export function LibrarySkeleton() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[400px]" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-[280px]" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
