-- Add image_url column to user_playlists if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_playlists' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE user_playlists ADD COLUMN image_url text;
    END IF;
END $$;
