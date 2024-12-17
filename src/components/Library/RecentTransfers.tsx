import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        .limit(10);

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
        <Card className="p-6">
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </Card>
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
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Playlist</TableHead>
              <TableHead>Tracks</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransfers.items.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">
                  {transfer.metadata.sourcePaylistName}
                </TableCell>
                <TableCell>{transfer.metadata.tracksCount} tracks</TableCell>
                <TableCell className="capitalize">{transfer.source_service}</TableCell>
                <TableCell className="capitalize">{transfer.target_service}</TableCell>
                <TableCell className="text-right">
                  {new Date(transfer.completed_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
