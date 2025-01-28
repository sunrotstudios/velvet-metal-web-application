import { supabase } from '@/lib/supabase'
import { syncSpotifyLibrary } from './spotify-library'
import { syncAppleMusicLibrary } from './apple-music-library'

const SYNC_INTERVAL = 1000 * 60 * 60 * 12 // 12 hours

export async function scheduleLibrarySync(userId: string) {
  try {
    // Get last sync time for each service
    const { data: services } = await supabase
      .from('user_services')
      .select('service, access_token, music_user_token, last_library_sync')
      .eq('user_id', userId)

    if (!services?.length) return

    const now = new Date()

    for (const service of services) {
      const lastSync = service.last_library_sync ? new Date(service.last_library_sync) : null
      const shouldSync = !lastSync || (now.getTime() - lastSync.getTime() > SYNC_INTERVAL)

      if (shouldSync) {
        try {
          if (service.service === 'spotify' && service.access_token) {
            await syncSpotifyLibrary(userId, service.access_token)
          } else if (service.service === 'apple-music' && service.music_user_token) {
            await syncAppleMusicLibrary(userId)
          }

          // Update last sync time
          await supabase
            .from('user_services')
            .update({ last_library_sync: now.toISOString() })
            .eq('user_id', userId)
            .eq('service', service.service)

        } catch (error) {
          console.error(`Failed to sync ${service.service} library:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Failed to schedule library sync:', error)
  }
}

// Function to check and trigger sync on app load
export async function checkAndTriggerSync() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      await scheduleLibrarySync(user.id)
    }
  } catch (error) {
    console.error('Failed to check and trigger sync:', error)
  }
}
