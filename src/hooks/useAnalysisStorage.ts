import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalysisSession, CallRecord, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';
import { CallAnalyzer } from '@/utils/call-analyzer';
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

      return data.map(session => ({
        id: session.id,
        fileName: session.file_name,
        uploadDate: session.upload_date,
        totalRecords: session.total_records,
        summary: session.summary_data as unknown as CallSummary[],
        callerAnalysis: session.caller_analysis_data as unknown as CallerAnalysis[],
        prefixConfig: session.prefix_config as unknown as PrefixConfig[],
        records: session.records_data as unknown as CallRecord[] // Include anche i records dal database
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

  const recalculateCosts = useCallback(async (sessionId?: string): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      console.log('🔄 === STARTING COST RECALCULATION ===');
      console.log('👤 User:', user ? 'authenticated' : 'not authenticated');
      console.log('📱 Is temporary user:', isTemporary);
      
      if (isTemporary) {
        // Recalculate for localStorage sessions
        console.log('💾 Checking localStorage sessions...');
        const savedSessions = JSON.parse(localStorage.getItem('analysis_sessions') || '[]');
        console.log('📂 Found sessions:', savedSessions.length);
        let updated = false;

        const updatedSessions = savedSessions.map((session: any, index: number) => {
          console.log(`🔍 Checking session ${index + 1}:`, session.fileName);
          console.log(`📋 Session has records:`, session.records ? `Yes (${session.records.length})` : 'No');
          
          if (sessionId && session.id !== sessionId) {
            console.log(`⏭️ Skipping session (ID mismatch): ${session.id} !== ${sessionId}`);
            return session;
          }
          
          if (!session.records || !Array.isArray(session.records)) {
            console.log(`❌ Session ${session.fileName} has no records to recalculate`);
            return session;
          }

          console.log(`💫 Recalculating session: ${session.fileName} (${session.records.length} records)`);
          
          // Ricalcola i costi per ogni record
          const recalculatedRecords = session.records.map((record: CallRecord) => {
            const categoryWithCost = CallAnalyzer.categorizeNumber(record.calledNumber);
            const newCost = CallAnalyzer.calculateCallCost(record.durationSeconds, categoryWithCost.costPerMinute);
            
            console.log(`📞 ${record.calledNumber}: €${record.cost?.toFixed(4)} → €${newCost.toFixed(4)}`);
            
            return {
              ...record,
              cost: newCost,
              category: {
                type: categoryWithCost.type,
                description: categoryWithCost.description
              }
            };
          });

          // Rigenera summary e caller analysis
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
        if (!session.records_data || !Array.isArray(session.records_data)) continue;

        console.log(`💫 Recalculating session: ${session.file_name}`);
        
        // Ricalcola i costi per ogni record
        const recalculatedRecords = (session.records_data as unknown as CallRecord[]).map((record: CallRecord) => {
          const categoryWithCost = CallAnalyzer.categorizeNumber(record.calledNumber);
          const newCost = CallAnalyzer.calculateCallCost(record.durationSeconds, categoryWithCost.costPerMinute);
          
          console.log(`📞 ${record.calledNumber}: €${record.cost?.toFixed(4)} → €${newCost.toFixed(4)}`);
          
          return {
            ...record,
            cost: newCost,
            category: {
              type: categoryWithCost.type,
              description: categoryWithCost.description
            }
          };
        });

        // Rigenera summary e caller analysis
        const newSummary = CallAnalyzer.generateSummary(recalculatedRecords);
        const newCallerAnalysis = CallAnalyzer.generateCallerAnalysis(recalculatedRecords);

        // Aggiorna nel database
        const { error: updateError } = await supabase
          .from('analysis_sessions')
          .update({
            summary_data: newSummary as any,
            caller_analysis_data: newCallerAnalysis as any,
            records_data: recalculatedRecords as any,
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

      console.log('✅ Cost recalculation completed');
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