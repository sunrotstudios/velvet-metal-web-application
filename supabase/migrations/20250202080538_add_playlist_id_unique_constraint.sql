-- Add unique constraint on playlist_id in user_playlists
ALTER TABLE user_playlists ADD CONSTRAINT user_playlists_playlist_id_key UNIQUE (playlist_id);
