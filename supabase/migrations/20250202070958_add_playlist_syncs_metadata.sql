-- Create an enum for sync status
CREATE TYPE sync_status AS ENUM ('idle', 'syncing', 'error');

-- Create library_syncs table
CREATE TABLE IF NOT EXISTS library_syncs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_sync_time TIMESTAMP WITH TIME ZONE,
    next_sync_time TIMESTAMP WITH TIME ZONE,
    sync_status sync_status DEFAULT 'idle',
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, service)
);

-- Add stats columns for sync tracking
ALTER TABLE library_syncs ADD COLUMN stats JSONB DEFAULT '{
    "albums": {
        "total": 0,
        "lastSyncCount": 0,
        "added": 0,
        "removed": 0,
        "updated": 0
    },
    "playlists": {
        "total": 0,
        "lastSyncCount": 0,
        "added": 0,
        "removed": 0,
        "updated": 0
    }
}'::jsonb;

-- Add RLS policies
ALTER TABLE library_syncs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own library syncs"
    ON library_syncs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own library syncs"
    ON library_syncs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own library syncs"
    ON library_syncs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_library_syncs_updated_at
    BEFORE UPDATE ON library_syncs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX idx_library_syncs_user_service ON library_syncs(user_id, service);
CREATE INDEX idx_library_syncs_status ON library_syncs(sync_status);
CREATE INDEX idx_library_syncs_next_sync ON library_syncs(next_sync_time);

-- Create function to check for stale syncs
CREATE OR REPLACE FUNCTION check_stale_syncs() RETURNS void AS $$
BEGIN
    UPDATE library_syncs
    SET 
        sync_status = 'idle'::sync_status,
        last_error = 'Sync process timed out'
    WHERE 
        sync_status = 'syncing'
        AND last_sync_time < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;