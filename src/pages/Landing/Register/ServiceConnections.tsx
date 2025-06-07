"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SpotifyIcon, AppleMusicIcon } from "@/components/icons/service-icons";
import { RegisterServiceConnection } from "@/shared/services/ServiceButton";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ServiceType } from "@/lib/types";

interface ServiceInfo {
  id: ServiceType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ServiceConnectionsProps {
  connectedServices: ServiceType[];
  onFinish: () => void;
}

export function ServiceConnections({
  connectedServices = [],
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
      className={cn(
        "w-full max-w-[600px] bg-white",
        "rounded-xl sm:rounded-[32px] border-2 sm:border-4 border-black",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        "p-3 sm:p-6 md:p-8"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {/* Services Container */}
      <div className="bg-white mb-6 w-full">
        <div className="space-y-5 w-full">
          {services.map((service, index) => {
            const isConnected = connectedServices?.includes(service.id);
            const ServiceIcon = service.icon;

            return (
              <motion.div
                key={service.id}
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div
                  className={cn(
                    "relative p-4 md:p-5",
                    "border-3 border-black rounded-lg",
                    "transition-all duration-200",
                    isConnected
                      ? "bg-purple-100 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white hover:-translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg",
                          "border-3 border-black",
                          service.color
                        )}
                      >
                        <ServiceIcon className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <span className="text-lg md:text-xl font-black">
                        {service.name}
                      </span>
                    </div>

                    {isConnected ? (
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "px-4 py-2",
                            "bg-green-300 border-3 border-black rounded-lg",
                            "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                            "flex items-center gap-2"
                          )}
                        >
                          <Check className="w-5 h-5 md:w-6 md:h-6" />
                          <span className="text-sm md:text-base font-bold">
                            Connected
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-12 md:h-14">
                        <RegisterServiceConnection
                          service={service.id}
                          className="h-full px-6 flex items-center justify-center gap-2 text-base md:text-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Button
        onClick={onFinish}
        disabled={!connectedServices?.length}
        className={cn(
          "w-full h-11 md:h-14 text-base md:text-xl font-black",
          "border-3 border-black rounded-lg",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "transition-all",
          connectedServices?.length
            ? "bg-purple-500 text-white hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            : "bg-gray-100 opacity-50 cursor-not-allowed"
        )}
      >
        {!connectedServices?.length ? "Connect a Service" : "GO TO APP"}
      </Button>
    </motion.div>
  );
}
