
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import CallerAnalysisTable from '@/components/CallerAnalysisTable';
import HistoryPanel from '@/components/HistoryPanel';
import { CallAnalyzer } from '@/utils/call-analyzer';
import { AnalysisSession, CallRecord } from '@/types/call-analysis';
import { BarChart3, Users, History, Upload } from 'lucide-react';

const Index = () => {
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsAnalyzing(true);
    
    try {
      // Parse CSV
      const records = CallAnalyzer.parseCSV(content);
      
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
        callerAnalysis
      };

      setCurrentSession(session);
      setSessions(prev => [session, ...prev]);

      toast({
        title: "Analisi completata",
        description: `Processati ${records.length} record da ${fileName}`,
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
          <div className="lg:col-span-1">
            <HistoryPanel 
              sessions={sessions}
              onSessionSelect={handleSessionSelect}
              currentSessionId={currentSession?.id}
            />
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="callers" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Chiamanti</span>
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
