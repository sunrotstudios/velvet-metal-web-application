import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RegisterServiceConnection } from "@/shared/services/RegisterServiceConnection";
import { SpotifyIcon, AppleMusicIcon } from "@/components/icons/service-icons";
import { cn } from "@/lib/utils";
import { Check, Loader } from "lucide-react";
import { ServiceType } from "@/lib/services/streaming-auth";

interface ServiceConnectionsProps {
  connectedServices: ServiceType[];
  isAnySyncing: boolean;
  onFinish: () => void;
}

interface ServiceInfo {
  id: ServiceType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function ServiceConnections({
  connectedServices,
  isAnySyncing,
  onFinish,
}: ServiceConnectionsProps) {
  // Configuration for service cards
  const services: ServiceInfo[] = [
    {
      id: "spotify",
      name: "Spotify",
      icon: SpotifyIcon,
      color: "bg-green-400",
    },
    {
      id: "apple-music",
      name: "Apple Music",
      icon: AppleMusicIcon,
      color: "bg-red-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="space-y-2">
        {services.map((service, index) => {
          const isConnected = connectedServices?.includes(service.id);
          const isSyncing = isConnected && isAnySyncing;
          const ServiceIcon = service.icon;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div
                className={cn(
                  "relative p-3",
                  "border-3 border-black rounded-lg",
                  "transition-all duration-200",
                  isConnected
                    ? "bg-purple-100 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-lg",
                        "border-3 border-black",
                        service.color
                      )}
                    >
                      <ServiceIcon className="w-5 h-5" />
                    </div>
                    <span className="text-base font-bold">{service.name}</span>
                  </div>

                  {isConnected ? (
                    <div className="flex items-center">
                      {isSyncing ? (
                        <div className="flex items-center gap-1.5">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-xs font-bold">Syncing</span>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "px-2 py-1",
                            "bg-green-300 border-2 border-black rounded-full",
                            "flex items-center gap-1.5"
                          )}
                        >
                          <Check className="w-3 h-3" />
                          <span className="text-xs font-bold">Connected</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <RegisterServiceConnection service={service.id} />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Button
        onClick={onFinish}
        disabled={!connectedServices?.length || isAnySyncing}
        className={cn(
          "w-full h-11 text-base font-black mt-3",
          "border-3 border-black rounded-lg",
          "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
          "transition-all",
          connectedServices?.length && !isAnySyncing
            ? "bg-purple-500 text-white hover:bg-purple-600"
            : "bg-gray-100 opacity-50 cursor-not-allowed"
        )}
      >
        {isAnySyncing
          ? "Syncing Library..."
          : !connectedServices?.length
          ? "Connect a Service"
          : "GO TO APP"}
      </Button>
    </motion.div>
  );
}
