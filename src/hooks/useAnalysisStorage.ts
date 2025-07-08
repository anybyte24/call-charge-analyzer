import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisSession, CallRecord, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from './use-toast';

export const useAnalysisStorage = () => {
  const { user, isTemporary } = useSupabaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const saveSession = useCallback(async (
    session: AnalysisSession,
    records: CallRecord[]
  ): Promise<string | null> => {
    if (!user) return null;
    setLoading(true);

    try {
      if (isTemporary) {
        // Save to localStorage for demo users
        const savedSessions = JSON.parse(localStorage.getItem('analysis_sessions') || '[]');
        const sessionWithRecords = { ...session, records };
        savedSessions.push(sessionWithRecords);
        localStorage.setItem('analysis_sessions', JSON.stringify(savedSessions));
        
        toast({
          title: "Sessione salvata localmente",
          description: "La sessione è stata salvata nel browser per questa demo."
        });
        
        return session.id;
      }

      // Save to Supabase for authenticated users
      const { data, error } = await supabase
        .from('analysis_sessions')
        .insert({
          file_name: session.fileName,
          total_records: session.totalRecords,
          summary_data: session.summary as any,
          caller_analysis_data: session.callerAnalysis as any,
          records_data: records.slice(0, 1000) as any, // Limit records for storage efficiency
          prefix_config: session.prefixConfig as any,
          last_accessed: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sessione salvata",
        description: "L'analisi è stata salvata con successo."
      });

      return data.id;
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Errore nel salvataggio",
        description: "Impossibile salvare la sessione.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, isTemporary, toast]);

  const loadSessions = useCallback(async (): Promise<AnalysisSession[]> => {
    if (!user) return [];
    setLoading(true);

    try {
      if (isTemporary) {
        // Load from localStorage for demo users
        const savedSessions = JSON.parse(localStorage.getItem('analysis_sessions') || '[]');
        return savedSessions.map((s: any) => ({
          id: s.id,
          fileName: s.fileName,
          uploadDate: s.uploadDate,
          totalRecords: s.totalRecords,
          summary: s.summary,
          callerAnalysis: s.callerAnalysis,
          prefixConfig: s.prefixConfig
        }));
      }

      // Load from Supabase for authenticated users
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .order('last_accessed', { ascending: false });

      if (error) throw error;

      return data.map(session => ({
        id: session.id,
        fileName: session.file_name,
        uploadDate: session.upload_date,
        totalRecords: session.total_records,
        summary: session.summary_data as unknown as CallSummary[],
        callerAnalysis: session.caller_analysis_data as unknown as CallerAnalysis[],
        prefixConfig: session.prefix_config as unknown as PrefixConfig[]
      }));
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, isTemporary]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      if (isTemporary) {
        // Delete from localStorage for demo users
        const savedSessions = JSON.parse(localStorage.getItem('analysis_sessions') || '[]');
        const filteredSessions = savedSessions.filter((s: any) => s.id !== sessionId);
        localStorage.setItem('analysis_sessions', JSON.stringify(filteredSessions));
        
        toast({
          title: "Sessione eliminata",
          description: "La sessione è stata rimossa."
        });
        
        return true;
      }

      // Delete from Supabase for authenticated users
      const { error } = await supabase
        .from('analysis_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Sessione eliminata",
        description: "La sessione è stata rimossa dal database."
      });

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Errore nell'eliminazione",
        description: "Impossibile eliminare la sessione.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isTemporary, toast]);

  return {
    saveSession,
    loadSessions,
    deleteSession,
    loading,
    isTemporary
  };
};