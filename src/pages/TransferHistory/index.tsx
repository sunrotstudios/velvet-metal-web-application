import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
import { motion } from 'framer-motion';
import { Header } from './components/Header';

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
    type?: 'playlist' | 'album';
    sourcePlaylistId?: string;
    sourcePlaylistName?: string;
    targetPlaylistId?: string;
    targetPlaylistName?: string;
    tracksCount?: number;
    sourceAlbumId?: string;
    targetAlbumId?: string;
    sourceAlbumName?: string;
  };
}

export default function TransferHistory() {
  const { user } = useAuth();

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfers', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching Transfers for User:', user.id);
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transfers:', error);
        throw error;
      }
      console.log('Fetched Transfers:', data);
      return data as Transfer[];
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-none pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Header />
        </motion.div>

        {isLoading ? (
          <LoadingSpinner centered />
        ) : !transfers?.length ? (
          <p className="text-center text-muted-foreground">
            No transfers found. Start by transferring a playlist or album from
            your library!
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracks</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="capitalize">
                      {transfer.source_service === 'apple-music'
                        ? 'Apple Music'
                        : transfer.source_service}
                    </TableCell>
                    <TableCell className="capitalize">
                      {transfer.destination_service === 'apple-music'
                        ? 'Apple Music'
                        : transfer.destination_service}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {transfer.metadata.type === 'album'
                            ? transfer.metadata.sourceAlbumName
                            : transfer.metadata.sourcePlaylistName}
                        </span>
                        {transfer.metadata.type === 'playlist' &&
                          transfer.metadata.targetPlaylistName && (
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
                      >
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{transfer.metadata.tracksCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {formatDistanceToNow(new Date(transfer.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {/* {transfer.completed_at && (
                          <span className="text-sm text-muted-foreground">
                            Completed{' '}
                            {formatDistanceToNow(
                              new Date(transfer.completed_at),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        )} */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
