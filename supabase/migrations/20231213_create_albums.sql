-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    artwork_url TEXT,
    release_date TEXT,
    service TEXT NOT NULL,
    service_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, service, service_id)
);

-- Add RLS policies
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own albums"
    ON albums FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own albums"
    ON albums FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
    ON albums FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
    ON albums FOR DELETE
    USING (auth.uid() = user_id);
