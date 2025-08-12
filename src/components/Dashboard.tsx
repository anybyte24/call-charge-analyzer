
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone, Clock, TrendingUp, Users, Euro, BarChart3, PieChart, Activity, Filter, Table, RefreshCw } from 'lucide-react';
import { CallSummary, CallerAnalysis, CallRecord, PrefixConfig } from '@/types/call-analysis';
import CallAnalyticsCharts from './CallAnalyticsCharts';
import HourlyDistributionChart from './HourlyDistributionChart';
import TopNumbersAnalysis from './TopNumbersAnalysis';
import AdvancedFilters from './AdvancedFilters';
import VirtualizedTable from './VirtualizedTable';
import TooltipInfo, { KPITooltips } from './TooltipInfo';
import { ResponsiveKPIGrid, ResponsiveContainer } from './ResponsiveLayout';
import { useAnalysisStorage } from '@/hooks/useAnalysisStorage';
import ClientPricingSummary from './ClientPricingSummary';


interface DashboardProps {
  summary: CallSummary[];
  callerAnalysis: CallerAnalysis[];
  totalRecords: number;
  fileName: string;
  records: CallRecord[];
  prefixConfig?: PrefixConfig[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  summary, 
  callerAnalysis, 
  totalRecords, 
  fileName,
  records,
  prefixConfig
}) => {
  const [filteredRecords, setFilteredRecords] = React.useState<CallRecord[]>(records);
  const { recalculateCosts, loading: recalculateLoading } = useAnalysisStorage();
  const totalCalls = summary.reduce((sum, cat) => sum + cat.count, 0);
  const totalDuration = summary.reduce((sum, cat) => sum + cat.totalSeconds, 0);
  const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);
  

  const handleRecalculateCosts = async () => {
    console.log('🔄 Starting manual cost recalculation...');
    try {
      const success = await recalculateCosts();
      console.log('✅ Recalculation completed:', success);
      if (success) {
        // Ricarica la pagina per mostrare i dati aggiornati
        console.log('🔄 Reloading page to show updated data...');
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error during recalculation:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mobile': return 'from-blue-500 to-blue-600';
      case 'fisso': return 'from-green-500 to-green-600';
      case 'numero speciale': 
      case 'numero verde':
      case 'numero premium': return 'from-red-500 to-red-600';
      case 'usa/canada':
      case 'regno unito':
      case 'francia':
      case 'germania':
      case 'spagna':
      case 'svizzera':
      case 'austria':
      case 'cina':
      case 'giappone':
      case 'india':
      case 'brasile':
      case 'russia':
      case 'internazionale sconosciuto': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mobile': return '📱';
      case 'fisso': return '☎️';
      case 'numero speciale': 
      case 'numero premium': return '🔥';
      case 'numero verde': return '💚';
      case 'usa/canada': return '🇺🇸';
      case 'regno unito': return '🇬🇧';
      case 'francia': return '🇫🇷';
      case 'germania': return '🇩🇪';
      case 'spagna': return '🇪🇸';
      case 'svizzera': return '🇨🇭';
      case 'austria': return '🇦🇹';
      case 'cina': return '🇨🇳';
      case 'giappone': return '🇯🇵';
      case 'india': return '🇮🇳';
      case 'brasile': return '🇧🇷';
      case 'russia': return '🇷🇺';
      case 'internazionale sconosciuto': return '🌍';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Analisi Chiamate Telefoniche</h1>
          </div>
          <Button
            onClick={handleRecalculateCosts}
            disabled={recalculateLoading}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${recalculateLoading ? 'animate-spin' : ''}`} />
            {recalculateLoading ? 'Ricalcolando...' : 'Ricalcola Costi'}
          </Button>
        </div>
        <p className="text-blue-100 text-lg">File: {fileName}</p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>Record processati: {totalRecords}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            <span>Chiamanti unici: {callerAnalysis.length}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <ResponsiveContainer>
        <ResponsiveKPIGrid>
          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>Totale Chiamate</span>
                <TooltipInfo content={KPITooltips.totalCalls} />
              </CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalCalls.toLocaleString()}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{width: '100%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>Durata Totale</span>
                <TooltipInfo content={KPITooltips.totalDuration} />
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalHours}h {totalMinutes}m</div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.floor(totalDuration / 60)} minuti totali
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>Costo Totale</span>
                <TooltipInfo content={KPITooltips.totalCost} />
              </CardTitle>
              <Euro className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{totalCost.toFixed(2)}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-green-600 h-1.5 rounded-full" style={{width: '85%'}}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>Numeri Chiamanti</span>
                <TooltipInfo content={KPITooltips.uniqueCallers} />
              </CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{callerAnalysis.length}</div>
              <p className="text-xs text-gray-500 mt-1">Numeri unici</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>Costo Medio</span>
                <TooltipInfo content={KPITooltips.averageCost} />
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                €{totalCalls > 0 ? (totalCost / totalCalls).toFixed(3) : '0.000'}
              </div>
              <p className="text-xs text-gray-500 mt-1">Per chiamata</p>
            </CardContent>
          </Card>
        </ResponsiveKPIGrid>
      </ResponsiveContainer>

      {/* Tabs for different views */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 bg-white/70 backdrop-blur-sm border shadow-lg">
          <TabsTrigger value="summary">Riepilogo</TabsTrigger>
          <TabsTrigger value="charts">Grafici</TabsTrigger>
          <TabsTrigger value="hourly">Distribuzione</TabsTrigger>
          <TabsTrigger value="numbers">Numeri</TabsTrigger>
          <TabsTrigger value="clients">Clienti</TabsTrigger>
          <TabsTrigger value="filters">Filtri</TabsTrigger>
          <TabsTrigger value="table">Tabella</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {/* Category Summary */}
          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Riepilogo per Categoria</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.map((category, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.category)} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.category}</h3>
                            <p className="text-sm text-gray-500">{category.count} chiamate</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className={`w-full bg-gray-200 rounded-full h-2`}>
                          <div 
                            className={`bg-gradient-to-r ${getCategoryColor(category.category)} h-2 rounded-full transition-all duration-500`}
                            style={{width: `${Math.min((category.count / totalCalls) * 100, 100)}%`}}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-700">{category.formattedDuration}</p>
                          <p className="text-lg font-bold text-green-600">
                            €{category.cost?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <CallAnalyticsCharts summary={summary} callerAnalysis={callerAnalysis} />
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <HourlyDistributionChart records={records} />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <ClientPricingSummary callerAnalysis={callerAnalysis} prefixConfig={prefixConfig} />
        </TabsContent>


        <TabsContent value="filters" className="space-y-4">
          <AdvancedFilters 
            records={records} 
            onFilteredRecords={setFilteredRecords}
          />
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <VirtualizedTable 
            records={filteredRecords}
            height={600}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
