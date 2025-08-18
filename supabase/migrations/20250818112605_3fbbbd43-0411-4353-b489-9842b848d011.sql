-- Create analysis_sessions table to fix the console error
CREATE TABLE public.analysis_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_name TEXT NOT NULL,
  file_data JSONB NOT NULL,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Analysis sessions are viewable by owner" 
ON public.analysis_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Analysis sessions are insertable by owner" 
ON public.analysis_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Analysis sessions are updatable by owner" 
ON public.analysis_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Analysis sessions are deletable by owner" 
ON public.analysis_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_analysis_sessions_updated_at
BEFORE UPDATE ON public.analysis_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();