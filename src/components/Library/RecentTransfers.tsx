import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function RecentTransfers() {
  const { user } = useAuth();

  const { data: recentTransfers, isLoading } = useQuery({
    queryKey: ['recentTransfers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transfers')
        .select(
          `
          *,
          source_playlist:source_playlist_id (*),
          target_playlist:target_playlist_id (*)
        `
        )
        .eq('user_id', user.id)
        .eq('status', 'success')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return { items: data || [] };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Recent Transfers
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!recentTransfers?.items.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">
        Recent Transfers
      </h2>
      <ScrollArea className="pb-4">
        <div className="flex gap-4">
          {recentTransfers.items.map((transfer) => (
            <Card
              key={transfer.id}
              className="flex-none w-[300px] p-4 space-y-4"
            >
              <div className="space-y-1">
                <h3 className="font-medium">
                  {transfer.metadata.sourcePaylistName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {transfer.metadata.tracksCount} tracks transferred
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transfer.completed_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
