// import { Tabs } from '@/components/ui/tabs';
// import { useAuth } from '@/contexts/auth-context';
// import { useDebounce } from '@/hooks/useDebounce';
// import { getStoredLibrary, syncLibrary } from '@/lib/services';
// import { getUserServices } from '@/lib/services/streaming-auth';
// import { Playlist, ServiceType, ViewMode } from '@/lib/types';
// import { LibrarySkeleton } from '@/pages/Library/components/LibrarySkeleton';
// import { ExportLibraryDialog } from '@/shared/modals/ExportLibraryDialog';
// import { TransferPlaylistModal } from '@/shared/modals/PlaylistTransferModal';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { motion } from 'framer-motion';
// import { memo, useEffect, useRef, useState } from 'react';
// import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
// import { toast } from 'sonner';
// import { AlbumCard } from './components/Albums/AlbumCard';
// import { AlbumsTab } from './components/AlbumsTab';
// import { Controls } from './components/Controls';
// import { Header } from './components/Header';
// import { PlaylistCard } from './components/Playlists/PlaylistCard';
// import { PlaylistsTab } from './components/PlaylistsTab';

// export default function Library() {
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const location = useLocation();
//   const { user } = useAuth();
//   const queryClient = useQueryClient();
//   const playlistsTabRef = useRef(null);
//   const albumsTabRef = useRef(null);

//   // Store current params in session storage when navigating away
//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       const currentParams = Object.fromEntries(searchParams.entries());
//       sessionStorage.setItem('libraryParams', JSON.stringify(currentParams));
//     };

//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => {
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, [searchParams]);

//   // Restore params from session storage or location state
//   useEffect(() => {
//     const state = location.state as {
//       previousParams?: Record<string, string>;
//     } | null;
//     if (state?.previousParams) {
//       setSearchParams(state.previousParams);
//       navigate(location.pathname, { replace: true, state: {} });
//     } else {
//       const storedParams = sessionStorage.getItem('libraryParams');
//       if (storedParams) {
//         setSearchParams(JSON.parse(storedParams));
//         sessionStorage.removeItem('libraryParams');
//       }
//     }
//   }, [location]);

//   // Get filter values from URL params with defaults
//   const activeService =
//     (searchParams.get('service') as ServiceType) || 'spotify';
//   const viewMode = (searchParams.get('view') as ViewMode) || 'grid';
//   const sortBy = searchParams.get('sort') || 'name-asc';
//   const activeTab =
//     (searchParams.get('tab') as 'albums' | 'playlists') || 'albums';
//   const albumTypeFilter =
//     (searchParams.get('albumType') as 'all' | 'album' | 'single' | 'ep') ||
//     'all';

//   // Update URL params handlers
//   const setActiveService = (service: ServiceType) => {
//     setSearchParams((prev) => {
//       prev.set('service', service);
//       return prev;
//     });
//   };

//   const setViewMode = (mode: ViewMode) => {
//     setSearchParams((prev) => {
//       prev.set('view', mode);
//       return prev;
//     });
//   };

//   const setSortBy = (sort: string) => {
//     setSearchParams((prev) => {
//       prev.set('sort', sort);
//       return prev;
//     });
//   };

//   const setActiveTab = (tab: 'albums' | 'playlists') => {
//     setSearchParams((prev) => {
//       prev.set('tab', tab);
//       return prev;
//     });
//   };

//   const setAlbumTypeFilter = (type: 'all' | 'album' | 'single' | 'ep') => {
//     setSearchParams((prev) => {
//       prev.set('albumType', type);
//       return prev;
//     });
//   };

//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
//     null
//   );
//   const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
//   const [isExportOpen, setIsExportOpen] = useState(false);
//   const [isSelectionMode, setIsSelectionMode] = useState(false);

//   const debouncedSearchQuery = useDebounce(searchQuery, 300);

//   // Memoized components
//   const MemoizedAlbumCard = memo(AlbumCard);
//   const MemoizedPlaylistCard = memo(PlaylistCard);

//   const filterItems = (
//     items: any[],
//     query: string,
//     sort: string,
//     type?: string
//   ) => {
//     let filtered = items;

//     // Filter by search query
//     if (query) {
//       const searchTerm = query.toLowerCase();
//       filtered = items.filter((item) => {
//         const nameMatch = item.name.toLowerCase().includes(searchTerm);
//         const artistMatch = (item.artist_name || item.artistName || '')
//           .toLowerCase()
//           .includes(searchTerm);
//         return nameMatch || artistMatch;
//       });
//     }

//     // Filter by album type if applicable
//     if (type && type !== 'all') {
//       filtered = filtered.filter((item) => item.album_type === type);
//     }

//     // Sort items
//     filtered.sort((a, b) => {
//       if (sort === 'recent') {
//         const aDate = a.added_at ? new Date(a.added_at) : new Date(0);
//         const bDate = b.added_at ? new Date(b.added_at) : new Date(0);
//         return bDate.getTime() - aDate.getTime(); // Most recent first
//       }

//       const [field, direction] = sort.split('-');
//       const aValue =
//         field === 'artist'
//           ? (a.artist_name || a.artistName || '').toLowerCase()
//           : (a[field] || '').toLowerCase();
//       const bValue =
//         field === 'artist'
//           ? (b.artist_name || b.artistName || '').toLowerCase()
//           : (b[field] || '').toLowerCase();
//       return direction === 'asc'
//         ? aValue.localeCompare(bValue)
//         : bValue.localeCompare(aValue);
//     });

//     return filtered;
//   };

//   // Get user services and check connection
//   const { data: userServices, isLoading: servicesLoading } = useQuery({
//     queryKey: ['userServices', user?.id],
//     queryFn: async () => {
//       console.log('Fetching Services for User:', user?.id);
//       if (!user) return [];
//       const services = await getUserServices(user.id);
//       console.log('User Services:', services);
//       return services;
//     },
//     enabled: !!user,
//   });

//   const isServiceConnected = userServices?.includes(activeService);

//   // Get Stored Library
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ['storedLibrary', activeService],
//     queryFn: async () => {
//       try {
//         console.log('Fetching Library for Service:', activeService);
//         const data = await getStoredLibrary(user!.id, activeService);

//         return data;
//       } catch (error) {
//         console.error('Error fetching library:', error);
//         if (error.status === 404) {
//           return {
//             albums: [],
//             playlists: [],
//             lastSynced: null,
//           };
//         }
//         throw error;
//       }
//     },
//     enabled:
//       !!activeService && !!user && !!isServiceConnected && !servicesLoading,
//     staleTime: 5 * 60 * 1000,
//     retry: 1,
//     select: (data) => {
//       const processed = {
//         albums: Array.isArray(data.albums)
//           ? data.albums.map((album) => ({
//               ...album,
//               name: album.name || '',
//               artistName: album.artist_name || '',
//               albumType: album.album_type?.toLowerCase() || 'album',
//               artwork: {
//                 url: album.image_url,
//                 width: null,
//                 height: null,
//               },
//               trackCount: album.tracks_count || 0,
//             }))
//           : [],
//         playlists: Array.isArray(data.playlists)
//           ? data.playlists.map((playlist) => ({
//               ...playlist,
//               name: playlist.name || '',
//               description: playlist.description || '',
//               tracks: {
//                 total: playlist.tracks_count || 0,
//                 href: null,
//               },
//               artwork: {
//                 url: playlist.image_url,
//                 width: null,
//                 height: null,
//               },
//             }))
//           : [],
//         lastSynced: data.lastSynced,
//       };

//       return processed;
//     },
//   });

//   const filteredAlbums = filterItems(
//     data?.albums || [],
//     debouncedSearchQuery,
//     sortBy,
//     albumTypeFilter
//   );
//   const filteredPlaylists = filterItems(
//     data?.playlists || [],
//     debouncedSearchQuery,
//     sortBy
//   );

//   const handleManualRefresh = async () => {
//     try {
//       const accessToken = localStorage.getItem(
//         activeService === 'spotify'
//           ? 'spotify_access_token'
//           : 'apple_music_token'
//       );
//       const refreshToken = localStorage.getItem('spotify_refresh_token');

//       if (!isServiceConnected) {
//         toast.error(
//           `Please connect your ${
//             activeService === 'spotify' ? 'Spotify' : 'Apple Music'
//           } account first`
//         );
//         navigate('/');
//         return;
//       }

//       if (activeService === 'spotify' && (!accessToken || !refreshToken)) {
//         toast.error('Please reconnect your Spotify account');
//         navigate('/');
//         return;
//       }

//       if (activeService === 'apple-music' && !accessToken) {
//         toast.error('Please reconnect your Apple Music account');
//         navigate('/');
//         return;
//       }

//       await syncLibrary(user!.id, activeService);
//       queryClient.invalidateQueries(['storedLibrary', activeService]);
//       toast.success('Library refreshed successfully!');
//     } catch (error) {
//       console.error('Failed to refresh library:', error);
//       if (error instanceof Error && error.message.includes('token')) {
//         toast.error(
//           `Please reconnect your ${
//             activeService === 'spotify' ? 'Spotify' : 'Apple Music'
//           } account`
//         );
//         navigate('/');
//       } else {
//         toast.error('Failed to refresh library. Please try again.');
//       }
//     }
//   };

//   const handleAlbumTypeChange = (
//     albumType: 'all' | 'album' | 'single' | 'ep'
//   ) => {
//     setAlbumTypeFilter(albumType);
//     toast.info(`Showing ${albumType} albums`);
//   };

//   const handleTransfer = (playlist: Playlist) => {
//     setSelectedPlaylist(playlist);
//     setIsTransferModalOpen(true);
//   };

//   const handleToggleSelection = () => {
//     setIsSelectionMode(!isSelectionMode);
//     if (isSelectionMode) {
//       if (activeTab === 'playlists' && playlistsTabRef.current) {
//         playlistsTabRef.current.deselectAll();
//       } else if (activeTab === 'albums' && albumsTabRef.current) {
//         albumsTabRef.current.deselectAll();
//       }
//     }
//   };

//   if (!isServiceConnected) {
//     return <LibrarySkeleton />;
//   }

//   return (
//     <div className="h-screen flex flex-col overflow-hidden">
//       <div className="flex-none pt-20">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="mb-6"
//         >
//           <Header
//             activeService={activeService}
//             onRefresh={handleManualRefresh}
//           />
//         </motion.div>

//         {/* Controls Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//         >
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <Controls
//               activeService={activeService}
//               setActiveService={setActiveService}
//               searchQuery={searchQuery}
//               setSearchQuery={setSearchQuery}
//               sortBy={sortBy}
//               setSortBy={setSortBy}
//               viewMode={viewMode}
//               setViewMode={setViewMode}
//               onExport={() => setIsExportOpen(true)}
//               activeTab={activeTab}
//               albumTypeFilter={albumTypeFilter}
//               onAlbumTypeChange={handleAlbumTypeChange}
//               isSelectionMode={isSelectionMode}
//               onToggleSelection={handleToggleSelection}
//             />

//             {/* Content Area */}
//             <div className="h-[calc(100vh-240px)] overflow-y-auto">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.3 }}
//                 className="mt-6"
//               >
//                 {isError ? (
//                   <div className="text-center text-brand-pink">
//                     An error occurred while loading your library. Please try
//                     again.
//                   </div>
//                 ) : (
//                   <>
//                     {activeTab === 'albums' && (
//                       <AlbumsTab
//                         ref={albumsTabRef}
//                         isLoading={isLoading}
//                         isError={isError}
//                         albums={data?.albums || []}
//                         filteredAlbums={filteredAlbums}
//                         viewMode={viewMode}
//                         ItemComponent={MemoizedAlbumCard}
//                         isSelectionMode={isSelectionMode}
//                       />
//                     )}
//                     {activeTab === 'playlists' && (
//                       <PlaylistsTab
//                         ref={playlistsTabRef}
//                         playlists={filteredPlaylists}
//                         isLoading={isLoading}
//                         viewMode={viewMode}
//                         onTransfer={handleTransfer}
//                         isSelectionMode={isSelectionMode}
//                       />
//                     )}
//                   </>
//                 )}
//               </motion.div>
//             </div>
//           </Tabs>
//         </motion.div>

//         {/* Modals */}
//         <ExportLibraryDialog
//           open={isExportOpen}
//           onOpenChange={setIsExportOpen}
//           albums={data?.albums || []}
//           playlists={data?.playlists || []}
//           service={activeService}
//         />

//         {selectedPlaylist && (
//           <TransferPlaylistModal
//             open={isTransferModalOpen}
//             onOpenChange={(open) => {
//               setIsTransferModalOpen(open);
//               if (!open) {
//                 setSelectedPlaylist(null);
//               }
//             }}
//             sourceService={activeService}
//             playlist={selectedPlaylist}
//             userId={user!.id}
//             onTransferComplete={() => {
//               queryClient.invalidateQueries(['storedLibrary']);
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  Music,
  Grid,
  List,
  RefreshCw,
  AlignJustify as Spotify,
  Music2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/useDebounce";
import { getStoredLibrary, syncLibrary } from "@/lib/services";
import { getUserServices } from "@/lib/services/streaming-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ServiceType, ViewMode, Album } from "@/lib/types";

export const Library = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Store current params in session storage when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentParams = Object.fromEntries(searchParams.entries());
      sessionStorage.setItem("libraryParams", JSON.stringify(currentParams));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [searchParams]);

  // Restore params from session storage or location state
  useEffect(() => {
    const state = location.state as {
      previousParams?: Record<string, string>;
    } | null;
    if (state?.previousParams) {
      setSearchParams(state.previousParams);
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      const storedParams = sessionStorage.getItem("libraryParams");
      if (storedParams) {
        setSearchParams(JSON.parse(storedParams));
        sessionStorage.removeItem("libraryParams");
      }
    }
  }, [location]);

  // Get filter values from URL params with defaults
  const activeService =
    (searchParams.get("service") as ServiceType) || "spotify";
  const viewMode = (searchParams.get("view") as ViewMode) || "grid";
  const sortBy = searchParams.get("sort") || "name-asc";

  // Query for user services
  const { data: userServices } = useQuery({
    queryKey: ["userServices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await getUserServices(user.id);
    },
    enabled: !!user,
  });

  const isServiceConnected = userServices?.includes(activeService);

  // Query for library data
  const { data, isError } = useQuery({
    queryKey: ["storedLibrary", activeService],
    queryFn: async () => {
      try {
        const data = await getStoredLibrary(user!.id, activeService);
        return data;
      } catch (error) {
        if (error.status === 404) {
          return { albums: [], playlists: [], lastSynced: null };
        }
        throw error;
      }
    },
    enabled: !!activeService && !!user && !!isServiceConnected,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    select: (data) => ({
      ...data,
      albums: Array.isArray(data.albums)
        ? data.albums.map((album) => ({
            ...album,
            name: album.name || "",
            artistName: album.artist_name || "",
            albumType: album.album_type?.toLowerCase() || "album",
            artwork: {
              url: album.image_url,
              width: null,
              height: null,
            },
            trackCount: album.tracks_count || 0,
          }))
        : [],
    }),
  });

  const filterItems = (items: Album[], query: string, sort: string) => {
    let filtered = [...items];

    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = items.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(searchTerm);
        const artistMatch = item.artistName.toLowerCase().includes(searchTerm);
        return nameMatch || artistMatch;
      });
    }

    filtered.sort((a, b) => {
      if (sort === "recent") {
        const aDate = a.added_at ? new Date(a.added_at) : new Date(0);
        const bDate = b.added_at ? new Date(b.added_at) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      }

      const [field, direction] = sort.split("-");
      const aValue =
        field === "artist"
          ? a.artistName.toLowerCase()
          : a[field].toLowerCase();
      const bValue =
        field === "artist"
          ? b.artistName.toLowerCase()
          : b[field].toLowerCase();
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    return filtered;
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (!isServiceConnected) {
        toast.error(
          `Please connect your ${
            activeService === "spotify" ? "Spotify" : "Apple Music"
          } account first`
        );
        navigate("/");
        return;
      }

      await syncLibrary(user!.id, activeService);
      await queryClient.invalidateQueries(["storedLibrary", activeService]);
      toast.success("Library refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh library:", error);
      toast.error("Failed to refresh library. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleService = () => {
    setSearchParams((prev) => {
      prev.set(
        "service",
        activeService === "spotify" ? "apple-music" : "spotify"
      );
      return prev;
    });
  };

  const filteredAlbums = filterItems(
    data?.albums || [],
    debouncedSearchQuery,
    sortBy
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Your Library</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleService}
                className={cn(
                  "px-6 py-3 border-4 border-black rounded-lg font-bold transition-all flex items-center gap-2",
                  "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
                  activeService === "spotify" ? "bg-green-400" : "bg-pink-400"
                )}
              >
                {activeService === "spotify" ? (
                  <>
                    <Spotify className="w-5 h-5" />
                    Spotify
                  </>
                ) : (
                  <>
                    <Music2 className="w-5 h-5" />
                    Apple Music
                  </>
                )}
              </button>
              <button
                onClick={handleRefresh}
                className={cn(
                  "p-3 border-2 border-black rounded-lg transition-all",
                  "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
                  isLoading && "animate-spin"
                )}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-white border-2 border-black rounded-lg">
            <button
              className={cn(
                "p-2 rounded-xs transition-all",
                viewMode === "grid" && "bg-yellow-200"
              )}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set("view", "grid");
                  return prev;
                })
              }
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              className={cn(
                "p-2 rounded-xs transition-all",
                viewMode === "list" && "bg-yellow-200"
              )}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set("view", "list");
                  return prev;
                })
              }
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Search your library..."
            className="flex-1 p-3 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isError ? (
            <div className="text-center text-brand-pink col-span-full">
              An error occurred while loading your library. Please try again.
            </div>
          ) : !data?.albums ? (
            // Loading state
            Array.from({ length: 16 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={cn(
                  "bg-white border-4 border-black p-4 rounded-lg transition-all",
                  "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded-xs mb-2" />
                <div className="h-4 bg-gray-200 rounded-xs w-2/3" />
              </motion.div>
            ))
          ) : (
            filteredAlbums.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={cn(
                  "bg-white border-4 border-black p-4 rounded-lg transition-all",
                  "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <img
                  src={album.artwork.url}
                  alt={album.name}
                  className="aspect-square object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold truncate">{album.name}</h3>
                <p className="text-gray-600 truncate">{album.artistName}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
