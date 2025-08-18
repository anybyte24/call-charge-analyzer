-- Fix missing column in analysis_sessions table
ALTER TABLE public.analysis_sessions 
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now();