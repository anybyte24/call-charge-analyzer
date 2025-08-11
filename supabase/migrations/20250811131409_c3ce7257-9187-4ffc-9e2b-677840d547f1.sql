-- Enable realtime for clients and client_numbers
alter table public.clients replica identity full;
alter table public.client_numbers replica identity full;

-- Add tables to supabase_realtime publication idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'client_numbers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.client_numbers;
  END IF;
END $$;