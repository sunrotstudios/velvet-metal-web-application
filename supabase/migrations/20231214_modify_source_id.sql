-- Change source_id to TEXT type
ALTER TABLE user_albums 
ALTER COLUMN source_id TYPE TEXT;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_albums_user_service_source_unique'
    ) THEN
        ALTER TABLE user_albums 
        ADD CONSTRAINT user_albums_user_service_source_unique 
        UNIQUE (user_id, service, source_id);
    END IF;
END $$;
