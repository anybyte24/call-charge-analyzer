import React, { useState, useCallback } from 'react';
import { useAnalysisStorage } from '@/hooks/useAnalysisStorage';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import { FileUploadAdvanced } from '@/components/FileUploadAdvanced';
import { VirtualizedTable } from '@/components/VirtualizedTable';
import { CallAnalyticsCharts } from '@/components/CallAnalyticsCharts';
import { ClientAnalytics } from '@/components/ClientAnalytics';
import { ClientsManager } from '@/components/ClientsManager';
import { PrefixManager } from '@/components/PrefixManager';
import { AIInsights } from '@/components/AIInsights';
import { AIEnhancedInsights } from '@/components/AIEnhancedInsights';
import { FTPImporter } from '@/components/FTPImporter';
import { RealTimeMetrics } from '@/components/RealTimeMetrics';
import { AutomationWorkflow } from '@/components/AutomationWorkflow';
import { AdvancedExport } from '@/components/AdvancedExport';
import { ModernLayout } from '@/components/ModernLayout';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { analyzeCallData } from '@/utils/call-analyzer';
import type { CallRecord, AnalysisResults } from '@/types/call-analysis';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentRecords, setCurrentRecords] = useState<CallRecord[]>([]);
  const [analysisData, setAnalysisData] = useState<CallRecord[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { toast } = useToast();
  const { filteredData } = useAdvancedFilters(currentRecords);

  const handleDataUpload = useCallback(async (data: CallRecord[]) => {
    try {
      setIsAnalyzing(true);
      setCurrentRecords(data);
      setAnalysisData(data);
      
      const results = await analyzeCallData(data);
      setAnalysisResults(results);
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
              onDataUpload={handleDataUpload}
              isAnalyzing={isAnalyzing}
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
              <CallAnalyticsCharts data={filteredData} />
              <ClientAnalytics data={filteredData} />
            </div>
            <VirtualizedTable data={filteredData} />
          </div>
        );

      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <ClientsManager />
            <PrefixManager />
          </div>
        );

      case 'export':
        return <AdvancedExport data={filteredData} analysisResults={analysisResults} />;

      case 'ai-insights':
        return <AIInsights data={filteredData} />;

      case 'realtime':
        return <RealTimeMetrics data={filteredData} />;

      case 'automation':
        return <AutomationWorkflow />;

      case 'ai-enhanced':
        return <AIEnhancedInsights data={filteredData} />;

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