-- Create extension for UUID generation
create extension if not exists pgcrypto;

-- Clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  color text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists idx_clients_user_id on public.clients(user_id);
create index if not exists idx_clients_created_at on public.clients(created_at);

-- Enable RLS
alter table public.clients enable row level security;

-- Policies
create policy if not exists "Clients are viewable by owner" on public.clients for select using (auth.uid() = user_id);
create policy if not exists "Clients are insertable by owner" on public.clients for insert with check (auth.uid() = user_id);
create policy if not exists "Clients are updatable by owner" on public.clients for update using (auth.uid() = user_id);
create policy if not exists "Clients are deletable by owner" on public.clients for delete using (auth.uid() = user_id);

-- Client numbers assignments table
create table if not exists public.client_numbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  caller_number text not null,
  created_at timestamptz not null default now(),
  constraint uq_client_number unique (user_id, caller_number)
);

create index if not exists idx_client_numbers_user_id on public.client_numbers(user_id);
create index if not exists idx_client_numbers_client_id on public.client_numbers(client_id);

alter table public.client_numbers enable row level security;

create policy if not exists "Assignments are viewable by owner" on public.client_numbers for select using (auth.uid() = user_id);
create policy if not exists "Assignments are insertable by owner" on public.client_numbers for insert with check (auth.uid() = user_id);
create policy if not exists "Assignments are updatable by owner" on public.client_numbers for update using (auth.uid() = user_id);
create policy if not exists "Assignments are deletable by owner" on public.client_numbers for delete using (auth.uid() = user_id);

-- updated_at trigger helper
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for clients table
create or replace trigger trg_clients_updated_at
before update on public.clients
for each row execute function public.update_updated_at_column();