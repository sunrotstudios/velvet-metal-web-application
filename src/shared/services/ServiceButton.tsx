import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useConnectedServices } from "@/lib/hooks/useConnectedServices";
import { useQueryClient } from "@tanstack/react-query";
import { authorizeAppleMusic } from "@/lib/services/apple-music-auth";
import { authorizeSpotify } from "@/lib/services/spotify";
import { ServiceType } from "@/lib/services/streaming-auth";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegisterServiceConnectionProps {
  service: ServiceType;
  className?: string;
}

export function RegisterServiceConnection({
  service,
  className,
}: RegisterServiceConnectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const { data: connectedServices } = useConnectedServices();
  const isConnected = connectedServices?.includes(service);
  const queryClient = useQueryClient();

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect services.",
      });
      return;
    }

    setIsConnecting(true);
    try {
      if (service === "spotify") {
        await authorizeSpotify(user.id);
      } else if (service === "apple-music") {
        await authorizeAppleMusic(user.id);
      }

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["connectedServices"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect service",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-emerald-500 font-bold">
        <Check className="w-5 h-5" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn(
        "w-full h-12 md:h-14 text-base md:text-lg font-bold",
        "border-3 border-black rounded-lg",
        "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        "active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "transition-all",
        "bg-yellow-300 hover:bg-yellow-400 text-black",
        className
      )}
    >
      {isConnecting ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span>Connect</span>
        </div>
      )}
    </Button>
  );
}
