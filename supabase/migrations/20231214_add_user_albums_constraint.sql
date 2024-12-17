-- Add unique constraint for user_albums
ALTER TABLE user_albums 
ADD CONSTRAINT user_albums_user_service_source_unique 
UNIQUE (user_id, service, source_id);
