-- Create enum for service types
CREATE TYPE service_type AS ENUM ('spotify', 'apple-music');

-- Create user_services table
CREATE TABLE IF NOT EXISTS user_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    service service_type NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, service)
);

-- Enable RLS
ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own services"
    ON user_services FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
    ON user_services FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
    ON user_services FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
    ON user_services FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_services_updated_at
    BEFORE UPDATE ON user_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
