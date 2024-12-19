create type "public"."service_type" as enum ('spotify', 'apple-music');

create table "public"."album_tracks" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "album_id" text not null,
    "track_number" integer,
    "name" text not null,
    "duration_ms" integer,
    "artist_name" text,
    "preview_url" text,
    "external_url" text,
    "is_playable" boolean default true,
    "service" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."album_tracks" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "display_name" text,
    "email" text,
    "avatar_url" text,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
);


alter table "public"."profiles" enable row level security;

create table "public"."transfers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "source_service" text not null,
    "destination_service" text not null,
    "status" text not null,
    "metadata" jsonb,
    "error" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "completed_at" timestamp with time zone,
    "tracksCount" smallint
);


alter table "public"."transfers" enable row level security;

create table "public"."user_albums" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "service" service_type not null,
    "album_id" text not null,
    "name" text not null,
    "artist_name" text not null,
    "release_date" text,
    "image_url" text,
    "tracks_count" integer,
    "external_url" text,
    "synced_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "album_type" text default 'album'::text
);


alter table "public"."user_albums" enable row level security;

create table "public"."user_playlists" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "service" service_type not null,
    "playlist_id" text not null,
    "name" text not null,
    "description" text,
    "image_url" text,
    "tracks_count" integer,
    "owner_id" text,
    "owner_name" text,
    "is_public" boolean default true,
    "external_url" text,
    "synced_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."user_playlists" enable row level security;

create table "public"."user_services" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "service" service_type not null,
    "access_token" text not null,
    "refresh_token" text,
    "token_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "music_user_token" text
);


alter table "public"."user_services" enable row level security;

CREATE UNIQUE INDEX album_tracks_pkey ON public.album_tracks USING btree (id);

CREATE UNIQUE INDEX album_tracks_user_id_album_id_track_number_service_key ON public.album_tracks USING btree (user_id, album_id, track_number, service);

CREATE INDEX idx_user_albums_service ON public.user_albums USING btree (service);

CREATE INDEX idx_user_albums_user_id ON public.user_albums USING btree (user_id);

CREATE INDEX idx_user_playlists_service ON public.user_playlists USING btree (service);

CREATE INDEX idx_user_playlists_user_id ON public.user_playlists USING btree (user_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX transfers_pkey ON public.transfers USING btree (id);

CREATE INDEX transfers_status_idx ON public.transfers USING btree (status);

CREATE INDEX transfers_user_id_idx ON public.transfers USING btree (user_id);

CREATE UNIQUE INDEX user_albums_pkey ON public.user_albums USING btree (id);

CREATE UNIQUE INDEX user_albums_user_id_service_album_id_key ON public.user_albums USING btree (user_id, service, album_id);

CREATE UNIQUE INDEX user_playlists_pkey ON public.user_playlists USING btree (id);

CREATE UNIQUE INDEX user_playlists_user_id_service_playlist_id_key ON public.user_playlists USING btree (user_id, service, playlist_id);

CREATE UNIQUE INDEX user_services_pkey ON public.user_services USING btree (id);

CREATE INDEX user_services_service_idx ON public.user_services USING btree (service);

CREATE INDEX user_services_user_id_idx ON public.user_services USING btree (user_id);

CREATE UNIQUE INDEX user_services_user_id_service_key ON public.user_services USING btree (user_id, service);

alter table "public"."album_tracks" add constraint "album_tracks_pkey" PRIMARY KEY using index "album_tracks_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."transfers" add constraint "transfers_pkey" PRIMARY KEY using index "transfers_pkey";

alter table "public"."user_albums" add constraint "user_albums_pkey" PRIMARY KEY using index "user_albums_pkey";

alter table "public"."user_playlists" add constraint "user_playlists_pkey" PRIMARY KEY using index "user_playlists_pkey";

alter table "public"."user_services" add constraint "user_services_pkey" PRIMARY KEY using index "user_services_pkey";

alter table "public"."album_tracks" add constraint "album_tracks_service_check" CHECK ((service = ANY (ARRAY['spotify'::text, 'apple-music'::text]))) not valid;

alter table "public"."album_tracks" validate constraint "album_tracks_service_check";

alter table "public"."album_tracks" add constraint "album_tracks_user_id_album_id_track_number_service_key" UNIQUE using index "album_tracks_user_id_album_id_track_number_service_key";

alter table "public"."album_tracks" add constraint "album_tracks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."album_tracks" validate constraint "album_tracks_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."transfers" add constraint "transfers_destination_service_check" CHECK ((destination_service = ANY (ARRAY['spotify'::text, 'apple-music'::text]))) not valid;

alter table "public"."transfers" validate constraint "transfers_destination_service_check";

alter table "public"."transfers" add constraint "transfers_source_service_check" CHECK ((source_service = ANY (ARRAY['spotify'::text, 'apple-music'::text]))) not valid;

alter table "public"."transfers" validate constraint "transfers_source_service_check";

alter table "public"."transfers" add constraint "transfers_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'success'::text, 'failed'::text]))) not valid;

alter table "public"."transfers" validate constraint "transfers_status_check";

alter table "public"."transfers" add constraint "transfers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."transfers" validate constraint "transfers_user_id_fkey";

alter table "public"."user_albums" add constraint "user_albums_album_type_check" CHECK ((album_type = ANY (ARRAY['album'::text, 'single'::text, 'ep'::text]))) not valid;

alter table "public"."user_albums" validate constraint "user_albums_album_type_check";

alter table "public"."user_albums" add constraint "user_albums_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_albums" validate constraint "user_albums_user_id_fkey";

alter table "public"."user_albums" add constraint "user_albums_user_id_service_album_id_key" UNIQUE using index "user_albums_user_id_service_album_id_key";

alter table "public"."user_playlists" add constraint "user_playlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_playlists" validate constraint "user_playlists_user_id_fkey";

alter table "public"."user_playlists" add constraint "user_playlists_user_id_service_playlist_id_key" UNIQUE using index "user_playlists_user_id_service_playlist_id_key";

alter table "public"."user_services" add constraint "user_services_service_check" CHECK ((service = ANY (ARRAY['spotify'::service_type, 'apple-music'::service_type]))) not valid;

alter table "public"."user_services" validate constraint "user_services_service_check";

alter table "public"."user_services" add constraint "user_services_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_services" validate constraint "user_services_user_id_fkey";

alter table "public"."user_services" add constraint "user_services_user_id_service_key" UNIQUE using index "user_services_user_id_service_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, avatar_url, updated_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    now()
  );
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_albums_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_playlists_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."album_tracks" to "anon";

grant insert on table "public"."album_tracks" to "anon";

grant references on table "public"."album_tracks" to "anon";

grant select on table "public"."album_tracks" to "anon";

grant trigger on table "public"."album_tracks" to "anon";

grant truncate on table "public"."album_tracks" to "anon";

grant update on table "public"."album_tracks" to "anon";

grant delete on table "public"."album_tracks" to "authenticated";

grant insert on table "public"."album_tracks" to "authenticated";

grant references on table "public"."album_tracks" to "authenticated";

grant select on table "public"."album_tracks" to "authenticated";

grant trigger on table "public"."album_tracks" to "authenticated";

grant truncate on table "public"."album_tracks" to "authenticated";

grant update on table "public"."album_tracks" to "authenticated";

grant delete on table "public"."album_tracks" to "service_role";

grant insert on table "public"."album_tracks" to "service_role";

grant references on table "public"."album_tracks" to "service_role";

grant select on table "public"."album_tracks" to "service_role";

grant trigger on table "public"."album_tracks" to "service_role";

grant truncate on table "public"."album_tracks" to "service_role";

grant update on table "public"."album_tracks" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."transfers" to "anon";

grant insert on table "public"."transfers" to "anon";

grant references on table "public"."transfers" to "anon";

grant select on table "public"."transfers" to "anon";

grant trigger on table "public"."transfers" to "anon";

grant truncate on table "public"."transfers" to "anon";

grant update on table "public"."transfers" to "anon";

grant delete on table "public"."transfers" to "authenticated";

grant insert on table "public"."transfers" to "authenticated";

grant references on table "public"."transfers" to "authenticated";

grant select on table "public"."transfers" to "authenticated";

grant trigger on table "public"."transfers" to "authenticated";

grant truncate on table "public"."transfers" to "authenticated";

grant update on table "public"."transfers" to "authenticated";

grant delete on table "public"."transfers" to "service_role";

grant insert on table "public"."transfers" to "service_role";

grant references on table "public"."transfers" to "service_role";

grant select on table "public"."transfers" to "service_role";

grant trigger on table "public"."transfers" to "service_role";

grant truncate on table "public"."transfers" to "service_role";

grant update on table "public"."transfers" to "service_role";

grant delete on table "public"."user_albums" to "anon";

grant insert on table "public"."user_albums" to "anon";

grant references on table "public"."user_albums" to "anon";

grant select on table "public"."user_albums" to "anon";

grant trigger on table "public"."user_albums" to "anon";

grant truncate on table "public"."user_albums" to "anon";

grant update on table "public"."user_albums" to "anon";

grant delete on table "public"."user_albums" to "authenticated";

grant insert on table "public"."user_albums" to "authenticated";

grant references on table "public"."user_albums" to "authenticated";

grant select on table "public"."user_albums" to "authenticated";

grant trigger on table "public"."user_albums" to "authenticated";

grant truncate on table "public"."user_albums" to "authenticated";

grant update on table "public"."user_albums" to "authenticated";

grant delete on table "public"."user_albums" to "service_role";

grant insert on table "public"."user_albums" to "service_role";

grant references on table "public"."user_albums" to "service_role";

grant select on table "public"."user_albums" to "service_role";

grant trigger on table "public"."user_albums" to "service_role";

grant truncate on table "public"."user_albums" to "service_role";

grant update on table "public"."user_albums" to "service_role";

grant delete on table "public"."user_playlists" to "anon";

grant insert on table "public"."user_playlists" to "anon";

grant references on table "public"."user_playlists" to "anon";

grant select on table "public"."user_playlists" to "anon";

grant trigger on table "public"."user_playlists" to "anon";

grant truncate on table "public"."user_playlists" to "anon";

grant update on table "public"."user_playlists" to "anon";

grant delete on table "public"."user_playlists" to "authenticated";

grant insert on table "public"."user_playlists" to "authenticated";

grant references on table "public"."user_playlists" to "authenticated";

grant select on table "public"."user_playlists" to "authenticated";

grant trigger on table "public"."user_playlists" to "authenticated";

grant truncate on table "public"."user_playlists" to "authenticated";

grant update on table "public"."user_playlists" to "authenticated";

grant delete on table "public"."user_playlists" to "service_role";

grant insert on table "public"."user_playlists" to "service_role";

grant references on table "public"."user_playlists" to "service_role";

grant select on table "public"."user_playlists" to "service_role";

grant trigger on table "public"."user_playlists" to "service_role";

grant truncate on table "public"."user_playlists" to "service_role";

grant update on table "public"."user_playlists" to "service_role";

grant delete on table "public"."user_services" to "anon";

grant insert on table "public"."user_services" to "anon";

grant references on table "public"."user_services" to "anon";

grant select on table "public"."user_services" to "anon";

grant trigger on table "public"."user_services" to "anon";

grant truncate on table "public"."user_services" to "anon";

grant update on table "public"."user_services" to "anon";

grant delete on table "public"."user_services" to "authenticated";

grant insert on table "public"."user_services" to "authenticated";

grant references on table "public"."user_services" to "authenticated";

grant select on table "public"."user_services" to "authenticated";

grant trigger on table "public"."user_services" to "authenticated";

grant truncate on table "public"."user_services" to "authenticated";

grant update on table "public"."user_services" to "authenticated";

grant delete on table "public"."user_services" to "service_role";

grant insert on table "public"."user_services" to "service_role";

grant references on table "public"."user_services" to "service_role";

grant select on table "public"."user_services" to "service_role";

grant trigger on table "public"."user_services" to "service_role";

grant truncate on table "public"."user_services" to "service_role";

grant update on table "public"."user_services" to "service_role";

create policy "Users can delete their own album tracks"
on "public"."album_tracks"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own album tracks"
on "public"."album_tracks"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own album tracks"
on "public"."album_tracks"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own album tracks"
on "public"."album_tracks"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Public profiles are viewable by everyone"
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Trigger can create user profiles"
on "public"."profiles"
as permissive
for insert
to postgres
with check (true);


create policy "Users can insert their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can create their own transfers"
on "public"."transfers"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own transfers"
on "public"."transfers"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own transfers"
on "public"."transfers"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own albums"
on "public"."user_albums"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own albums"
on "public"."user_albums"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own albums"
on "public"."user_albums"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view their own albums"
on "public"."user_albums"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own playlists"
on "public"."user_playlists"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own playlists"
on "public"."user_playlists"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own playlists"
on "public"."user_playlists"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can view their own playlists"
on "public"."user_playlists"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can delete their own services"
on "public"."user_services"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert their own services"
on "public"."user_services"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own services"
on "public"."user_services"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own services"
on "public"."user_services"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER handle_transfers_updated_at BEFORE UPDATE ON public.transfers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_user_albums_updated_at BEFORE UPDATE ON public.user_albums FOR EACH ROW EXECUTE FUNCTION update_user_albums_updated_at();

CREATE TRIGGER update_user_playlists_updated_at BEFORE UPDATE ON public.user_playlists FOR EACH ROW EXECUTE FUNCTION update_user_playlists_updated_at();

CREATE TRIGGER update_user_services_updated_at BEFORE UPDATE ON public.user_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


