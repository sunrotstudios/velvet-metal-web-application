-- Create user_services table
CREATE TABLE IF NOT EXISTS user_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL CHECK (service IN ('spotify', 'apple-music')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, service)
);

-- Add RLS policies
ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own services"
    ON user_services FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services"
    ON user_services FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
    ON user_services FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
    ON user_services FOR DELETE
    USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS user_services_user_id_idx ON user_services(user_id);
CREATE INDEX IF NOT EXISTS user_services_service_idx ON user_services(service);
