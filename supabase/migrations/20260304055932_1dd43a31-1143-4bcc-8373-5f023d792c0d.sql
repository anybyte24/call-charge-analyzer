
-- Drop the existing restrictive policy that doesn't work correctly
DROP POLICY IF EXISTS "Organization scoped access" ON public.ai_insights;

-- Create proper permissive policies using is_org_member
CREATE POLICY "ai_insights_select" ON public.ai_insights
  FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "ai_insights_insert" ON public.ai_insights
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "ai_insights_update" ON public.ai_insights
  FOR UPDATE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "ai_insights_delete" ON public.ai_insights
  FOR DELETE TO authenticated
  USING (public.is_org_member(auth.uid(), organization_id));
