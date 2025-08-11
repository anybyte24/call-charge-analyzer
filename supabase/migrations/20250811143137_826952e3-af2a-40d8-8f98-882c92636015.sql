-- 1) Client-specific pricing
CREATE TABLE IF NOT EXISTS public.client_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  mobile_rate NUMERIC(10,4) NOT NULL DEFAULT 0,
  landline_rate NUMERIC(10,4) NOT NULL DEFAULT 0,
  monthly_flat_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT client_pricing_nonnegative CHECK (
    mobile_rate >= 0 AND landline_rate >= 0 AND monthly_flat_fee >= 0
  ),
  CONSTRAINT client_pricing_unique UNIQUE (user_id, client_id),
  CONSTRAINT client_pricing_client_fk FOREIGN KEY (client_id)
    REFERENCES public.clients (id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_pricing_user_id ON public.client_pricing(user_id);
CREATE INDEX IF NOT EXISTS idx_client_pricing_client_id ON public.client_pricing(client_id);

-- RLS
ALTER TABLE public.client_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Client pricing viewable by owner" ON public.client_pricing;
DROP POLICY IF EXISTS "Client pricing insertable by owner" ON public.client_pricing;
DROP POLICY IF EXISTS "Client pricing updatable by owner" ON public.client_pricing;
DROP POLICY IF EXISTS "Client pricing deletable by owner" ON public.client_pricing;
CREATE POLICY "Client pricing viewable by owner" ON public.client_pricing
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Client pricing insertable by owner" ON public.client_pricing
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Client pricing updatable by owner" ON public.client_pricing
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client pricing deletable by owner" ON public.client_pricing
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_client_pricing_updated_at ON public.client_pricing;
CREATE TRIGGER update_client_pricing_updated_at
BEFORE UPDATE ON public.client_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2) User-level global pricing (shared across all clients of a user)
CREATE TABLE IF NOT EXISTS public.user_global_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  international_rate NUMERIC(10,4) NOT NULL DEFAULT 0,
  premium_rate NUMERIC(10,4) NOT NULL DEFAULT 0, -- 899/199
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_global_pricing_nonnegative CHECK (
    international_rate >= 0 AND premium_rate >= 0
  )
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_global_pricing_user_id ON public.user_global_pricing(user_id);

-- RLS
ALTER TABLE public.user_global_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Global pricing viewable by owner" ON public.user_global_pricing;
DROP POLICY IF EXISTS "Global pricing insertable by owner" ON public.user_global_pricing;
DROP POLICY IF EXISTS "Global pricing updatable by owner" ON public.user_global_pricing;
DROP POLICY IF EXISTS "Global pricing deletable by owner" ON public.user_global_pricing;
CREATE POLICY "Global pricing viewable by owner" ON public.user_global_pricing
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Global pricing insertable by owner" ON public.user_global_pricing
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Global pricing updatable by owner" ON public.user_global_pricing
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Global pricing deletable by owner" ON public.user_global_pricing
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_global_pricing_updated_at ON public.user_global_pricing;
CREATE TRIGGER update_user_global_pricing_updated_at
BEFORE UPDATE ON public.user_global_pricing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();