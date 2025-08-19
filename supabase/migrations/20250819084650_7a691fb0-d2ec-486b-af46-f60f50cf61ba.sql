-- Fix infinite recursion in RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their organization memberships" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;  
DROP POLICY IF EXISTS "Users can view their organization members" ON organization_members;

-- Create proper RLS policies for organizations table
CREATE POLICY "Users can view their organizations"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create organizations"
ON organizations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners and admins can update organizations"
ON organizations FOR UPDATE
USING (
  id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

-- Create proper RLS policies for organization_members table  
CREATE POLICY "Users can view organization members"
ON organization_members FOR SELECT
USING (user_id = auth.uid() OR organization_id IN (
  SELECT om.organization_id 
  FROM organization_members om 
  WHERE om.user_id = auth.uid()
));

CREATE POLICY "Users can join organizations"
ON organization_members FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage members"
ON organization_members FOR UPDATE
USING (
  organization_id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.role = 'owner'
  )
);

CREATE POLICY "Owners can remove members"
ON organization_members FOR DELETE
USING (
  organization_id IN (
    SELECT om.organization_id 
    FROM organization_members om 
    WHERE om.user_id = auth.uid() 
    AND om.role = 'owner'
  )
);