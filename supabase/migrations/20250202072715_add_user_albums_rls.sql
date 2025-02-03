-- Function to check if RLS is enabled
CREATE OR REPLACE FUNCTION rls_enabled(table_name text) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = table_name
        AND rowsecurity = true
    );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on user_albums if not already enabled
DO $$ 
BEGIN
    IF NOT rls_enabled('user_albums') THEN
        ALTER TABLE user_albums ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop user_albums policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own albums" ON user_albums';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own albums" ON user_albums';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own albums" ON user_albums';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own albums" ON user_albums';
    
    -- Drop user_playlists policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own playlists" ON user_playlists';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own playlists" ON user_playlists';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own playlists" ON user_playlists';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own playlists" ON user_playlists';
END $$;

-- Users can view their own albums
CREATE POLICY "Users can view their own albums"
    ON user_albums FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own albums
CREATE POLICY "Users can insert their own albums"
    ON user_albums FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own albums
CREATE POLICY "Users can update their own albums"
    ON user_albums FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own albums
CREATE POLICY "Users can delete their own albums"
    ON user_albums FOR DELETE
    USING (auth.uid() = user_id);

-- Add indexes for better performance (IF NOT EXISTS already handles duplicates)
CREATE INDEX IF NOT EXISTS idx_user_albums_user_service ON user_albums(user_id, service);
CREATE INDEX IF NOT EXISTS idx_user_albums_album_id ON user_albums(album_id);
CREATE INDEX IF NOT EXISTS idx_user_albums_added_at ON user_albums(added_at);

-- Enable RLS on user_playlists if not already enabled
DO $$ 
BEGIN
    IF NOT rls_enabled('user_playlists') THEN
        ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Users can view their own playlists
CREATE POLICY "Users can view their own playlists"
    ON user_playlists FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own playlists
CREATE POLICY "Users can insert their own playlists"
    ON user_playlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own playlists
CREATE POLICY "Users can update their own playlists"
    ON user_playlists FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own playlists
CREATE POLICY "Users can delete their own playlists"
    ON user_playlists FOR DELETE
    USING (auth.uid() = user_id);

-- Add indexes for playlists (IF NOT EXISTS already handles duplicates)
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_service ON user_playlists(user_id, service);
CREATE INDEX IF NOT EXISTS idx_user_playlists_playlist_id ON user_playlists(playlist_id);
