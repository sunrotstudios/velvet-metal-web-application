import { useEffect, useState } from 'react';

export function useSpotifyPlayback() {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const accessToken = localStorage.getItem('spotify_access_token');
      if (!accessToken) return;

      const player = new window.Spotify.Player({
        name: 'Velvet Metal Web Player',
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      player.connect();
      setPlayer(player);
    };

    return () => {
      player?.disconnect();
      document.body.removeChild(script);
    };
  }, []);

  return { player, deviceId, isReady };
}
