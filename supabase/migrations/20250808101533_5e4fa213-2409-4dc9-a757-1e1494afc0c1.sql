-- Create clients table and client_numbers mapping
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  color text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users can view their own clients"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Users can insert their own clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own clients"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Users can delete their own clients"
  on public.clients for delete
  using (auth.uid() = user_id);

-- Trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql security definer set search_path = public;

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

-- Create client_numbers mapping
create table if not exists public.client_numbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  caller_number text not null,
  created_at timestamptz not null default now(),
  unique (user_id, caller_number)
);

alter table public.client_numbers enable row level security;

create index if not exists idx_client_numbers_user on public.client_numbers(user_id);
create index if not exists idx_client_numbers_client on public.client_numbers(client_id);
create index if not exists idx_client_numbers_number on public.client_numbers(caller_number);

create policy "Users can view their own client number mappings"
  on public.client_numbers for select
  using (auth.uid() = user_id);

create policy "Users can insert their own client number mappings"
  on public.client_numbers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own client number mappings"
  on public.client_numbers for update
  using (auth.uid() = user_id);

create policy "Users can delete their own client number mappings"
  on public.client_numbers for delete
  using (auth.uid() = user_id);
