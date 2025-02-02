import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { syncSpotifyLibrary } from "@/lib/services/spotify-library"
import { syncAppleMusicLibrary } from "@/lib/services/apple-music-library"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ResyncLibraryButton() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleResync = async () => {
    if (!user?.id) return
    setIsSyncing(true)

    try {
      // Start both syncs in parallel
      const syncPromises = []
      
      // Get user's connected services
      const { data: services } = await supabase
        .from('user_services')
        .select('service, access_token, music_user_token')
        .eq('user_id', user.id)

      for (const service of services || []) {
        if (service.service === 'spotify' && service.access_token) {
          syncPromises.push(
            syncSpotifyLibrary(user.id, service.access_token)
          )
        } else if (service.service === 'apple-music' && service.music_user_token) {
          syncPromises.push(
            syncAppleMusicLibrary(user.id)
          )
        }
      }

      await Promise.all(syncPromises)

      toast({
        title: "Library Sync Complete",
        description: "Your music library has been updated.",
      })
    } catch (error) {
      console.error('Sync failed:', error)
      toast({
        title: "Sync Failed",
        description: "There was an error syncing your library. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button 
      onClick={handleResync} 
      disabled={isSyncing}
    >
      {isSyncing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        'Sync Library Now'
      )}
    </Button>
  )
}
