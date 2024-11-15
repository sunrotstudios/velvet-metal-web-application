import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getSpotifyPlaylists,
  getSpotifyAlbums,
  getMoreSpotifyAlbums,
} from '@/lib/api/spotify';
import {
  getAppleMusicLibrary,
  getAppleMusicAlbums,
} from '@/lib/api/apple-music';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2, Music, Music2, Grid, List } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';
import { TransferPlaylistModal } from '@/components/TransferPlaylistModal';

type ServiceType = 'spotify' | 'apple-music';
type ViewMode = 'grid' | 'list';

const AlbumCard = ({ album, viewMode }: { album: any; viewMode: ViewMode }) => {
  const getArtworkUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('api.spotify.com')) return url;
    return url.replace('{w}', '500').replace('{h}', '500');
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:bg-accent">
      <div
        className={cn(
          'flex',
          viewMode === 'grid' ? 'flex-col' : 'flex-row items-center gap-4'
        )}
      >
        <div
          className={cn(
            'overflow-hidden',
            viewMode === 'grid' ? 'aspect-square w-full' : 'h-20 w-20'
          )}
        >
          <img
            src={getArtworkUrl(
              album.album?.images?.[0]?.url || album.attributes?.artwork?.url
            )}
            alt={`${album.album?.name || album.attributes?.name} cover`}
            className="h-full w-full object-cover transition-all group-hover:scale-105"
          />
        </div>
        <div className="p-4 flex-1">
          <h3 className="line-clamp-1 font-semibold">
            {album.album?.name || album.attributes?.name}
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {album.album?.artists?.[0]?.name || album.attributes?.artistName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {
              (
                album.album?.release_date || album.attributes?.releaseDate
              )?.split('-')[0]
            }{' '}
            • {album.album?.total_tracks || album.attributes?.trackCount} tracks
          </p>
        </div>
      </div>
    </Card>
  );
};

const PlaylistCard = ({
  playlist,
  viewMode,
  onTransfer,
}: {
  playlist: any;
  viewMode: ViewMode;
  onTransfer: (playlist: any) => void;
}) => {
  const getTrackCount = () => {
    if (playlist.tracks?.total) return playlist.tracks.total;
    if (playlist.attributes?.trackCount) return playlist.attributes.trackCount;
    return 0;
  };

  const getArtworkUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('api.spotify.com')) return url;
    return url.replace('{w}', '500').replace('{h}', '500');
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:bg-accent">
      <div
        className={cn(
          'flex',
          viewMode === 'grid' ? 'flex-col' : 'flex-row items-center gap-4'
        )}
      >
        <div
          className={cn(
            'overflow-hidden',
            viewMode === 'grid' ? 'aspect-square w-full' : 'h-20 w-20'
          )}
        >
          <img
            src={getArtworkUrl(
              playlist.images?.[0]?.url || playlist.attributes?.artwork?.url
            )}
            alt={`${playlist.name || playlist.attributes?.name} cover`}
            className="h-full w-full object-cover transition-all group-hover:scale-105"
          />
        </div>
        <div className="p-4 flex-1">
          <h3 className="line-clamp-1 font-semibold">
            {playlist.name || playlist.attributes?.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {getTrackCount()} tracks
          </p>
        </div>
      </div>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onTransfer(playlist);
          }}
        >
          Transfer
        </Button>
      </div>
    </Card>
  );
};

export default function Library() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const isIntersecting = useIntersectionObserver(loadMoreRef, {
    threshold: 0.1,
    rootMargin: '200px',
  });

  const navigate = useNavigate();
  const [activeService, setActiveService] = useState<ServiceType>('spotify');
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const spotifyToken = localStorage.getItem('spotify_access_token');
  const appleMusicToken = localStorage.getItem('apple_music_token');

  const {
    data: spotifyPlaylists,
    isLoading: isLoadingPlaylists,
    isError: isSpotifyPlaylistsError,
  } = useQuery({
    queryKey: ['spotifyPlaylists'],
    queryFn: () => getSpotifyPlaylists(spotifyToken!),
    enabled: !!spotifyToken && activeService === 'spotify',
  });

  const {
    data: spotifyAlbums,
    isLoading: isLoadingAlbums,
    isError: isSpotifyAlbumsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['spotifyAlbums'],
    queryFn: ({ pageParam = null }) =>
      pageParam
        ? getMoreSpotifyAlbums(pageParam, spotifyToken!)
        : getSpotifyAlbums(spotifyToken!),
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    enabled: !!spotifyToken && activeService === 'spotify',
  });

  const {
    data: appleMusicPlaylists,
    isLoading: isLoadingAppleMusicPlaylists,
    isError: isAppleMusicPlaylistsError,
  } = useQuery({
    queryKey: ['appleMusicPlaylists'],
    queryFn: () => getAppleMusicLibrary(appleMusicToken!),
    enabled: !!appleMusicToken && activeService === 'apple-music',
  });

  const {
    data: appleMusicAlbums,
    isLoading: isLoadingAppleMusicAlbums,
    isError: isAppleMusicAlbumsError,
  } = useQuery({
    queryKey: ['appleMusicAlbums'],
    queryFn: () => getAppleMusicAlbums(appleMusicToken!),
    enabled: !!appleMusicToken && activeService === 'apple-music',
  });

  const handleTransfer = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setIsTransferModalOpen(true);
  };

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!spotifyToken && !appleMusicToken) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Your Library</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Connected Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Connect to Spotify or Apple Music to see your library.
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Home to Connect Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading =
    (activeService === 'spotify' && (isLoadingPlaylists || isLoadingAlbums)) ||
    (activeService === 'apple-music' &&
      (isLoadingAppleMusicPlaylists || isLoadingAppleMusicAlbums));

  const isError =
    (activeService === 'spotify' &&
      (isSpotifyPlaylistsError || isSpotifyAlbumsError)) ||
    (activeService === 'apple-music' &&
      (isAppleMusicPlaylistsError || isAppleMusicAlbumsError));

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Your Library</h2>
            <p className="text-muted-foreground">
              Your music collection from{' '}
              {activeService === 'spotify' ? 'Spotify' : 'Apple Music'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-md border p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              {spotifyToken && (
                <Button
                  variant={activeService === 'spotify' ? 'default' : 'outline'}
                  onClick={() => setActiveService('spotify')}
                  className="flex items-center gap-2"
                >
                  <Music className="h-4 w-4" />
                  Spotify
                </Button>
              )}
              {appleMusicToken && (
                <Button
                  variant={
                    activeService === 'apple-music' ? 'default' : 'outline'
                  }
                  onClick={() => setActiveService('apple-music')}
                  className="flex items-center gap-2"
                >
                  <Music2 className="h-4 w-4" />
                  Apple Music
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="albums" className="space-y-4">
          <TabsList>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value="albums" className="space-y-4">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading your albums...
                  </p>
                </div>
              </div>
            ) : isError ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-destructive">Failed to load albums</p>
                </CardContent>
              </Card>
            ) : activeService === 'spotify' ? (
              <div className="space-y-4">
                <div
                  className={cn(
                    'grid gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                      : 'grid-cols-1'
                  )}
                >
                  {spotifyAlbums?.pages.map((page) =>
                    page.items.map((item: any) => (
                      <AlbumCard
                        key={item.album.id}
                        album={item}
                        viewMode={viewMode}
                      />
                    ))
                  )}
                </div>
                {(hasNextPage || isFetchingNextPage) && (
                  <div ref={loadMoreRef} className="flex justify-center p-4">
                    {isFetchingNextPage && (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid-cols-1'
                )}
              >
                {appleMusicAlbums?.data?.map((album: any) => (
                  <AlbumCard key={album.id} album={album} viewMode={viewMode} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="space-y-4">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading your playlists...
                  </p>
                </div>
              </div>
            ) : isError ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-destructive">Failed to load playlists</p>
                </CardContent>
              </Card>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid-cols-1'
                )}
              >
                {activeService === 'spotify'
                  ? spotifyPlaylists?.items?.map((playlist: any) => (
                      <PlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        viewMode={viewMode}
                        onTransfer={handleTransfer}
                      />
                    ))
                  : appleMusicPlaylists?.data?.map((playlist: any) => (
                      <PlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        viewMode={viewMode}
                        onTransfer={handleTransfer}
                      />
                    ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedPlaylist && (
        <TransferPlaylistModal
          open={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
          sourceService={activeService}
          playlist={selectedPlaylist}
          onTransferComplete={() => {
            setSelectedPlaylist(null);
          }}
        />
      )}
    </>
  );
}
