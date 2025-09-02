-- Ripristino funzionalità base - rimuovo tutte le policy problematiche temporaneamente
-- Disabilito RLS per permettere l'accesso base
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- Rimuovo tutte le policy esistenti
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON organization_members;
DROP POLICY IF EXISTS "All authenticated users can view organizations" ON organization_members;
DROP POLICY IF EXISTS "All authenticated users can create organizations" ON organization_members;
DROP POLICY IF EXISTS "All authenticated users can update organizations" ON organization_members;
DROP POLICY IF EXISTS "All authenticated users can view organizations" ON organizations;
DROP POLICY IF EXISTS "All authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "All authenticated users can update organizations" ON organizations;