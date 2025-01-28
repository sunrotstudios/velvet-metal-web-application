-- Check if service_type enum exists and create if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
        CREATE TYPE service_type AS ENUM ('spotify', 'apple-music');
    END IF;
END$$;

-- Check if library_item_type enum exists and create if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'library_item_type') THEN
        CREATE TYPE library_item_type AS ENUM ('track', 'album', 'playlist');
    END IF;
END$$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS library_sync_history;
DROP TABLE IF EXISTS user_library_items;

-- Create table for user library items
CREATE TABLE IF NOT EXISTS user_library_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    name TEXT NOT NULL,
    artist TEXT,
    type library_item_type NOT NULL,
    service service_type NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint to prevent duplicates
    UNIQUE(user_id, item_id, service)
);

-- Create index for faster queries if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_library_items_user_id') THEN
        CREATE INDEX idx_user_library_items_user_id ON user_library_items(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_library_items_type') THEN
        CREATE INDEX idx_user_library_items_type ON user_library_items(type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_library_items_service') THEN
        CREATE INDEX idx_user_library_items_service ON user_library_items(service);
    END IF;
END$$;

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_library_items_updated_at ON user_library_items;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_library_items_updated_at
    BEFORE UPDATE ON user_library_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create table for sync history
CREATE TABLE IF NOT EXISTS library_sync_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service service_type NOT NULL,
    items_synced INTEGER NOT NULL DEFAULT 0,
    new_items_found INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sync history if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_library_sync_history_user_id') THEN
        CREATE INDEX idx_library_sync_history_user_id ON library_sync_history(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_library_sync_history_service') THEN
        CREATE INDEX idx_library_sync_history_service ON library_sync_history(service);
    END IF;
END$$;
