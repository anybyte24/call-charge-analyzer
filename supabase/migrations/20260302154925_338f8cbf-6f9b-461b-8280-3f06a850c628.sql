
-- 1. Create a security definer function to check org membership (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- 2. Enable RLS on organization_members (it has policies but RLS was not enabled)
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 3. Add SELECT policy: members can see fellow members in their orgs
CREATE POLICY "Members can view own org members"
ON public.organization_members
FOR SELECT
TO authenticated
USING (public.is_org_member(auth.uid(), organization_id));

-- 4. Add UPDATE policy: members can update their own membership
CREATE POLICY "Members can update own membership"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 5. Add DELETE policy: members can remove themselves
CREATE POLICY "Members can delete own membership"
ON public.organization_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 6. Enable RLS on organizations table (it has INSERT policy but RLS not enabled)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 7. Add SELECT policy for organizations: members can view their orgs
CREATE POLICY "Members can view their organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (public.is_org_member(auth.uid(), id));

-- 8. Add UPDATE policy for organizations
CREATE POLICY "Members can update their organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (public.is_org_member(auth.uid(), id));

-- 9. Add DELETE policy for organizations
CREATE POLICY "Members can delete their organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (public.is_org_member(auth.uid(), id));
