import { Button } from '@/components/ui/button';
import { getSpotifyPlaylistDetails } from '@/lib/api/spotify';
import { DetailedPlaylist, PlaylistTrack } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Play, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PlaylistDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('spotify_access_token');

  useEffect(() => {
    if (!accessToken) {
      navigate('/login', { state: { from: `/playlist/${id}` } });
    }
  }, [accessToken, id, navigate]);

  const {
    data: playlist,
    isLoading,
    error,
  } = useQuery<DetailedPlaylist>({
    queryKey: ['playlistDetails', id],
    queryFn: () => {
      if (!id) throw new Error('No playlist ID provided');
      if (!accessToken) throw new Error('No access token available');
      return getSpotifyPlaylistDetails(id, accessToken);
    },
    enabled: !!id && !!accessToken,
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-500">
            Error loading playlist
          </h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !playlist) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading playlist...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-8 flex items-end gap-6">
        {playlist.images?.[0]?.url && (
          <img
            src={playlist.images[0].url}
            alt={playlist.name}
            className="h-48 w-48 rounded-lg shadow-lg"
          />
        )}
        <div>
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Playlist
          </p>
          <h1 className="text-4xl font-bold">{playlist.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {playlist.tracks?.total || 0} tracks
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 border-b p-4 font-medium">
          <div className="w-8">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {playlist.tracks?.items?.map((item: PlaylistTrack, index: number) => (
          <div
            key={`${item.track.id}-${index}`}
            className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-4 border-b p-4 hover:bg-accent"
          >
            <div className="w-8 text-muted-foreground">{index + 1}</div>
            <div>
              <p className="font-medium">{item.track.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.track.artists?.map(a => a.name).join(', ')}
              </p>
            </div>
            <div className="text-muted-foreground">{item.track.album?.name}</div>
            <div className="text-muted-foreground">
              {formatDuration(item.track.duration_ms)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
