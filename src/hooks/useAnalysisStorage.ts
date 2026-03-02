import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisSession, CallRecord, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';
import { CallAnalyzer } from '@/utils/call-analyzer';
import { CostRecalculator } from '@/utils/cost-recalculator';
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
          user_id: user.id,
          session_name: session.fileName,
          file_data: {
            fileName: session.fileName,
            totalRecords: session.totalRecords,
            prefixConfig: session.prefixConfig,
            records: records.slice(0, 1000),
          } as any,
          analysis_results: {
            summary: session.summary,
            callerAnalysis: session.callerAnalysis,
          } as any,
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
          prefixConfig: s.prefixConfig,
          records: s.records // Include i records per il ricalcolo
        }));
      }

      // Load from Supabase for authenticated users
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .order('last_accessed', { ascending: false });

      if (error) throw error;

      return data.map(session => {
        const fileData = session.file_data as any || {};
        const analysisResults = session.analysis_results as any || {};
        return {
          id: session.id,
          fileName: session.session_name || fileData.fileName,
          uploadDate: session.created_at,
          totalRecords: fileData.totalRecords,
          summary: analysisResults.summary as CallSummary[],
          callerAnalysis: analysisResults.callerAnalysis as CallerAnalysis[],
          prefixConfig: fileData.prefixConfig as PrefixConfig[],
          records: fileData.records as CallRecord[],
        };
      });
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

  const recalculateCosts = useCallback(async (sessionId?: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      if (isTemporary) {
        const savedSessions = JSON.parse(localStorage.getItem('analysis_sessions') || '[]');
        let updated = false;

        const updatedSessions = savedSessions.map((session: any) => {
          if (sessionId && session.id !== sessionId) return session;
          if (!session.records || !Array.isArray(session.records)) return session;

          const recalculatedRecords = CostRecalculator.recalculateAllCosts(session.records);
          const newSummary = CallAnalyzer.generateSummary(recalculatedRecords);
          const newCallerAnalysis = CallAnalyzer.generateCallerAnalysis(recalculatedRecords);

          updated = true;
          return {
            ...session,
            records: recalculatedRecords,
            summary: newSummary,
            callerAnalysis: newCallerAnalysis
          };
        });

        if (updated) {
          localStorage.setItem('analysis_sessions', JSON.stringify(updatedSessions));
          toast({
            title: "Costi ricalcolati",
            description: "I costi sono stati aggiornati con i nuovi prezzi."
          });
        }
        
        return updated;
      }

      // Recalculate for Supabase sessions
      let query = supabase.from('analysis_sessions').select('*');
      
      if (sessionId) {
        query = query.eq('id', sessionId);
      }

      const { data: sessions, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      let updatedCount = 0;

      for (const session of sessions) {
        const fileData = session.file_data as any || {};
        const records = fileData.records;
        if (!records || !Array.isArray(records)) continue;

        const recalculatedRecords = CostRecalculator.recalculateAllCosts(records as CallRecord[]);

        // Rigenera summary e caller analysis
        const newSummary = CallAnalyzer.generateSummary(recalculatedRecords);
        const newCallerAnalysis = CallAnalyzer.generateCallerAnalysis(recalculatedRecords);

        // Aggiorna nel database
        const { error: updateError } = await supabase
          .from('analysis_sessions')
          .update({
            file_data: { ...fileData, records: recalculatedRecords } as any,
            analysis_results: { summary: newSummary, callerAnalysis: newCallerAnalysis } as any,
            last_accessed: new Date().toISOString()
          })
          .eq('id', session.id);

        if (updateError) throw updateError;
        updatedCount++;
      }

      if (updatedCount > 0) {
        toast({
          title: "Costi ricalcolati",
          description: `${updatedCount} sessione/i aggiornate con i nuovi prezzi.`
        });
      } else {
        toast({
          title: "Nessun aggiornamento",
          description: "Non sono state trovate sessioni da aggiornare."
        });
      }

      
      return updatedCount > 0;
      
    } catch (error) {
      console.error('Error recalculating costs:', error);
      toast({
        title: "Errore nel ricalcolo",
        description: "Impossibile ricalcolare i costi.",
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
    recalculateCosts,
    loading,
    isTemporary
  };
};