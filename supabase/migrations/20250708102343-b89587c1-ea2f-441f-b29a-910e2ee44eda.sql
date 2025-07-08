-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company_name TEXT,
  theme_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create analysis sessions table
CREATE TABLE public.analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  total_records INTEGER NOT NULL,
  summary_data JSONB NOT NULL,
  caller_analysis_data JSONB NOT NULL,
  records_data JSONB,
  prefix_config JSONB,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sessions" 
ON public.analysis_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.analysis_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.analysis_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.analysis_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- Create cost alerts table
CREATE TABLE public.cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('daily_cost', 'monthly_cost', 'number_cost', 'caller_cost')),
  threshold_value DECIMAL(10,2) NOT NULL,
  target_number TEXT,
  target_caller TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cost_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own alerts" 
ON public.cost_alerts FOR ALL 
USING (auth.uid() = user_id);

-- Create saved configurations table
CREATE TABLE public.saved_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prefix_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own configurations" 
ON public.saved_configurations FOR ALL 
USING (auth.uid() = user_id);

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_configurations_updated_at
    BEFORE UPDATE ON public.saved_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_analysis_sessions_user_id_date ON public.analysis_sessions(user_id, upload_date DESC);
CREATE INDEX idx_cost_alerts_user_id_active ON public.cost_alerts(user_id, is_active);
CREATE INDEX idx_saved_configurations_user_id_default ON public.saved_configurations(user_id, is_default);