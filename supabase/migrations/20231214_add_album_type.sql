-- Add album_type column to user_albums
ALTER TABLE user_albums 
ADD COLUMN IF NOT EXISTS album_type TEXT DEFAULT 'album' CHECK (album_type IN ('album', 'single', 'ep'));
