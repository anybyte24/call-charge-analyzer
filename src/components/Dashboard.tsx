
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Phone, Clock, TrendingUp, Users, Euro, BarChart3, PieChart, Activity, Filter, Table, RefreshCw, TrendingDown } from 'lucide-react';
import { CallSummary, CallerAnalysis, CallRecord } from '@/types/call-analysis';
import CallAnalyticsCharts from './CallAnalyticsCharts';
import HourlyDistributionChart from './HourlyDistributionChart';
import TopNumbersAnalysis from './TopNumbersAnalysis';
import AdvancedFilters from './AdvancedFilters';
import VirtualizedTable from './VirtualizedTable';
import TooltipInfo, { KPITooltips } from './TooltipInfo';
import { ResponsiveKPIGrid, ResponsiveContainer } from './ResponsiveLayout';
import { useAnalysisStorage } from '@/hooks/useAnalysisStorage';
import ClientPricingSummary from './ClientPricingSummary';
import { useClients } from '@/hooks/useClients';
import { EFFECTIVE_NATIONAL_RATES, EFFECTIVE_INTERNATIONAL_RATES } from '@/utils/effective-selling-rates';
import { resolveCountryFromCategory } from '@/utils/country-name-mapping';


interface DashboardProps {
  summary: CallSummary[];
  callerAnalysis: CallerAnalysis[];
  totalRecords: number;
  fileName: string;
  records: CallRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  summary, 
  callerAnalysis, 
  totalRecords, 
  fileName,
  records
}) => {
  const { numberToClientMap, clientPricing, globalPricing } = useClients();
  const [filteredRecords, setFilteredRecords] = React.useState<CallRecord[]>(records);
  const { recalculateCosts, loading: recalculateLoading } = useAnalysisStorage();
  const totalCalls = summary.reduce((sum, cat) => sum + cat.count, 0);
  const totalDuration = summary.reduce((sum, cat) => sum + cat.totalSeconds, 0);
  const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);

  // Calculate total revenue from client pricing
  const { totalRevenue, totalMargin, marginPct } = React.useMemo(() => {
    const effRatesMap = new Map<string, { landline: number; mobile: number }>();
    EFFECTIVE_INTERNATIONAL_RATES.forEach(r => effRatesMap.set(r.country, { landline: r.landline, mobile: r.mobile }));
    const globalIntlRate = Number(globalPricing?.international_rate || 0);
    const globalPremRate = Number(globalPricing?.premium_rate || 0);

    let rev = 0;
    callerAnalysis.forEach(ca => {
      const clientInfo = numberToClientMap[ca.callerNumber];
      const clientId = clientInfo?.id;
      const cp = clientId ? clientPricing.find(p => p.client_id === clientId) : null;
      const mobileRate = Number(cp?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
      const landlineRate = Number(cp?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
      const intlRate = Number(cp?.international_rate || 0) || globalIntlRate;
      const premRate = Number(cp?.premium_rate || 0) || globalPremRate;
      const forfaitOnly = cp?.forfait_only === true;

      if (forfaitOnly) {
        rev += Number(cp?.monthly_flat_fee || 0);
        return;
      }

      ca.categories.forEach(cat => {
        const min = cat.totalSeconds / 60;
        const catLower = cat.category.toLowerCase();
        const isMobile = catLower === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => catLower.includes(op));
        const isLandline = catLower === 'fisso';
        const isVerde = catLower.includes('numero verde');
        const isPremium = catLower.includes('numero premium') || catLower.includes('numero speciale');

        if (isMobile) rev += min * mobileRate;
        else if (isLandline) rev += min * landlineRate;
        else if (isVerde) { /* no charge */ }
        else if (isPremium) rev += min * premRate;
        else {
          const resolved = resolveCountryFromCategory(cat.category);
          if (resolved) {
            const eff = effRatesMap.get(resolved.countryEng);
            if (eff) rev += min * (resolved.isMobile ? eff.mobile : eff.landline);
            else rev += min * intlRate;
          } else {
            rev += min * landlineRate;
          }
        }
      });

      // Add flat fee if any (non-forfait)
      if (Number(cp?.monthly_flat_fee || 0) > 0) rev += Number(cp!.monthly_flat_fee);
    });

    const margin = rev - totalCost;
    const pct = rev > 0 ? (margin / rev) * 100 : 0;
    return { totalRevenue: rev, totalMargin: margin, marginPct: pct };
  }, [callerAnalysis, numberToClientMap, clientPricing, globalPricing, totalCost]);
  

  const handleRecalculateCosts = async () => {
    try {
      await recalculateCosts();
    } catch (error) {
      console.error('Error during recalculation:', error);
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

          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>Margine Totale</span>
              </CardTitle>
              <TrendingDown className={`h-4 w-4 ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{totalMargin.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Ricavo €{totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-1">
                <span>Margine %</span>
              </CardTitle>
              <Activity className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${marginPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marginPct.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className={`${marginPct >= 0 ? 'bg-green-600' : 'bg-red-600'} h-1.5 rounded-full`} style={{width: `${Math.min(Math.abs(marginPct), 100)}%`}}></div>
              </div>
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

        <TabsContent value="numbers" className="space-y-4">
          <TopNumbersAnalysis records={records} />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <ClientPricingSummary callerAnalysis={callerAnalysis} records={records} fileName={fileName} />
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
