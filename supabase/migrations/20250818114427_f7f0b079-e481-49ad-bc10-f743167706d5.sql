-- Multi-tenant architecture
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User organization memberships
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Real-time analytics data
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  user_id UUID
);

-- AI Insights storage
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  confidence_score FLOAT,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Workflow automations
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automation executions log
CREATE TABLE public.automation_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  result JSONB,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API Integrations
CREATE TABLE public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  status TEXT DEFAULT 'active',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization memberships"
ON public.organizations FOR SELECT
USING (id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update their organizations"
ON public.organizations FOR UPDATE
USING (id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- RLS Policies for organization_members
CREATE POLICY "Users can view their organization members"
ON public.organization_members FOR SELECT
USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

-- RLS Policies for other tables (organization-scoped)
CREATE POLICY "Organization scoped access" ON public.analytics_events FOR ALL
USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Organization scoped access" ON public.ai_insights FOR ALL
USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Organization scoped access" ON public.automations FOR ALL
USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Organization scoped access" ON public.automation_executions FOR ALL
USING (automation_id IN (SELECT id FROM public.automations WHERE organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())));

CREATE POLICY "Organization scoped access" ON public.api_integrations FOR ALL
USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their push subscriptions" ON public.push_subscriptions FOR ALL
USING (user_id = auth.uid());

-- Update existing tables to support multi-tenant
ALTER TABLE public.clients ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.client_numbers ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.client_pricing ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.user_global_pricing ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.analysis_sessions ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_analytics_events_org_timestamp ON public.analytics_events(organization_id, timestamp);
CREATE INDEX idx_ai_insights_org_type ON public.ai_insights(organization_id, insight_type);
CREATE INDEX idx_automations_org_active ON public.automations(organization_id, is_active);

-- Enable realtime for key tables
ALTER TABLE public.analytics_events REPLICA IDENTITY FULL;
ALTER TABLE public.ai_insights REPLICA IDENTITY FULL;
ALTER TABLE public.automation_executions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_executions;

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
BEFORE UPDATE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
BEFORE UPDATE ON public.ai_insights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automations_updated_at
BEFORE UPDATE ON public.automations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at
BEFORE UPDATE ON public.api_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();