import { Button } from '@/components/ui/button';
import { getSpotifyAlbumDetails } from '@/lib/api/spotify';
import { AlbumTrack, DetailedAlbum } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Play, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { getServiceAuth } from '@/lib/services/streaming-auth';

export default function AlbumDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login', { state: { from: `/album/${id}` } });
    }
  }, [user, id, navigate]);

  const {
    data: album,
    isLoading,
    error,
  } = useQuery<DetailedAlbum>({
    queryKey: ['albumDetails', id, user?.id],
    queryFn: async () => {
      if (!id) throw new Error('No album ID provided');
      if (!user) throw new Error('No user found');
      
      const auth = await getServiceAuth(user.id, 'spotify');
      if (!auth) throw new Error('Spotify not connected');
      
      console.log('Fetching album details for:', id);
      return getSpotifyAlbumDetails(user.id, id, auth.accessToken);
    },
    enabled: !!id && !!user,
  });

  console.log('Query state:', { album, isLoading, error });

  if (error) {
    console.error('Error fetching album:', error);
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-500">
            Error loading album
          </h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading album...</h2>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Album not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 p-8">
      <Button
        variant="ghost"
        className="w-fit gap-2"
        onClick={() => navigate('/library')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </Button>
      {/* Album Header */}
      <div className="flex items-start gap-8">
        {album.artwork?.url && (
          <div className="relative aspect-square w-48 overflow-hidden rounded-lg">
            <img
              src={album.artwork.url}
              alt={album.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col justify-end space-y-4">
          <div>
            <h1 className="text-4xl font-bold">{album.name}</h1>

            <p className="text-xl text-muted-foreground">{album.artistName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{new Date(album.releaseDate).getFullYear()}</span>
            <span>•</span>
            <span>{album.totalTracks} songs</span>
          </div>
          <div className="flex items-center gap-3">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Play
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Plus className="h-5 w-5" />
              Add to Playlist
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 text-sm text-muted-foreground">
          <span className="w-8">#</span>
          <span>Title</span>
          <Clock className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          {album.tracks.map((track: AlbumTrack) => (
            <div
              key={track.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md px-4 py-2 hover:bg-accent cursor-pointer"
              onClick={() => play(track, album)}
            >
              <span className="w-8 text-sm text-muted-foreground">
                {track.trackNumber}
              </span>
              <div>
                <p className="font-medium">{track.name}</p>
                <p className="text-sm text-muted-foreground">
                  {track.artistName}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDuration(track.durationMs)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
