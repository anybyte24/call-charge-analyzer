import React, { useEffect, useMemo, useState } from 'react';
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
import { BarChart3, Users, History, Upload, Settings, Download, AlertTriangle, Sparkles, Briefcase, Phone } from 'lucide-react';
import { useClients } from '@/hooks/useClients';

const Index = () => {
  const { saveSession, loadSessions, deleteSession, loading: storageLoading } = useAnalysisStorage();
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [currentRecords, setCurrentRecords] = useState<CallRecord[]>([]);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [prefixConfig, setPrefixConfig] = useState<PrefixConfig[]>(CallAnalyzer.defaultPrefixConfig);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [unknownNumbers, setUnknownNumbers] = useState<string[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const availableCallerNumbers = useMemo(() => currentSession ? Array.from(new Set(currentSession.callerAnalysis.map(c => c.callerNumber))) : [], [currentSession]);
  const { numberToClientMap, clientPricing, globalPricing } = useClients();

  // Load sessions from Supabase on mount
  useEffect(() => {
    if (sessionsLoaded) return;
    const load = async () => {
      const loaded = await loadSessions();
      if (loaded.length > 0) {
        setSessions(loaded);
      }
      setSessionsLoaded(true);
    };
    load();
  }, [loadSessions, sessionsLoaded]);

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsAnalyzing(true);
    
    try {
      const records = CallAnalyzer.parseCSV(content, prefixConfig);
      
      if (records.length === 0) {
        toast({
          title: "Errore",
          description: "Il file CSV non contiene dati validi",
          variant: "destructive"
        });
        return;
      }

      const unknowns = records
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      setUnknownNumbers(unknowns);

      const summary = CallAnalyzer.generateSummary(records);
      const callerAnalysis = CallAnalyzer.generateCallerAnalysis(records);

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

      await saveSession(session, records);

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
    setCurrentRecords(session.records || []);
    
    if (session.records && session.records.length > 0) {
      const unknowns = session.records
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      setUnknownNumbers(unknowns);
    }
  };

  const handleSessionDelete = async (sessionId: string) => {
    const success = await deleteSession(sessionId);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setCurrentRecords([]);
      }
    }
  };

  const handlePrefixConfigChange = (newConfig: PrefixConfig[]) => {
    setPrefixConfig(newConfig);
    
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

      const unknowns = updatedRecords
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      setUnknownNumbers(unknowns);
    }
  };

  const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="p-4 rounded-2xl bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto">
        {/* Main Tabs Interface */}
        <Tabs defaultValue="upload" className="min-h-screen">
          {/* Top Navigation Bar */}
          <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b">
            <div className="px-4 lg:px-6">
              <div className="flex items-center h-14 gap-4">
                <div className="flex items-center gap-2.5 mr-4 shrink-0">
                  <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(var(--gradient-hero-from)), hsl(var(--gradient-hero-to)))' }}>
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-foreground hidden md:inline">Call Analytics</span>
                </div>
                <TabsList className="h-9 bg-transparent border-0 p-0 gap-0.5">
                  <TabsTrigger value="upload" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Carica</span>
                  </TabsTrigger>
                  <TabsTrigger value="dashboard" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="callers" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Chiamanti</span>
                  </TabsTrigger>
                  <TabsTrigger value="clients" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Clienti</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <Settings className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Prefissi</span>
                  </TabsTrigger>
                  <TabsTrigger value="unknown" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm relative">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Non Riconosciuti</span>
                    {unknownNumbers.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {unknownNumbers.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="export" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Export</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="h-8 px-3 text-xs font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <History className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Storico</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex">
            {/* Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 border-r min-h-[calc(100vh-3.5rem)] p-4 space-y-4 bg-card/50">
              <HistoryPanel 
                sessions={sessions}
                onSessionSelect={handleSessionSelect}
                onSessionDelete={handleSessionDelete}
                currentSessionId={currentSession?.id}
                loading={storageLoading}
              />
              
              {currentSession && currentRecords.length > 0 && (
                <ExportPanel
                  records={currentRecords}
                  summary={currentSession.summary}
                  callerAnalysis={currentSession.callerAnalysis}
                  fileName={currentSession.fileName}
                />
              )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 p-4 lg:p-6">
              <TabsContent value="upload" className="mt-0">
                <div className="space-y-6 max-w-2xl mx-auto">
                  <FileUploadAdvanced 
                    onFileUpload={handleFileUpload}
                    isLoading={isAnalyzing}
                  />
                  {!currentSession && (
                    <EmptyState
                      icon={Sparkles}
                      title="Benvenuto in Call Analytics"
                      description="Carica il tuo primo file CSV per iniziare l'analisi delle chiamate telefoniche"
                    />
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
                  <EmptyState icon={BarChart3} title="Nessun dato" description="Carica un file CSV nella sezione Carica per vedere la dashboard" />
                )}
              </TabsContent>

              <TabsContent value="callers" className="mt-0">
                {currentSession ? (
                  <CallerAnalysisTable
                    callerAnalysis={currentSession.callerAnalysis}
                    numberToClient={numberToClientMap}
                    clientPricing={clientPricing}
                    globalPricing={globalPricing}
                    records={currentRecords}
                  />
                ) : (
                  <EmptyState icon={Users} title="Nessun chiamante" description="Carica un file CSV per vedere l'analisi dei chiamanti" />
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <PrefixManager
                  prefixConfig={prefixConfig}
                  onConfigChange={handlePrefixConfigChange}
                />
              </TabsContent>

              <TabsContent value="clients" className="mt-0">
                <ClientsManager availableCallerNumbers={availableCallerNumbers} />
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
                  <EmptyState icon={Download} title="Nessun dato da esportare" description="Carica e analizza un file CSV per abilitare le funzioni di export" />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <HistoryPanel 
                  sessions={sessions}
                  onSessionSelect={handleSessionSelect}
                  onSessionDelete={handleSessionDelete}
                  currentSessionId={currentSession?.id}
                  loading={storageLoading}
                />
              </TabsContent>
            </main>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
