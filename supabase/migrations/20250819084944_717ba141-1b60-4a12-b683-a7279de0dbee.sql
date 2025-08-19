-- Fix infinite recursion by completely rebuilding policies with simpler approach
-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Owners can manage members" ON organization_members;
DROP POLICY IF EXISTS "Owners can remove members" ON organization_members;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Owners and admins can update organizations" ON organizations;

-- Create simple non-recursive policies for organization_members
CREATE POLICY "Users can view their own memberships" 
ON organization_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships"
ON organization_members FOR INSERT  
WITH CHECK (user_id = auth.uid());

-- Create simple policies for organizations that don't reference organization_members
CREATE POLICY "All authenticated users can view organizations"
ON organizations FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can create organizations"
ON organizations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update organizations"
ON organizations FOR UPDATE  
USING (auth.role() = 'authenticated');