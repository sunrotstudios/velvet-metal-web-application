-- Create enum for service types if not exists
DO $$ BEGIN
    CREATE TYPE service_type AS ENUM ('spotify', 'apple-music');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_playlists table
CREATE TABLE IF NOT EXISTS user_playlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service service_type NOT NULL,
    playlist_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    tracks_count INTEGER,
    owner_id TEXT,
    owner_name TEXT,
    is_public BOOLEAN DEFAULT true,
    external_url TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service, playlist_id)
);

-- Create user_albums table
CREATE TABLE IF NOT EXISTS user_albums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service service_type NOT NULL,
    album_id TEXT NOT NULL,
    name TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    release_date TEXT,
    image_url TEXT,
    tracks_count INTEGER,
    external_url TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service, album_id)
);

-- Create trigger to update updated_at timestamp for user_playlists
CREATE OR REPLACE FUNCTION update_user_playlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_playlists_updated_at
    BEFORE UPDATE ON user_playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_user_playlists_updated_at();

-- Create trigger to update updated_at timestamp for user_albums
CREATE OR REPLACE FUNCTION update_user_albums_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_albums_updated_at
    BEFORE UPDATE ON user_albums
    FOR EACH ROW
    EXECUTE FUNCTION update_user_albums_updated_at();

-- Set up Row Level Security (RLS) policies
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_albums ENABLE ROW LEVEL SECURITY;

-- Create policies for user_playlists
CREATE POLICY "Users can view their own playlists"
    ON user_playlists
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists"
    ON user_playlists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
    ON user_playlists
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
    ON user_playlists
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for user_albums
CREATE POLICY "Users can view their own albums"
    ON user_albums
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own albums"
    ON user_albums
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
    ON user_albums
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
    ON user_albums
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_service ON user_playlists(service);
CREATE INDEX IF NOT EXISTS idx_user_albums_user_id ON user_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_user_albums_service ON user_albums(service);
