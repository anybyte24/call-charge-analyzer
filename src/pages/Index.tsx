import React, { useState, useCallback } from 'react';
import { useAnalysisStorage } from '@/hooks/useAnalysisStorage';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import FileUploadAdvanced from '@/components/FileUploadAdvanced';
import VirtualizedTable from '@/components/VirtualizedTable';
import CallAnalyticsCharts from '@/components/CallAnalyticsCharts';
import ClientAnalytics from '@/components/ClientAnalytics';
import ClientsManager from '@/components/ClientsManager';
import PrefixManager from '@/components/PrefixManager';
import { AIInsights } from '@/components/AIInsights';
import { AIEnhancedInsights } from '@/components/AIEnhancedInsights';
import { FTPImporter } from '@/components/FTPImporter';
import { RealTimeMetrics } from '@/components/RealTimeMetrics';
import { AutomationWorkflow } from '@/components/AutomationWorkflow';
import { AdvancedExport } from '@/components/AdvancedExport';
import { ModernLayout } from '@/components/ModernLayout';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { CallAnalyzer } from '@/utils/call-analyzer';
import type { CallRecord, CallSummary, CallerAnalysis, PrefixConfig } from '@/types/call-analysis';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentRecords, setCurrentRecords] = useState<CallRecord[]>([]);
  const [analysisData, setAnalysisData] = useState<CallRecord[]>([]);
  const [summary, setSummary] = useState<CallSummary[]>([]);
  const [callerAnalysis, setCallerAnalysis] = useState<CallerAnalysis[]>([]);
  const [prefixConfig, setPrefixConfig] = useState<PrefixConfig[]>(CallAnalyzer.defaultPrefixConfig);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { toast } = useToast();
  const { filteredRecords } = useAdvancedFilters(currentRecords);

  const handleDataUpload = useCallback(async (data: CallRecord[]) => {
    try {
      setIsAnalyzing(true);
      setCurrentRecords(data);
      setAnalysisData(data);
      
      const summaryResults = CallAnalyzer.generateSummary(data);
      const callerResults = CallAnalyzer.generateCallerAnalysis(data);
      setSummary(summaryResults);
      setCallerAnalysis(callerResults);
      setActiveTab('dashboard');
      
      toast({
        title: "Dati caricati con successo",
        description: `Analizzati ${data.length} record di chiamate`,
      });
    } catch (error) {
      console.error('Error analyzing data:', error);
      toast({
        title: "Errore nell'analisi",
        description: "Errore durante l'analisi dei dati caricati",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <div className="space-y-6 animate-fade-in">
            <FileUploadAdvanced 
              onFileUpload={async (content: string, fileName: string) => {
                const records = CallAnalyzer.parseCSV(content);
                await handleDataUpload(records);
              }}
              isLoading={isAnalyzing}
            />
          </div>
        );

      case 'dashboard':
        if (currentRecords.length === 0) {
          return <EmptyState onUpload={() => setActiveTab('upload')} />;
        }
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CallAnalyticsCharts summary={summary} callerAnalysis={callerAnalysis} />
              <ClientAnalytics callerAnalysis={callerAnalysis} numberToClient={{}} />
            </div>
            <VirtualizedTable records={filteredRecords} />
          </div>
        );

      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <ClientsManager 
              availableCallerNumbers={Array.from(new Set(currentRecords.map(r => r.callerNumber)))}
              prefixConfig={prefixConfig}
            />
            <PrefixManager 
              prefixConfig={prefixConfig}
              onConfigChange={setPrefixConfig}
            />
          </div>
        );

      case 'export':
        return <AdvancedExport 
          data={filteredRecords} 
          summary={summary}
          callerAnalysis={callerAnalysis}
          fileName="call-analysis"
        />;

      case 'ai-insights':
        return <AIInsights data={filteredRecords} />;

      case 'realtime':
        return <RealTimeMetrics />;

      case 'automation':
        return <AutomationWorkflow />;

      case 'ai-enhanced':
        return <AIEnhancedInsights data={filteredRecords} />;

      case 'ftp-import':
        return <FTPImporter />;

      default:
        return <EmptyState onUpload={() => setActiveTab('upload')} />;
    }
  };

  return (
    <ModernLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      title="Call Analytics"
      subtitle="Enterprise Suite"
    >
      {renderTabContent()}
    </ModernLayout>
  );
};

export default Index;