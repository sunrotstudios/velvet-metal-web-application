import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { RegisterServiceConnection } from "@/shared/services/RegisterServiceConnection";
import {
  SpotifyIcon,
  AppleMusicIcon,
  TidalIcon,
} from "@/components/icons/service-icons";
import { cn } from "@/lib/utils";
import { Check, Loader } from "lucide-react";

interface ServiceConnectionsProps {
  connectedServices: any[];
  isAnySyncing: boolean;
  onFinish: () => void;
}

export function ServiceConnections({
  connectedServices,
  isAnySyncing,
  onFinish,
}: ServiceConnectionsProps) {
  // Configuration for service cards
  const services = [
    {
      id: "spotify",
      name: "Spotify",
      icon: SpotifyIcon,
      color: "bg-green-400",
    },
    {
      id: "apple_music",
      name: "Apple Music",
      icon: AppleMusicIcon,
      color: "bg-red-400",
    },
    {
      id: "tidal",
      name: "Tidal",
      icon: TidalIcon,
      color: "bg-blue-400",
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="space-y-4">
        {services.map((service, index) => {
          const isConnected = connectedServices?.some(
            (s) => s.service === service.id
          );
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
                  "relative p-4",
                  "border-4 border-black rounded-[20px]",
                  "transition-all duration-200",
                  isConnected
                    ? "bg-purple-100 -translate-y-1"
                    : "bg-white hover:-translate-y-1",
                  isConnected
                    ? "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    : "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-lg",
                        "border-4 border-black",
                        service.color
                      )}
                    >
                      <ServiceIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold">{service.name}</span>
                  </div>

                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      {isSyncing ? (
                        <div className="flex items-center gap-2">
                          <Loader className="w-5 h-5 animate-spin" />
                          <span className="text-sm font-bold">Syncing...</span>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "px-3 py-1",
                            "bg-green-300 border-3 border-black rounded-full",
                            "flex items-center gap-2"
                          )}
                        >
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-bold">Connected</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <RegisterServiceConnection
                      service={service.id}
                      render={({ onClick, isLoading }) => (
                        <Button
                          onClick={onClick}
                          disabled={isLoading}
                          className={cn(
                            "px-4 py-2 h-10 font-bold",
                            "border-3 border-black rounded-lg",
                            "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                            "hover:translate-x-[-1px] hover:translate-y-[-1px]",
                            "active:translate-x-0 active:translate-y-0",
                            "transition-all",
                            "bg-yellow-300 hover:bg-yellow-400"
                          )}
                        >
                          {isLoading ? (
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      )}
                    />
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
          "w-full h-12 text-lg font-bold mt-6",
          "border-4 border-black rounded-xl",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "active:translate-x-0 active:translate-y-0",
          "transition-all",
          connectedServices?.length && !isAnySyncing
            ? "bg-purple-100 hover:bg-purple-200"
            : "bg-gray-100 opacity-50 cursor-not-allowed"
        )}
      >
        {isAnySyncing
          ? "Syncing Library..."
          : !connectedServices?.length
          ? "Connect a Service First"
          : "Go to App"}
      </Button>
    </motion.div>
  );
}
