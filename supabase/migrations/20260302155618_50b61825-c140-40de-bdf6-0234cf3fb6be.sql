
-- Update RLS policies on 5 tables to include organization membership checks
-- Affected: analysis_sessions, clients, client_numbers, client_pricing, user_global_pricing
-- Pattern: keep user_id check AND add org membership check when organization_id is set

-- ===================== analysis_sessions =====================
DROP POLICY IF EXISTS "Analysis sessions are viewable by owner" ON public.analysis_sessions;
CREATE POLICY "Analysis sessions are viewable by owner" ON public.analysis_sessions
FOR SELECT TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Analysis sessions are insertable by owner" ON public.analysis_sessions;
CREATE POLICY "Analysis sessions are insertable by owner" ON public.analysis_sessions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Analysis sessions are updatable by owner" ON public.analysis_sessions;
CREATE POLICY "Analysis sessions are updatable by owner" ON public.analysis_sessions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Analysis sessions are deletable by owner" ON public.analysis_sessions;
CREATE POLICY "Analysis sessions are deletable by owner" ON public.analysis_sessions
FOR DELETE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

-- ===================== clients =====================
DROP POLICY IF EXISTS "Clients are viewable by owner" ON public.clients;
CREATE POLICY "Clients are viewable by owner" ON public.clients
FOR SELECT TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Clients are insertable by owner" ON public.clients;
CREATE POLICY "Clients are insertable by owner" ON public.clients
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Clients are updatable by owner" ON public.clients;
CREATE POLICY "Clients are updatable by owner" ON public.clients
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Clients are deletable by owner" ON public.clients;
CREATE POLICY "Clients are deletable by owner" ON public.clients
FOR DELETE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

-- ===================== client_numbers =====================
DROP POLICY IF EXISTS "Assignments are viewable by owner" ON public.client_numbers;
CREATE POLICY "Assignments are viewable by owner" ON public.client_numbers
FOR SELECT TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Assignments are insertable by owner" ON public.client_numbers;
CREATE POLICY "Assignments are insertable by owner" ON public.client_numbers
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Assignments are updatable by owner" ON public.client_numbers;
CREATE POLICY "Assignments are updatable by owner" ON public.client_numbers
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Assignments are deletable by owner" ON public.client_numbers;
CREATE POLICY "Assignments are deletable by owner" ON public.client_numbers
FOR DELETE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

-- ===================== client_pricing =====================
DROP POLICY IF EXISTS "Client pricing viewable by owner" ON public.client_pricing;
CREATE POLICY "Client pricing viewable by owner" ON public.client_pricing
FOR SELECT TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Client pricing insertable by owner" ON public.client_pricing;
CREATE POLICY "Client pricing insertable by owner" ON public.client_pricing
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Client pricing updatable by owner" ON public.client_pricing;
CREATE POLICY "Client pricing updatable by owner" ON public.client_pricing
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Client pricing deletable by owner" ON public.client_pricing;
CREATE POLICY "Client pricing deletable by owner" ON public.client_pricing
FOR DELETE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

-- ===================== user_global_pricing =====================
DROP POLICY IF EXISTS "Global pricing viewable by owner" ON public.user_global_pricing;
CREATE POLICY "Global pricing viewable by owner" ON public.user_global_pricing
FOR SELECT TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Global pricing insertable by owner" ON public.user_global_pricing;
CREATE POLICY "Global pricing insertable by owner" ON public.user_global_pricing
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Global pricing updatable by owner" ON public.user_global_pricing;
CREATE POLICY "Global pricing updatable by owner" ON public.user_global_pricing
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));

DROP POLICY IF EXISTS "Global pricing deletable by owner" ON public.user_global_pricing;
CREATE POLICY "Global pricing deletable by owner" ON public.user_global_pricing
FOR DELETE TO authenticated
USING (auth.uid() = user_id AND (organization_id IS NULL OR public.is_org_member(auth.uid(), organization_id)));
