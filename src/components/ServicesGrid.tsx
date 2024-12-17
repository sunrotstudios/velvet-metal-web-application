import { Card, CardContent } from "@/components/ui/card"
import { ServiceType } from "@/lib/services/streaming-auth"
import { Music2, AppleIcon } from "lucide-react"
import { useConnectedServices } from "@/lib/hooks/useConnectedServices"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "./ui/use-toast"
import { authorizeSpotify } from "@/lib/services/spotify-auth"
import { authorizeAppleMusic } from "@/lib/services/apple-music-auth"

const services = [
  {
    id: "spotify" as ServiceType,
    name: "Spotify",
    icon: Music2,
    color: "bg-[#1DB954]",
    textColor: "text-[#1DB954]",
  },
  {
    id: "apple-music" as ServiceType,
    name: "Apple Music",
    icon: AppleIcon,
    color: "bg-[#FC3C44]",
    textColor: "text-[#FC3C44]",
  },
]

export function ServicesGrid() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: connectedServices, refetch: refetchConnectedServices } = useConnectedServices()

  const handleConnect = async (service: ServiceType) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to connect a service",
        variant: "destructive",
      })
      return
    }

    try {
      if (service === "spotify") {
        sessionStorage.setItem("auth_callback_url", window.location.pathname)
        await authorizeSpotify(user.id)
      } else if (service === "apple-music") {
        await authorizeAppleMusic(user.id)
      }
      await refetchConnectedServices()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to connect to ${service}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => {
        const isConnected = connectedServices?.includes(service.id)
        return (
          <Card
            key={service.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-105",
              isConnected && "ring-2 ring-primary"
            )}
            onClick={() => !isConnected && handleConnect(service.id)}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div
                className={cn(
                  "p-4 rounded-full",
                  isConnected ? service.color : "bg-muted"
                )}
              >
                <service.icon
                  className={cn(
                    "w-8 h-8",
                    isConnected ? "text-white" : service.textColor
                  )}
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? "Connected" : "Click to connect"}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
