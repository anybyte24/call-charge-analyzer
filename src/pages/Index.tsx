
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import CallerAnalysisTable from '@/components/CallerAnalysisTable';
import HistoryPanel from '@/components/HistoryPanel';
import PrefixManager from '@/components/PrefixManager';
import ExportPanel from '@/components/ExportPanel';
import { CallAnalyzer } from '@/utils/call-analyzer';
import { AnalysisSession, CallRecord, PrefixConfig } from '@/types/call-analysis';
import { BarChart3, Users, History, Upload, Settings, Download } from 'lucide-react';

const Index = () => {
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [currentRecords, setCurrentRecords] = useState<CallRecord[]>([]);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [prefixConfig, setPrefixConfig] = useState<PrefixConfig[]>(CallAnalyzer.defaultPrefixConfig);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsAnalyzing(true);
    
    try {
      // Parse CSV with current prefix configuration
      const records = CallAnalyzer.parseCSV(content, prefixConfig);
      
      if (records.length === 0) {
        toast({
          title: "Errore",
          description: "Il file CSV non contiene dati validi",
          variant: "destructive"
        });
        return;
      }

      // Generate analysis
      const summary = CallAnalyzer.generateSummary(records);
      const callerAnalysis = CallAnalyzer.generateCallerAnalysis(records);

      // Create session
      const session: AnalysisSession = {
        id: Date.now().toString(),
        fileName,
        uploadDate: new Date().toISOString(),
        totalRecords: records.length,
        summary,
        callerAnalysis,
        prefixConfig: [...prefixConfig]
      };

      setCurrentSession(session);
      setCurrentRecords(records);
      setSessions(prev => [session, ...prev]);

      const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);

      toast({
        title: "Analisi completata",
        description: `Processati ${records.length} record. Costo totale: €${totalCost.toFixed(2)}`,
      });

    } catch (error) {
      console.error('Error analyzing file:', error);
      toast({
        title: "Errore nell'analisi",
        description: "Si è verificato un errore durante l'analisi del file",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSessionSelect = (session: AnalysisSession) => {
    setCurrentSession(session);
    // Re-generate records from session data if needed
    setCurrentRecords([]); // We don't store full records in session to save space
  };

  const handlePrefixConfigChange = (newConfig: PrefixConfig[]) => {
    setPrefixConfig(newConfig);
    
    // Re-analyze current session if exists
    if (currentSession && currentRecords.length > 0) {
      const updatedRecords = currentRecords.map(record => {
        const categoryWithCost = CallAnalyzer.categorizeNumber(record.calledNumber, newConfig);
        return {
          ...record,
          category: {
            type: categoryWithCost.type,
            description: categoryWithCost.description
          },
          cost: (record.durationSeconds / 60) * categoryWithCost.costPerMinute
        };
      });

      const summary = CallAnalyzer.generateSummary(updatedRecords);
      const callerAnalysis = CallAnalyzer.generateCallerAnalysis(updatedRecords);

      setCurrentSession({
        ...currentSession,
        summary,
        callerAnalysis,
        prefixConfig: [...newConfig]
      });
      setCurrentRecords(updatedRecords);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Call Analytics Enterprise
          </h1>
          <p className="text-gray-600">
            Sistema avanzato per l'analisi e fatturazione delle chiamate telefoniche
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <HistoryPanel 
              sessions={sessions}
              onSessionSelect={handleSessionSelect}
              currentSessionId={currentSession?.id}
            />
            
            {currentSession && currentRecords.length > 0 && (
              <ExportPanel
                records={currentRecords}
                summary={currentSession.summary}
                callerAnalysis={currentSession.callerAnalysis}
                fileName={currentSession.fileName}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!currentSession ? (
              <div className="space-y-6">
                <FileUpload 
                  onFileUpload={handleFileUpload}
                  isLoading={isAnalyzing}
                />
                <div className="text-center py-12">
                  <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Carica il primo file CSV
                  </h3>
                  <p className="text-gray-500">
                    Inizia caricando un file CSV con i dati delle chiamate per generare il tuo primo report
                  </p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="callers" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Chiamanti</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Prefissi</span>
                  </TabsTrigger>
                  <TabsTrigger value="export" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Nuovo File</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center space-x-2">
                    <History className="h-4 w-4" />
                    <span>Storico</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <Dashboard 
                    summary={currentSession.summary}
                    callerAnalysis={currentSession.callerAnalysis}
                    totalRecords={currentSession.totalRecords}
                    fileName={currentSession.fileName}
                  />
                </TabsContent>

                <TabsContent value="callers">
                  <CallerAnalysisTable callerAnalysis={currentSession.callerAnalysis} />
                </TabsContent>

                <TabsContent value="settings">
                  <PrefixManager
                    prefixConfig={prefixConfig}
                    onConfigChange={handlePrefixConfigChange}
                  />
                </TabsContent>

                <TabsContent value="export">
                  {currentRecords.length > 0 ? (
                    <ExportPanel
                      records={currentRecords}
                      summary={currentSession.summary}
                      callerAnalysis={currentSession.callerAnalysis}
                      fileName={currentSession.fileName}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Download className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Ricarica il file per abilitare le funzioni di export
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload">
                  <FileUpload 
                    onFileUpload={handleFileUpload}
                    isLoading={isAnalyzing}
                  />
                </TabsContent>

                <TabsContent value="history">
                  <HistoryPanel 
                    sessions={sessions}
                    onSessionSelect={handleSessionSelect}
                    currentSessionId={currentSession?.id}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
