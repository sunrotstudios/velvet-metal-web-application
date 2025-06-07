"use client";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { syncLibrary } from "@/lib/supabase/user";
import { useQueryClient } from "@tanstack/react-query";
import { ViewMode, LibraryContentType, Album } from "@/lib/types";
import { ServiceType } from "@/lib/types";
import { usePaginatedLibrary } from "@/lib/queries/useLibrary";
import { useServiceConnection } from "@/lib/queries/useServices";
import { QueryKeys } from "@/lib/queries/constants";
import { useConnectedServices } from "@/lib/hooks/useConnectedServices";
import { transferAlbum, transferPlaylist } from "@/lib/services/transfer";
import { getServiceAuth } from "@/lib/services/streaming-auth";

export default function Library() {
  const router = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  // Restore params from session storage
  useEffect(() => {
    const storedParams = sessionStorage.getItem("libraryParams");
    if (storedParams) {
      const params = new URLSearchParams(JSON.parse(storedParams));
      router(`${pathname}?${params.toString()}`, { replace: true });
      sessionStorage.removeItem("libraryParams");
    }
  }, [pathname, router]);

  // Get filter values from URL params with defaults
  const activeService =
    (searchParams.get("service") as ServiceType) || "spotify";
  const contentType =
    (searchParams.get("content") as LibraryContentType) || "albums";
  const viewMode = (searchParams.get("view") as ViewMode) || "grid";
  const sortBy = searchParams.get("sort") || "name-asc";

  // Parse sort field and direction
  const [sortField, sortDirection] = sortBy.split("-");

  // Check if service is connected
  const { data: isServiceConnected } = useServiceConnection(
    user?.id,
    activeService
  );

  // Use paginated library data with server-side sorting and filtering
  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingLibrary,
    isError,
    refetch,
  } = usePaginatedLibrary(user?.id, activeService, contentType, {
    sortField:
      sortField === "recent"
        ? "added_at"
        : sortField === "artist"
        ? "artist_name"
        : "name",
    sortDirection: sortDirection === "asc" ? "asc" : "desc",
    search: debouncedSearchQuery,
    limit: 250, // Load more items per page to reduce pop-in effect
  });

  // Eagerly load the next batch when first batch loads
  useEffect(() => {
    if (
      paginatedData?.pages?.length === 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    paginatedData?.pages?.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      if (!isServiceConnected) {
        toast.error(
          `Please connect your ${
            activeService === "spotify" ? "Spotify" : "Apple Music"
          } account first`
        );
        router("/settings");
        return;
      }

      await syncLibrary(user!.id, activeService);

      // Invalidate both the old style query and the new paginated queries
      await queryClient.invalidateQueries({
        queryKey: ["storedLibrary", activeService],
      });

      await queryClient.invalidateQueries({
        queryKey: QueryKeys.library.paginated(
          activeService,
          contentType,
          sortField === "recent"
            ? "added_at"
            : sortField === "artist"
            ? "artist_name"
            : "name",
          sortDirection === "asc" ? "asc" : "desc",
          debouncedSearchQuery
        ),
      });

      // Immediately refetch to update the UI
      refetch();

      toast.success("Library refreshed successfully!");
    } catch (error) {
      console.error("Failed to refresh library:", error);
      toast.error("Failed to refresh library. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    router(`${pathname}?${params.toString()}`, { replace: true });
  };

  const toggleService = () => {
    updateSearchParams({
      service: activeService === "spotify" ? "apple-music" : "spotify",
    });
  };

  const toggleContentType = () => {
    updateSearchParams({
      content: contentType === "albums" ? "playlists" : "albums",
    });
  };

  // Flatten the paginated data for rendering
  const allAlbums = paginatedData?.pages.flatMap((page) => page.albums) || [];
  const allPlaylists =
    paginatedData?.pages.flatMap((page) => page.playlists || []) || [];

  // Set up intersection observer for infinite scrolling with earlier trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "500px 0px", // Load more content before it's visible in the viewport
        threshold: 0.1, // Trigger earlier with lower threshold
      }
    );

    const sentinel = document.getElementById("load-more-sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Select mode and selection state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferProgress, setTransferProgress] = useState({
    stage: "",
    progress: 0,
    message: "",
  });
  const [destinationService, setDestinationService] =
    useState<ServiceType | null>(null);

  // Get connected services to determine available transfer destinations
  const { data: connectedServices, isLoading: isLoadingServices } =
    useConnectedServices();

  // Count of selected items
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  // Selected items objects
  const selectedItemsObjects =
    contentType === "albums"
      ? allAlbums.filter((album) => selectedItems[album.id])
      : allPlaylists.filter((playlist) => selectedItems[playlist.id]);

  // Toggle selection for an item
  const toggleSelection = (id: string) => {
    if (!selectMode) return;

    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) {
        // Clear selection when exiting select mode
        setSelectedItems({});
      }
      return !prev;
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedItems({});
  };

  // Select all visible items
  const selectAll = () => {
    const newSelectedItems: Record<string, boolean> = {};
    if (contentType === "albums") {
      allAlbums.forEach((album) => {
        newSelectedItems[album.id] = true;
      });
    } else {
      allPlaylists.forEach((playlist) => {
        newSelectedItems[playlist.id] = true;
      });
    }
    setSelectedItems(newSelectedItems);
  };

  // Get available destination services (connected services except the current one)
  const availableDestinations =
    connectedServices?.filter((service) => service !== activeService) || [];

  // Handle transfer initiation
  const handleTransferClick = () => {
    setShowTransferModal(true);
  };

  // Exit select mode
  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedItems({});
  };

  // Remove item from selection
  const removeFromSelection = (id: string) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // Execute transfer of selected items
  const executeTransfer = async (targetService: ServiceType) => {
    if (!user?.id) return;

    setTransferInProgress(true);
    setDestinationService(targetService);

    try {
      // Get selected items
      const itemsToTransfer =
        contentType === "albums"
          ? allAlbums.filter((album) => selectedItems[album.id])
          : allPlaylists.filter((playlist) => selectedItems[playlist.id]);

      // Get auth data for source and destination services
      const sourceAuth = await getServiceAuth(user.id, activeService);
      const targetAuth = await getServiceAuth(user.id, targetService);

      if (!sourceAuth || !targetAuth) {
        toast.error("Authentication missing for one or both services");
        setTransferInProgress(false);
        return;
      }

      // Process items one by one
      for (let i = 0; i < itemsToTransfer.length; i++) {
        const item = itemsToTransfer[i];
        const currentProgress = Math.round((i / itemsToTransfer.length) * 100);

        // Update progress
        setTransferProgress({
          stage: "processing",
          progress: currentProgress,
          message: `Transferring ${i + 1} of ${itemsToTransfer.length}: ${
            item.name
          }`,
        });

        try {
          // Transfer the item based on content type
          if (contentType === "albums") {
            await transferAlbum({
              sourceService: activeService,
              destinationService: targetService,
              album: item,
              sourceToken: sourceAuth.accessToken,
              targetToken: targetAuth.accessToken,
              userId: user.id,
              onProgress: (progress) => {
                setTransferProgress(progress);
              },
            });
          } else {
            await transferPlaylist({
              sourceService: activeService as "spotify" | "apple-music",
              targetService: targetService as "spotify" | "apple-music",
              playlist: item,
              sourceToken: sourceAuth.accessToken,
              targetToken: targetAuth.accessToken,
              userId: user.id,
              onProgress: (progress) => {
                setTransferProgress(progress);
              },
            });
          }
        } catch (error) {
          console.error(`Error transferring ${item.name}:`, error);
          toast.error(`Failed to transfer ${item.name}`);
        }
      }

      // Transfer complete
      setTransferProgress({
        stage: "complete",
        progress: 100,
        message: `Successfully transferred ${itemsToTransfer.length} items`,
      });

      toast.success(
        `Successfully transferred ${itemsToTransfer.length} ${contentType}`
      );
      exitSelectMode();
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Failed to transfer some items. Please try again.");
    } finally {
      // Ensure we still clean up even if there's an error
      setTimeout(() => {
        setTransferInProgress(false);
        setShowTransferModal(false);
      }, 2000);
    }
  };

  return (
    <div className="h-screen flex flex-col relative">
      {/* Selection sidebar (fixed at the bottom or side) */}
      {selectMode && selectedCount > 0 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.1)] z-20 p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">
                {selectedCount} {contentType} selected
              </h3>
              <button
                onClick={clearSelections}
                className={cn(
                  "px-3 py-1 border-2 border-black rounded-lg bg-gray-200 font-medium text-sm",
                  "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]",
                  "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]"
                )}
              >
                Clear all
              </button>
            </div>

            {/* Selected items horizontal scroll */}
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 mb-3">
              {selectedItemsObjects.slice(0, 19).map((item) => (
                <div key={item.id} className="flex-none w-16 relative">
                  <div className="relative w-16 h-16 rounded border-2 border-black overflow-hidden">
                    <img
                      src={item.image_url || ""}
                      alt={
                        contentType === "albums"
                          ? `${item.name} by ${
                              (item as Album).artist_name || "Unknown Artist"
                            }`
                          : item.name
                      }
                      className="object-cover"
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-400 w-5 h-5 flex items-center justify-center border-l-2 border-b-2 border-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromSelection(item.id);
                      }}
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text-xs text-center mt-1 truncate w-16">
                    {item.name}
                  </p>
                </div>
              ))}
              {selectedCount > 19 && (
                <div className="flex-none w-16 h-16 flex items-center justify-center bg-gray-100 border-2 border-black rounded font-medium text-sm">
                  +{selectedCount - 19}
                </div>
              )}
            </div>

            {/* Transfer button */}
            <button
              onClick={handleTransferClick}
              disabled={availableDestinations.length === 0}
              className={cn(
                "py-3 border-4 border-black rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
                "bg-cyan-300 w-full",
                availableDestinations.length === 0 &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              {availableDestinations.length === 0 ? (
                "No available services to transfer to"
              ) : (
                <>
                  Transfer to{" "}
                  {availableDestinations[0] === "spotify"
                    ? "Spotify"
                    : "Apple Music"}
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex-none p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Your Library</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleService}
                  disabled={selectMode}
                  className={cn(
                    "px-6 py-3 border-4 border-black rounded-lg font-bold transition-all flex items-center gap-2",
                    "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                    "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
                    activeService === "spotify"
                      ? "bg-green-400"
                      : "bg-pink-400",
                    selectMode && "opacity-50 cursor-not-allowed"
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
                  onClick={toggleContentType}
                  disabled={selectMode}
                  className={cn(
                    "px-6 py-3 border-4 border-black rounded-lg font-bold transition-all flex items-center gap-2",
                    "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                    "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
                    contentType === "albums" ? "bg-purple-300" : "bg-blue-300",
                    selectMode && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {contentType === "albums" ? (
                    <>
                      <Music className="w-5 h-5" />
                      Albums
                    </>
                  ) : (
                    <>
                      <List className="w-5 h-5" />
                      Playlists
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleRefresh}
                disabled={selectMode}
                className={cn(
                  "p-3 border-2 border-black rounded-lg transition-all",
                  "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
                  isLoading && "animate-spin",
                  selectMode && "opacity-50 cursor-not-allowed"
                )}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-white border-2 border-black rounded-lg">
            <button
              className={cn(
                "p-2 rounded-xs transition-all",
                viewMode === "grid" && "bg-yellow-200"
              )}
              onClick={() => updateSearchParams({ view: "grid" })}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              className={cn(
                "p-2 rounded-xs transition-all",
                viewMode === "list" && "bg-yellow-200"
              )}
              onClick={() => updateSearchParams({ view: "list" })}
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
            disabled={selectMode}
          />

          {/* Toggle select mode button */}
          <button
            onClick={toggleSelectMode}
            className={cn(
              "p-3 border-2 border-black rounded-lg font-medium flex items-center justify-center gap-2 flex-1 md:flex-none md:w-32",
              "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
              "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
              "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              selectMode ? "bg-red-200" : "bg-cyan-300"
            )}
          >
            {selectMode ? <>Cancel</> : <>Transfer</>}
          </button>

          {/* Select mode control buttons */}
          {selectMode && (
            <button
              onClick={selectAll}
              className={cn(
                "p-3 border-2 border-black rounded-lg font-medium flex items-center justify-center gap-2 flex-1 md:flex-none md:w-32",
                "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                "active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px]",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                "bg-gray-200"
              )}
            >
              Select All
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto px-8",
          selectMode && selectedCount > 0 ? "pb-40" : "pb-8" // Add extra padding when selection bar is visible
        )}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isError ? (
            <div className="text-center text-brand-pink col-span-full">
              An error occurred while loading your library. Please try again.
            </div>
          ) : isLoadingLibrary && !allAlbums.length ? (
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
            <>
              {contentType === "albums"
                ? // Render albums
                  allAlbums.map((album, i) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(i * 0.02, 0.5),
                      }}
                      className={cn(
                        "bg-white border-4 border-black p-4 rounded-lg transition-all relative",
                        "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                        selectMode &&
                          selectedItems[album.id] &&
                          "ring-4 ring-cyan-400 ring-inset"
                      )}
                      onClick={() =>
                        selectMode ? toggleSelection(album.id) : undefined
                      }
                    >
                      {/* Selection overlay in select mode */}
                      {selectMode && (
                        <div className="absolute top-2 right-2 z-10 p-1">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 border-black flex items-center justify-center",
                              selectedItems[album.id]
                                ? "bg-cyan-400"
                                : "bg-white"
                            )}
                          >
                            {selectedItems[album.id] && (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 text-black"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="relative aspect-square w-full mb-4">
                        <img
                          src={album.artwork?.url || album.image_url}
                          alt={`${album.name} by ${
                            album.artist_name || "Unknown Artist"
                          }`}
                          className="object-cover rounded-lg w-full h-full absolute inset-0"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="font-bold truncate">{album.name}</h3>
                      <p className="text-gray-600 truncate">
                        {album.artist_name}
                      </p>
                    </motion.div>
                  ))
                : // Render playlists
                  allPlaylists.map((playlist, i) => (
                    <motion.div
                      key={playlist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(i * 0.02, 0.5),
                      }}
                      className={cn(
                        "bg-white border-4 border-black p-4 rounded-lg transition-all relative",
                        "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                        selectMode &&
                          selectedItems[playlist.id] &&
                          "ring-4 ring-cyan-400 ring-inset"
                      )}
                      onClick={() =>
                        selectMode ? toggleSelection(playlist.id) : undefined
                      }
                    >
                      {/* Selection overlay in select mode */}
                      {selectMode && (
                        <div className="absolute top-2 right-2 z-10 p-1">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 border-black flex items-center justify-center",
                              selectedItems[playlist.id]
                                ? "bg-cyan-400"
                                : "bg-white"
                            )}
                          >
                            {selectedItems[playlist.id] && (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 text-black"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        {playlist.image_url ? (
                          <div className="relative aspect-square w-full mb-4">
                            <img
                              src={playlist.image_url || ""}
                              alt={playlist.name}
                              className="object-cover rounded-lg"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg mb-4 flex items-center justify-center bg-blue-100 border-2 border-blue-300">
                            <List className="w-12 h-12 text-blue-500" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold truncate">{playlist.name}</h3>
                      <p className="text-gray-600 truncate">
                        {playlist.tracks || 0} tracks
                      </p>
                    </motion.div>
                  ))}

              {/* Sentinel element for infinite scroll */}
              {!isLoadingLibrary && (
                <div
                  id="load-more-sentinel"
                  className="col-span-full flex justify-center p-4"
                >
                  {isFetchingNextPage && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-4 border-black p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Transfer to Service</h2>

            {transferInProgress ? (
              <div className="space-y-4">
                <h3 className="font-semibold">{transferProgress.message}</h3>
                <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${transferProgress.progress}%` }}
                  ></div>
                </div>
                {transferProgress.stage === "complete" ? (
                  <button
                    onClick={() => {
                      setShowTransferModal(false);
                      setTransferInProgress(false);
                    }}
                    className="w-full py-3 bg-green-400 border-2 border-black rounded-lg font-bold"
                  >
                    Done
                  </button>
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    Please wait while your items are being transferred...
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="mb-4">
                  Select a destination service to transfer {selectedCount}{" "}
                  {contentType} from{" "}
                  {activeService === "spotify" ? "Spotify" : "Apple Music"}:
                </p>

                {availableDestinations.length === 0 ? (
                  <div className="text-center text-red-500 mb-4">
                    No other services connected. Please connect another service
                    in Settings.
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {availableDestinations.map((service) => (
                      <button
                        key={service}
                        onClick={() => executeTransfer(service)}
                        className={cn(
                          "w-full py-3 border-2 border-black rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                          "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
                          service === "spotify" ? "bg-green-400" : "bg-pink-400"
                        )}
                      >
                        {service === "spotify" ? (
                          <>
                            <Spotify className="w-5 h-5" />
                            Transfer to Spotify
                          </>
                        ) : service === "apple-music" ? (
                          <>
                            <Music2 className="w-5 h-5" />
                            Transfer to Apple Music
                          </>
                        ) : (
                          <>
                            <Music className="w-5 h-5" />
                            Transfer to {service}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
