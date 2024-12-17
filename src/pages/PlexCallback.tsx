import { useEffect } from 'react';

export default function PlexCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const authToken = params.get('auth_token');

    if (authToken) {
      window.opener.postMessage(
        {
          type: 'plex-auth-result',
          token: authToken,
        },
        window.location.origin
      );
    } else {
      window.opener.postMessage(
        {
          type: 'plex-auth-result',
          error: 'No auth token received',
        },
        window.location.origin
      );
    }

    window.close();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Completing authentication...</p>
    </div>
  );
}
