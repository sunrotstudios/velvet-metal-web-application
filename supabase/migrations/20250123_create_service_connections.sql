-- Create service_connections table
CREATE TABLE IF NOT EXISTS service_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL CHECK (service IN ('spotify', 'apple-music')),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service)
);

-- Create RLS policies
ALTER TABLE service_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own service connections"
    ON service_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service connections"
    ON service_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service connections"
    ON service_connections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service connections"
    ON service_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_connections_updated_at
    BEFORE UPDATE ON service_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
