import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { StaggeredAnimation } from '@/components/StaggeredAnimation';
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
import { CostRecalculator } from '@/utils/cost-recalculator';
import { AnalysisSession, CallRecord, PrefixConfig } from '@/types/call-analysis';
import { 
  BarChart3, Users, History, Upload, Settings, Download, AlertTriangle, 
  Sparkles, Briefcase, Banknote, TrendingUp, Zap, Activity, Layers 
} from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import CompanyCostsManager from '@/components/CompanyCostsManager';
import OcrTariffImporter from '@/components/OcrTariffImporter';
import YearlyAnalytics from '@/components/YearlyAnalytics';

const Index = () => {
  const { saveSession, loadSessions } = useAnalysisStorage();
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [currentRecords, setCurrentRecords] = useState<CallRecord[]>([]);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [prefixConfig, setPrefixConfig] = useState<PrefixConfig[]>(CallAnalyzer.defaultPrefixConfig);
  const [companyConfig, setCompanyConfig] = useState<PrefixConfig[]>(() =>
    CallAnalyzer.defaultPrefixConfig.map(p =>
      p.category === 'landline'
        ? { ...p, costPerMinute: 0.0059 }
        : p.category === 'mobile'
          ? { ...p, costPerMinute: 0.0159 }
          : p
    )
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [unknownNumbers, setUnknownNumbers] = useState<string[]>([]);
const availableCallerNumbers = useMemo(() => currentSession ? Array.from(new Set(currentSession.callerAnalysis.map(c => c.callerNumber))) : [], [currentSession]);
  const { numberToClientMap } = useClients();

  React.useEffect(() => {
    (async () => {
      const loaded = await loadSessions();
      if (loaded && loaded.length > 0) setSessions(loaded);
    })();
  }, [loadSessions]);

  const handleFileUpload = async (content: string, fileName: string) => {
    setIsAnalyzing(true);
    
    try {
      // Parse CSV con configurazione prefissi corrente, poi applica costi aziendali
      const parsed = CallAnalyzer.parseCSV(content, prefixConfig);
      const records = CostRecalculator.recalculateAllCosts(parsed, companyConfig);
      
      if (records.length === 0) {
        toast({
          title: "Errore",
          description: "Il file CSV non contiene dati validi",
          variant: "destructive"
        });
        return;
      }

      // Estrai numeri sconosciuti
      const unknowns = records
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      setUnknownNumbers(unknowns);

      // Genera analisi
      const summary = CallAnalyzer.generateSummary(records);
      const callerAnalysis = CallAnalyzer.generateCallerAnalysis(records);

      // Crea sessione
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

      // Salva sessione automaticamente
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
    
    // Ricalcola usando i costi aziendali se esiste una sessione
    if (currentSession && currentRecords.length > 0) {
      const updatedRecords = CostRecalculator.recalculateAllCosts(currentRecords, companyConfig);

      const summary = CallAnalyzer.generateSummary(updatedRecords);
      const callerAnalysis = CallAnalyzer.generateCallerAnalysis(updatedRecords);

      setCurrentSession({
        ...currentSession,
        summary,
        callerAnalysis,
        prefixConfig: [...newConfig]
      });
      setCurrentRecords(updatedRecords);

      // Aggiorna numeri non riconosciuti
      const unknowns = updatedRecords
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      
      setUnknownNumbers(unknowns);
    }
  };

  const handleCompanyConfigChange = (newConfig: PrefixConfig[]) => {
    setCompanyConfig(newConfig);

    if (currentSession && currentRecords.length > 0) {
      const updatedRecords = CostRecalculator.recalculateAllCosts(currentRecords, newConfig);

      const summary = CallAnalyzer.generateSummary(updatedRecords);
      const callerAnalysis = CallAnalyzer.generateCallerAnalysis(updatedRecords);

      setCurrentSession({
        ...currentSession,
        summary,
        callerAnalysis
      });
      setCurrentRecords(updatedRecords);

      const unknowns = updatedRecords
        .filter(record => record.category.type === 'unknown')
        .map(record => record.calledNumber)
        .filter((value, index, self) => self.indexOf(value) === index);
      setUnknownNumbers(unknowns);
    }
  };

  return (
    <>
      <SEO 
        title="Call Charge Analyzer - Dashboard Analisi Costi Telefonate VOIP"
        description="Dashboard professionale per l'analisi dei costi delle telefonate VOIP. Monitora, analizza e ottimizza le spese telefoniche della tua azienda con report dettagliati."
        keywords="dashboard telefonie, analisi costi VOIP, gestione chiamate aziendali, report telefonici, ottimizzazione costi telefonia"
      />
      
      {/* Modern Background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Floating Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-brand-500/3 rounded-full blur-3xl animate-float" />
        </div>

        {/* Header with Theme Toggle */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <StaggeredAnimation delay={150}>
                <div className="flex items-center justify-center mb-6">
                  <ModernCard variant="glass" className="p-4 hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <BarChart3 className="h-12 w-12 text-primary animate-bounce-gentle" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full animate-pulse" />
                    </div>
                  </ModernCard>
                </div>
                
                <h1 className="text-5xl font-bold gradient-text mb-4 text-balance">
                  Call Analytics
                  <span className="block text-3xl font-normal text-muted-foreground mt-2">
                    Enterprise Suite
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                  Sistema avanzato per l'analisi e fatturazione delle chiamate telefoniche con 
                  <span className="text-primary font-medium"> AI-powered insights</span>
                </p>
              </StaggeredAnimation>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>

        {/* Main Tabs Interface */}
        <Tabs defaultValue="upload" className="space-y-8">
          <div className="flex justify-center">
            <ModernCard variant="glass" className="p-2">
              <TabsList className="grid grid-cols-10 w-fit bg-transparent gap-1">
                <TabsTrigger 
                  value="upload" 
                  className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Carica</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="callers" 
                  className="flex items-center space-x-2 data-[state=active]:bg-brand-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Chiamanti</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="flex items-center space-x-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Clienti</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="company-costs" 
                  className="flex items-center space-x-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <Banknote className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Costi</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="yearly" 
                  className="flex items-center space-x-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Annuale</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center space-x-2 data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Prefissi</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="unknown" 
                  className="flex items-center space-x-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent relative"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Non Riconosciuti</span>
                  {unknownNumbers.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center animate-pulse">
                      {unknownNumbers.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="export" 
                  className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Export</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-4 py-2 transition-all duration-200 hover:bg-accent"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Storico</span>
                </TabsTrigger>
              </TabsList>
            </ModernCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Modern Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <ModernCard variant="glass" className="p-6">
                <HistoryPanel 
                  sessions={sessions}
                  onSessionSelect={handleSessionSelect}
                  currentSessionId={currentSession?.id}
                />
              </ModernCard>
              
              {currentSession && currentRecords.length > 0 && (
                <ModernCard variant="elevated" className="p-6">
                  <ExportPanel
                    records={currentRecords}
                    summary={currentSession.summary}
                    callerAnalysis={currentSession.callerAnalysis}
                    fileName={currentSession.fileName}
                  />
                </ModernCard>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <TabsContent value="upload" className="mt-0">
                <ModernCard variant="elevated" className="p-8">
                  <div className="space-y-8">
                    <FileUploadAdvanced 
                      onFileUpload={handleFileUpload}
                      isLoading={isAnalyzing}
                    />
                    {!currentSession && (
                      <div className="text-center py-16">
                        <ModernCard variant="glass" className="p-8 max-w-md mx-auto">
                          <div className="space-y-6">
                            <div className="relative mx-auto w-20 h-20">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary to-brand-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                              <div className="relative bg-gradient-to-r from-primary to-brand-500 rounded-full p-4 text-white">
                                <Zap className="h-12 w-12 animate-bounce-gentle" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h3 className="text-2xl font-bold gradient-text">
                                Benvenuto in Call Analytics
                              </h3>
                              <p className="text-muted-foreground text-lg">
                                Carica il tuo primo file CSV per iniziare l'analisi avanzata delle chiamate
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <Layers className="h-4 w-4" />
                              <span>Powered by AI Analytics</span>
                            </div>
                          </div>
                        </ModernCard>
                      </div>
                    )}
                  </div>
                </ModernCard>
              </TabsContent>

              <TabsContent value="dashboard" className="mt-0">
                {currentSession ? (
            <Dashboard 
              summary={currentSession.summary} 
              callerAnalysis={currentSession.callerAnalysis}
              totalRecords={currentSession.totalRecords}
              fileName={currentSession.fileName}
              records={currentRecords}
              prefixConfig={prefixConfig}
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
                  <CallerAnalysisTable callerAnalysis={currentSession.callerAnalysis} numberToClient={numberToClientMap} records={currentRecords} prefixConfig={prefixConfig} />
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
                  <ClientsManager availableCallerNumbers={availableCallerNumbers} prefixConfig={prefixConfig} />
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

              <TabsContent value="company-costs" className="mt-0">
                <div className="space-y-4">
                  <OcrTariffImporter
                    companyConfig={companyConfig}
                    onConfigChange={handleCompanyConfigChange}
                  />
                  <CompanyCostsManager
                    companyConfig={companyConfig}
                    onConfigChange={handleCompanyConfigChange}
                  />
                </div>
</TabsContent>

<TabsContent value="yearly" className="mt-0">
  <YearlyAnalytics sessions={sessions} />
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
    </>
  );
};

export default Index;
