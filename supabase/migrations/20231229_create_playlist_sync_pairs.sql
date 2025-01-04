-- Create enum for sync frequency
CREATE TYPE sync_frequency AS ENUM ('hourly', 'daily', 'weekly');

-- Create playlist sync pairs table
CREATE TABLE IF NOT EXISTS public.playlist_sync_pairs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    source_playlist jsonb NOT NULL,
    target_playlist jsonb NOT NULL,
    sync_frequency sync_frequency NOT NULL,
    sync_interval integer,
    last_synced timestamp with time zone,
    next_sync timestamp with time zone NOT NULL,
    last_error jsonb,
    sync_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.playlist_sync_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync pairs"
    ON public.playlist_sync_pairs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync pairs"
    ON public.playlist_sync_pairs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync pairs"
    ON public.playlist_sync_pairs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync pairs"
    ON public.playlist_sync_pairs
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX playlist_sync_pairs_user_id_idx ON public.playlist_sync_pairs(user_id);
CREATE INDEX playlist_sync_pairs_next_sync_idx ON public.playlist_sync_pairs(next_sync);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER handle_playlist_sync_pairs_updated_at
    BEFORE UPDATE ON public.playlist_sync_pairs
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
