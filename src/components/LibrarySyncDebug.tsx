import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { librarySyncQueue } from '@/lib/services/library-sync-queue';

export function LibrarySyncDebug() {
  const { user } = useAuth();
  const [libraryItems, setLibraryItems] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch latest library items
        const { data: items, error: itemsError } = await supabase
          .from('user_library_items')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false })
          .limit(10);

        if (itemsError) throw itemsError;
        setLibraryItems(items || []);

        // Fetch sync history
        const { data: history, error: historyError } = await supabase
          .from('library_sync_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (historyError) throw historyError;
        setSyncHistory(history || []);
      } catch (error) {
        console.error('Error fetching debug data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const itemsSubscription = supabase
      .channel('library-items')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_library_items',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setLibraryItems((current) => [payload.new, ...current.slice(0, 9)]);
        }
      )
      .subscribe();

    const historySubscription = supabase
      .channel('sync-history')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'library_sync_history',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setSyncHistory((current) => [payload.new, ...current.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      itemsSubscription.unsubscribe();
      historySubscription.unsubscribe();
    };
  }, [user]);

  const triggerManualSync = () => {
    if (!user) return;
    librarySyncQueue.enqueue(user.id, 'spotify', 2);
    librarySyncQueue.enqueue(user.id, 'apple-music', 2);
  };

  if (!user) {
    return <div className="p-4">Please login to view library sync status</div>;
  }

  if (loading) {
    return <div className="p-4">Loading sync status...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Library Sync Debug</h2>
        <button
          onClick={triggerManualSync}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Trigger Manual Sync
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Recent Sync History</h3>
          <div className="space-y-2">
            {syncHistory.map((sync) => (
              <div
                key={sync.id}
                className="p-3 bg-gray-100 rounded flex justify-between"
              >
                <div>
                  <span className="font-medium">{sync.service}</span>
                  <span className="mx-2">•</span>
                  <span>{sync.status}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(sync.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Latest Library Items</h3>
          <div className="space-y-2">
            {libraryItems.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-100 rounded flex justify-between"
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.artist && (
                    <>
                      <span className="mx-2">by</span>
                      <span>{item.artist}</span>
                    </>
                  )}
                  <span className="mx-2">•</span>
                  <span className="text-sm">
                    {item.type} from {item.service}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(item.added_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
