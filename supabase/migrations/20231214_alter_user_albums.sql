-- Add missing columns to user_albums
ALTER TABLE user_albums 
ADD COLUMN IF NOT EXISTS artist TEXT,
ADD COLUMN IF NOT EXISTS artwork_url TEXT,
ADD COLUMN IF NOT EXISTS release_date TEXT;
