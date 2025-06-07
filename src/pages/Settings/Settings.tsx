import { useAuth } from "@/contexts/auth-context";
import { useLastFm } from "@/contexts/last-fm-context";
import { useConnectedServices } from "@/lib/hooks/useConnectedServices";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { LogOut, Music, Music2, Radio, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { authorizeSpotify, unauthorizeSpotify } from "@/lib/services/spotify";
import {
  authorizeAppleMusic,
  unauthorizeAppleMusic,
} from "@/lib/services/apple-music";
import { authorizeLastFm, unauthorizeLastFm } from "@/lib/services/lastfm-auth";
import { useToast } from "@/components/ui/use-toast";
import { ServiceType } from "@/lib/services/auth";

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: connectedServices, refetch: refetchConnectedServices } =
    useConnectedServices();
  const { username: lastFmUsername, setUsername: setLastFmUsername } =
    useLastFm();
  const [profile, setProfile] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          }
        });
    }
  }, [user]);

  const handleConnect = async (service: ServiceType) => {
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
      } else if (service === "lastfm") {
        const username = prompt("Enter your Last.fm username:");
        if (username) {
          await authorizeLastFm(username);
          setLastFmUsername(username);
        }
      }
      await refetchConnectedServices();
    } catch (error) {
      console.error("Error connecting service:", error);
      toast({
        title: "Error",
        description: "Failed to connect service. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (service: ServiceType) => {
    if (!user) return;

    setIsConnecting(true);
    try {
      // First remove the service authorization
      if (service === "spotify") {
        await unauthorizeSpotify(user.id);
      } else if (service === "apple-music") {
        await unauthorizeAppleMusic(user.id);
      } else if (service === "lastfm") {
        await unauthorizeLastFm();
        setLastFmUsername("");
      }

      // Then clean up the user's data for this service
      if (service !== "lastfm") {
        // Delete albums
        await supabase
          .from("user_albums")
          .delete()
          .eq("user_id", user.id)
          .eq("service", service);

        // Delete playlists
        await supabase
          .from("user_playlists")
          .delete()
          .eq("user_id", user.id)
          .eq("service", service);
      }

      await refetchConnectedServices();
      toast({
        title: "Success",
        description: "Service disconnected successfully.",
      });
    } catch (error) {
      console.error("Error disconnecting service:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect service. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (!user) return null;

  const services = [
    {
      name: "Spotify",
      icon: Music2,
      type: "spotify" as const,
      isConnected: connectedServices?.includes("spotify"),
      bgColor: "bg-green-100",
    },
    {
      name: "Apple Music",
      icon: Music,
      type: "apple-music" as const,
      isConnected: connectedServices?.includes("apple-music"),
      bgColor: "bg-pink-100",
    },
    {
      name: "Last.fm",
      icon: Radio,
      type: "lastfm" as const,
      isConnected: !!lastFmUsername,
      username: lastFmUsername,
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-none pt-20 px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          Settings
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-purple-100 border-4 border-black p-4 rounded-lg",
              "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full border-4 border-black overflow-hidden w-16 h-16 shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold mb-2">
                  {user.user_metadata?.display_name || "User"}
                </h2>
                <p className="text-base mb-2 truncate">{user.email}</p>
                <p className="text-base mb-2">
                  Member since:{" "}
                  {format(new Date(user.created_at), "MMMM d, yyyy")}
                </p>
                <p className="text-base mb-3">
                  Status:{" "}
                  <span className="font-bold capitalize">
                    {profile?.subscription_tier}
                  </span>
                </p>
                <button
                  className={cn(
                    "px-4 py-2 bg-white border-2 border-black rounded-lg font-bold transition-all",
                    "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    "hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  )}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </motion.div>

          {/* Connected Services */}
          <div className="space-y-3">
            {services.map((service, index) => (
              <motion.div
                key={service.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "border-4 border-black rounded-lg p-3 transition-all",
                  service.bgColor,
                  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <service.icon className="w-5 h-5" />
                    <div>
                      <h3 className="font-bold">{service.name}</h3>
                      <p className="text-sm">
                        {service.isConnected ? "Connected" : "Not connected"}
                        {service.type === "lastfm" &&
                          service.username &&
                          ` (${service.username})`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      service.isConnected
                        ? handleDisconnect(service.type)
                        : handleConnect(service.type)
                    }
                    disabled={isConnecting}
                    className={cn(
                      "px-4 py-1.5 bg-white border-2 border-black rounded-lg text-sm font-bold transition-all",
                      "text-black",
                      "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                      "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isConnecting
                      ? "Loading..."
                      : service.isConnected
                      ? "Disconnect"
                      : "Connect"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Account Actions */}
          <div className="space-y-3">
            <button
              onClick={logout}
              className={cn(
                "w-full px-4 py-3 bg-yellow-200 border-4 border-black rounded-lg font-bold transition-all",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                "flex items-center gap-2"
              )}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  )
                ) {
                  // TODO: Implement account deletion
                }
              }}
              className={cn(
                "w-full px-4 py-3 bg-red-200 border-4 border-black rounded-lg font-bold transition-all",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                "flex items-center gap-2"
              )}
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
