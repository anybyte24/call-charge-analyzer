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

-- Recreate policies (drop if exist, then create)
DROP POLICY IF EXISTS "Clients are viewable by owner" ON public.clients;
DROP POLICY IF EXISTS "Clients are insertable by owner" ON public.clients;
DROP POLICY IF EXISTS "Clients are updatable by owner" ON public.clients;
DROP POLICY IF EXISTS "Clients are deletable by owner" ON public.clients;

CREATE POLICY "Clients are viewable by owner"
ON public.clients
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Clients are insertable by owner"
ON public.clients
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients are updatable by owner"
ON public.clients
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Clients are deletable by owner"
ON public.clients
FOR DELETE
USING (auth.uid() = user_id);

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

DROP POLICY IF EXISTS "Assignments are viewable by owner" ON public.client_numbers;
DROP POLICY IF EXISTS "Assignments are insertable by owner" ON public.client_numbers;
DROP POLICY IF EXISTS "Assignments are updatable by owner" ON public.client_numbers;
DROP POLICY IF EXISTS "Assignments are deletable by owner" ON public.client_numbers;

CREATE POLICY "Assignments are viewable by owner"
ON public.client_numbers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Assignments are insertable by owner"
ON public.client_numbers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Assignments are updatable by owner"
ON public.client_numbers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Assignments are deletable by owner"
ON public.client_numbers
FOR DELETE
USING (auth.uid() = user_id);

-- updated_at trigger helper
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for clients table (drop if exists, then create)
DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();