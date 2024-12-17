import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { ServiceType } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface Transfer {
  id: string;
  user_id: string;
  source_service: ServiceType;
  destination_service: ServiceType;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
  completed_at: string | null;
  error: string | null;
  tracks_transferred: number;
  metadata: {
    sourcePlaylistId: string;
    sourcePlaylistName: string;
    targetPlaylistId?: string;
    targetPlaylistName?: string;
    tracksCount?: number;
  };
}

export default function TransferHistory() {
  const { user } = useAuth();

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transfer[];
    },
    enabled: !!user,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Transfer History</h1>
        <Card className="p-6">
          <LoadingState text="Loading transfer history..." />
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transfer History</h1>
        <Badge variant="secondary" className="text-sm">
          {transfers?.length || 0} transfers
        </Badge>
      </div>

      {!transfers?.length ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No transfers found. Start by transferring a playlist or album from your library!
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracks</TableHead>
                <TableHead className="min-w-[200px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium capitalize">
                    {transfer.source_service === 'apple-music'
                      ? 'Apple Music'
                      : transfer.source_service}
                  </TableCell>
                  <TableCell className="font-medium capitalize">
                    {transfer.destination_service === 'apple-music'
                      ? 'Apple Music'
                      : transfer.destination_service}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{transfer.metadata.sourcePlaylistName}</span>
                      {transfer.metadata.targetPlaylistName && (
                        <span className="text-sm text-muted-foreground">
                          → {transfer.metadata.targetPlaylistName}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transfer.status === 'success'
                          ? 'success'
                          : transfer.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="capitalize"
                    >
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transfer.metadata.tracksCount || transfer.tracks_transferred || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(transfer.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {transfer.completed_at && (
                        <span className="text-sm text-muted-foreground">
                          Completed{' '}
                          {formatDistanceToNow(new Date(transfer.completed_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
