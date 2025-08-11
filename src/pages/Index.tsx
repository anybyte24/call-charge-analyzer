import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import FileUploadAdvanced from '@/components/FileUploadAdvanced';
import Dashboard from '@/components/Dashboard';
import CallerAnalysisTable from '@/components/CallerAnalysisTable';
import HistoryPanel from '@/components/HistoryPanel';
import PrefixManager from '@/components/PrefixManager';
import ExportPanel from '@/components/ExportPanel';
import UnknownNumbersManager from '@/components/UnknownNumbersManager';
import ClientsManager from '@/components/ClientsManager';
import { useAnalysisStorage } from '@/hooks/useAnalysisStorage';
import { CallAnalyzer } from '@/utils/call-analyzer';
import { AnalysisSession, CallRecord, PrefixConfig } from '@/types/call-analysis';
import { BarChart3, Users, History, Upload, Settings, Download, AlertTriangle, Sparkles, Briefcase } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import CompanyCostsManager from '@/components/CompanyCostsManager';

const Index = () => {
  const { saveSession } = useAnalysisStorage();
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [currentRecords, setCurrentRecords] = useState<CallRecord[]>([]);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [prefixConfig, setPrefixConfig] = useState<PrefixConfig[]>(CallAnalyzer.defaultPrefixConfig);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [unknownNumbers, setUnknownNumbers] = useState<string[]>([]);
const availableCallerNumbers = useMemo(() => currentSession ? Array.from(new Set(currentSession.callerAnalysis.map(c => c.callerNumber))) : [], [currentSession]);
  const { numberToClientMap } = useClients();

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

      // Extract unknown numbers for review
      const unknowns = records
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      setUnknownNumbers(unknowns);

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
      const unknownCount = unknowns.length;

      // Save session automatically
      if (currentSession) {
        await saveSession(currentSession, records);
      }

      toast({
        title: "Analisi completata",
        description: `Processati ${records.length} record. Costo totale: €${totalCost.toFixed(2)}${unknownCount > 0 ? ` - ${unknownCount} numeri non riconosciuti` : ''}`,
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
    setCurrentRecords([]);
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

      // Update unknown numbers
      const unknowns = updatedRecords
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      setUnknownNumbers(unknowns);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Call Analytics Enterprise
          </h1>
          <p className="text-gray-600 text-lg">
            Sistema avanzato per l'analisi e fatturazione delle chiamate telefoniche
          </p>
        </div>

        {/* Main Tabs Interface */}
        <Tabs defaultValue="upload" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-8 w-fit bg-white/70 backdrop-blur-sm border shadow-lg rounded-xl p-1">
              <TabsTrigger value="upload" className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Carica</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="callers" className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Chiamanti</span>
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center space-x-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Clienti</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Prefissi</span>
              </TabsTrigger>
              <TabsTrigger value="unknown" className="flex items-center space-x-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Non Riconosciuti</span>
                {unknownNumbers.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {unknownNumbers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Storico</span>
              </TabsTrigger>
            </TabsList>
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
              <TabsContent value="upload" className="mt-0">
                <div className="space-y-6">
                  <FileUploadAdvanced 
                    onFileUpload={handleFileUpload}
                    isLoading={isAnalyzing}
                  />
                  {!currentSession && (
                    <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border shadow-sm">
                      <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Benvenuto in Call Analytics
                      </h3>
                      <p className="text-gray-600">
                        Carica il tuo primo file CSV per iniziare l'analisi delle chiamate
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dashboard" className="mt-0">
                {currentSession ? (
            <Dashboard 
              summary={currentSession.summary} 
              callerAnalysis={currentSession.callerAnalysis}
              totalRecords={currentSession.totalRecords}
              fileName={currentSession.fileName}
              records={currentRecords}
            />
                ) : (
                  <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border shadow-sm">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun dato da visualizzare
                    </h3>
                    <p className="text-gray-500">
                      Carica un file CSV nella sezione "Carica" per vedere i dati qui
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="callers" className="mt-0">
                {currentSession ? (
                  <CallerAnalysisTable callerAnalysis={currentSession.callerAnalysis} numberToClient={numberToClientMap} />
                ) : (
                  <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border shadow-sm">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun chiamante da analizzare
                    </h3>
                    <p className="text-gray-500">
                      Carica un file CSV per vedere l'analisi dei chiamanti
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <PrefixManager
                  prefixConfig={prefixConfig}
                  onConfigChange={handlePrefixConfigChange}
                />
              </TabsContent>

              <TabsContent value="clients" className="mt-0">
                {currentSession ? (
                  <ClientsManager availableCallerNumbers={availableCallerNumbers} />
                ) : (
                  <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border shadow-sm">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun cliente da gestire
                    </h3>
                    <p className="text-gray-500">
                      Carica un file CSV nella sezione "Carica" per popolare i numeri disponibili e associare i clienti
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unknown" className="mt-0">
                <UnknownNumbersManager
                  unknownNumbers={unknownNumbers}
                  prefixConfig={prefixConfig}
                  onPrefixConfigChange={handlePrefixConfigChange}
                  onUnknownNumbersChange={setUnknownNumbers}
                />
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                {currentSession && currentRecords.length > 0 ? (
                  <ExportPanel
                    records={currentRecords}
                    summary={currentSession.summary}
                    callerAnalysis={currentSession.callerAnalysis}
                    fileName={currentSession.fileName}
                  />
                ) : (
                  <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border shadow-sm">
                    <Download className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun dato da esportare
                    </h3>
                    <p className="text-gray-500">
                      Carica e analizza un file CSV per abilitare le funzioni di export
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border shadow-sm p-6">
                  <HistoryPanel 
                    sessions={sessions}
                    onSessionSelect={handleSessionSelect}
                    currentSessionId={currentSession?.id}
                  />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
