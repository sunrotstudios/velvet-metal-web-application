-- Create a function to remove all data related to a service for a user
create or replace function remove_service_data(p_user_id uuid, p_service text)
returns void
language plpgsql
security definer
as $$
begin
    -- Delete all albums for the user and service
    delete from albums
    where user_id = p_user_id
    and service = p_service;

    -- Delete all playlists for the user and service
    delete from playlists
    where user_id = p_user_id
    and service = p_service;

    -- Delete the service authentication
    delete from user_services
    where user_id = p_user_id
    and service = p_service;

    -- Note: The function runs in an implicit transaction,
    -- so if any operation fails, all changes will be rolled back
end;
$$;
