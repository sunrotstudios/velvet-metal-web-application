import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { ServiceType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Transfer {
  id: string;
  user_id: string;
  source_service: ServiceType;
  destination_service: ServiceType;
  status: "pending" | "success" | "failed";
  created_at: string;
  completed_at: string | null;
  error: string | null;
  tracks_transferred: number;
  metadata: {
    type?: "playlist" | "album";
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
    queryKey: ["transfers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log("Fetching Transfers for User:", user.id);
      const { data, error } = await supabase
        .from("transfers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transfers:", error);
        throw error;
      }
      console.log("Fetched Transfers:", data);
      return data as Transfer[];
    },
    enabled: !!user,
  });

  if (!user) return null;

  const getStatusStyles = (status: Transfer["status"]) => {
    switch (status) {
      case "success":
        return {
          background: "bg-green-100",
          badge: "bg-green-200",
          text: "text-green-800",
        };
      case "failed":
        return {
          background: "bg-red-100",
          badge: "bg-red-200",
          text: "text-red-800",
        };
      default:
        return {
          background: "bg-yellow-100",
          badge: "bg-yellow-200",
          text: "text-yellow-800",
        };
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-none pt-20 px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          Transfer History
        </motion.h1>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64"
          >
            <LoadingSpinner />
          </motion.div>
        ) : !transfers?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-yellow-100 border-4 border-black p-6 rounded-lg text-center",
              "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            )}
          >
            <p className="text-lg">
              No transfers found. Start by transferring a playlist or album from
              your library!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4 pb-8">
            {transfers.map((transfer, index) => {
              const statusStyles = getStatusStyles(transfer.status);

              return (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "border-4 border-black rounded-lg p-4",
                    "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    statusStyles.background
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h2 className="text-xl font-bold">
                        {transfer.metadata.type === "album"
                          ? transfer.metadata.sourceAlbumName
                          : transfer.metadata.sourcePlaylistName}
                      </h2>
                      <Badge
                        className={cn(
                          "px-4 py-1.5 border-2 border-black rounded-lg font-bold capitalize",
                          statusStyles.badge
                        )}
                      >
                        {transfer.status}
                      </Badge>
                    </div>

                    {transfer.metadata.type === "playlist" &&
                      transfer.metadata.targetPlaylistName && (
                        <div className="text-base">
                          New name: {transfer.metadata.targetPlaylistName}
                        </div>
                      )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-bold mb-1">From</div>
                        <div className="capitalize">
                          {transfer.source_service === "apple-music"
                            ? "Apple Music"
                            : transfer.source_service}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold mb-1">To</div>
                        <div className="capitalize">
                          {transfer.destination_service === "apple-music"
                            ? "Apple Music"
                            : transfer.destination_service}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold mb-1">Tracks</div>
                        <div>{transfer.metadata.tracksCount}</div>
                      </div>
                      <div>
                        <div className="font-bold mb-1">When</div>
                        <div>
                          {formatDistanceToNow(new Date(transfer.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>

                    {transfer.error && (
                      <div
                        className={cn(
                          "mt-2 p-3 border-2 border-black rounded-lg",
                          "bg-white bg-opacity-50"
                        )}
                      >
                        <div className="font-bold mb-1">Error</div>
                        <div className="text-red-800">{transfer.error}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
