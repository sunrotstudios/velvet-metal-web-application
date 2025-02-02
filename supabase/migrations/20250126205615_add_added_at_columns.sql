-- Add added_at column to user_albums
ALTER TABLE user_albums
ADD COLUMN added_at timestamp with time zone;

-- Add added_at column to user_playlists
ALTER TABLE user_playlists
ADD COLUMN added_at timestamp with time zone;
