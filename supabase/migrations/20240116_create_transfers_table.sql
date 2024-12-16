-- Create transfers table
create table if not exists public.transfers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  source_service text not null check (source_service in ('spotify', 'apple-music')),
  destination_service text not null check (destination_service in ('spotify', 'apple-music')),
  status text not null check (status in ('pending', 'in_progress', 'success', 'failed')),
  metadata jsonb,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Add RLS policies
alter table public.transfers enable row level security;

create policy "Users can view their own transfers"
  on public.transfers for select
  using (auth.uid() = user_id);

create policy "Users can create their own transfers"
  on public.transfers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transfers"
  on public.transfers for update
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_transfers_updated_at
  before update on public.transfers
  for each row
  execute procedure public.handle_updated_at();

-- Add indexes
create index transfers_user_id_idx on public.transfers(user_id);
create index transfers_status_idx on public.transfers(status);
