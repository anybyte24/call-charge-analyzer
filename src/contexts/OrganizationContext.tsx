import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: any;
  subscription_plan: string;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  organization: Organization;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  userRole: string | null;
  loading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  createOrganization: (name: string, slug: string) => Promise<Organization>;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshOrganizations = async () => {
    try {
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          organization:organizations(*)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      const orgs = memberships?.map((m: any) => m.organization) || [];
      setOrganizations(orgs);

      // Set current organization to first one if none selected
      if (orgs.length > 0 && !currentOrganization) {
        const firstOrg = orgs[0];
        setCurrentOrganization(firstOrg);
        setUserRole(memberships?.find((m: any) => m.organization_id === firstOrg.id)?.role || null);
        localStorage.setItem('currentOrganizationId', firstOrg.id);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      
      // Get user role for this organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      setUserRole(membership?.role || null);
      localStorage.setItem('currentOrganizationId', orgId);
    }
  };

  const createOrganization = async (name: string, slug: string): Promise<Organization> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        settings: {}
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) throw memberError;

    await refreshOrganizations();
    return org;
  };

  useEffect(() => {
    const initializeOrganizations = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await refreshOrganizations();
        
        // Try to restore current organization from localStorage
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        if (savedOrgId) {
          await switchOrganization(savedOrgId);
        }
      }
    };

    initializeOrganizations();
  }, []);

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    userRole,
    loading,
    switchOrganization,
    refreshOrganizations,
    createOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};