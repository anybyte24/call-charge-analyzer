import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Clock, TrendingUp, Users, Euro, BarChart3, PieChart, Activity, Filter, Table, RefreshCw, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Search } from 'lucide-react';
import { CallSummary, CallerAnalysis, CallRecord } from '@/types/call-analysis';
import CallAnalyticsCharts from './CallAnalyticsCharts';
import HourlyDistributionChart from './HourlyDistributionChart';
import TopNumbersAnalysis from './TopNumbersAnalysis';
import AdvancedFilters from './AdvancedFilters';
import VirtualizedTable from './VirtualizedTable';
import TooltipInfo, { KPITooltips } from './TooltipInfo';
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
  const [drillDownCategory, setDrillDownCategory] = React.useState<string | null>(null);
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
        else if (isPremium) rev += premRate > 0 ? min * premRate : (cat.cost || 0);
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

  // Calculate per-category revenue for the summary cards
  const categoryRevenue = React.useMemo(() => {
    const revMap = new Map<string, number>();
    
    callerAnalysis.forEach(ca => {
      const clientInfo = numberToClientMap[ca.callerNumber];
      const clientId = clientInfo?.id;
      const cp = clientId ? clientPricing.find(p => p.client_id === clientId) : null;
      if (cp?.forfait_only) return; // skip forfait for per-category rev
      
      const effRatesMap = new Map<string, { landline: number; mobile: number }>();
      EFFECTIVE_INTERNATIONAL_RATES.forEach(r => effRatesMap.set(r.country, { landline: r.landline, mobile: r.mobile }));
      const globalIntlRate = Number(globalPricing?.international_rate || 0);
      const globalPremRate = Number(globalPricing?.premium_rate || 0);
      const mobileRate = Number(cp?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
      const landlineRate = Number(cp?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
      const intlRate = Number(cp?.international_rate || 0) || globalIntlRate;
      const premRate = Number(cp?.premium_rate || 0) || globalPremRate;

      ca.categories.forEach(cat => {
        const min = cat.totalSeconds / 60;
        const catLower = cat.category.toLowerCase();
        let rev = 0;

        // Determine macro category name
        let macroName = cat.category;
        if (catLower === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => catLower.includes(op))) {
          macroName = 'Mobile';
          rev = min * mobileRate;
        } else if (catLower === 'fisso') {
          macroName = 'Fisso';
          rev = min * landlineRate;
        } else if (catLower.includes('numero verde')) {
          macroName = 'Numero Verde';
          rev = 0;
        } else if (catLower.includes('numero premium') || catLower.includes('numero speciale')) {
          macroName = 'Numero Premium';
          rev = premRate > 0 ? min * premRate : (cat.cost || 0);
        } else {
          // International or unrecognized
          const resolved = resolveCountryFromCategory(cat.category);
          if (resolved) {
            const eff = effRatesMap.get(resolved.countryEng);
            if (eff) rev = min * (resolved.isMobile ? eff.mobile : eff.landline);
            else rev = min * intlRate;
          } else {
            // NOT Fisso — keep as its own category (unrecognized international)
            rev = min * intlRate;
          }
        }

        revMap.set(macroName, (revMap.get(macroName) || 0) + rev);
      });
    });

    return revMap;
  }, [callerAnalysis, numberToClientMap, clientPricing, globalPricing]);

  // Group summary into macro categories for display
  const macroSummary = React.useMemo(() => {
    const map = new Map<string, { count: number; totalSeconds: number; cost: number }>();
    
    summary.forEach(cat => {
      const catLower = cat.category.toLowerCase();
      let macro = cat.category;
      
      if (catLower === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => catLower.includes(op))) {
        macro = 'Mobile';
      } else if (catLower === 'fisso') {
        macro = 'Fisso';
      } else if (catLower.includes('numero verde')) {
        macro = 'Numero Verde';
      } else if (catLower.includes('numero premium') || catLower.includes('numero speciale')) {
        macro = 'Numero Premium';
      }
      // else keep original name (international countries or unrecognized)

      const existing = map.get(macro) || { count: 0, totalSeconds: 0, cost: 0 };
      existing.count += cat.count;
      existing.totalSeconds += cat.totalSeconds;
      existing.cost += cat.cost || 0;
      map.set(macro, existing);
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      ...data,
      revenue: categoryRevenue.get(name) || 0,
      icon: getCategoryIcon(name),
    })).sort((a, b) => b.count - a.count);
  }, [summary, categoryRevenue]);

  // Drill-down: compute per-called-number detail from callerAnalysis (same source as cards)
  const drillDownData = React.useMemo(() => {
    if (!drillDownCategory) return [];

    const effRatesMap = new Map<string, { landline: number; mobile: number }>();
    EFFECTIVE_INTERNATIONAL_RATES.forEach(r => effRatesMap.set(r.country, { landline: r.landline, mobile: r.mobile }));
    const globalIntlRate = Number(globalPricing?.international_rate || 0);
    const globalPremRate = Number(globalPricing?.premium_rate || 0);

    // Determine which callerAnalysis sub-categories belong to this macro
    const isMacroMatch = (catName: string) => {
      const cl = catName.toLowerCase();
      if (drillDownCategory === 'Mobile') {
        return cl === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => cl.includes(op));
      }
      if (drillDownCategory === 'Fisso') return cl === 'fisso';
      if (drillDownCategory === 'Numero Verde') return cl.includes('numero verde');
      if (drillDownCategory === 'Numero Premium') return cl.includes('numero premium') || cl.includes('numero speciale');
      return catName === drillDownCategory;
    };

    // Aggregate per caller (since we don't have per-called-number from callerAnalysis)
    // We use records if available, but fall back to callerAnalysis summary
    if (records.length > 0) {
      const numberMap = new Map<string, { number: string; callerNumbers: Set<string>; calls: number; seconds: number; cost: number; revenue: number; category: string }>();
      
      records.forEach(r => {
        // Check if this record's category matches the macro
        const catDesc = r.category.description;
        const catType = r.category.type;
        const cl = catDesc.toLowerCase();
        
        let matches = false;
        if (drillDownCategory === 'Mobile') {
          matches = catType === 'mobile' || cl === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => cl.includes(op));
        } else if (drillDownCategory === 'Fisso') {
          matches = catType === 'landline';
        } else if (drillDownCategory === 'Numero Verde') {
          matches = cl.includes('numero verde');
        } else if (drillDownCategory === 'Numero Premium') {
          matches = cl.includes('numero premium') || cl.includes('numero speciale');
        } else {
          // International - check via generateSummary macro logic
          const resolved = resolveCountryFromCategory(catDesc);
          if (resolved) matches = catDesc === drillDownCategory || catDesc.startsWith(drillDownCategory);
          else matches = catDesc === drillDownCategory;
        }
        
        if (!matches) return;

        // Compute revenue for this record
        const callerClient = numberToClientMap[r.callerNumber];
        const cp = callerClient?.id ? clientPricing.find(p => p.client_id === callerClient.id) : null;
        const mobileRate = Number(cp?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
        const landlineRate = Number(cp?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
        const intlRate = Number(cp?.international_rate || 0) || globalIntlRate;
        const premRate = Number(cp?.premium_rate || 0) || globalPremRate;

        const min = r.durationSeconds / 60;
        let rev = 0;
        if (catType === 'mobile' || cl === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => cl.includes(op))) {
          rev = min * mobileRate;
        } else if (catType === 'landline' && !cl.includes('fisso -') && cl === 'fisso') {
          rev = min * landlineRate;
        } else if (cl.includes('numero verde')) {
          rev = 0;
        } else if (cl.includes('numero premium') || cl.includes('numero speciale')) {
          rev = premRate > 0 ? min * premRate : (r.cost || 0);
        } else {
          const resolved = resolveCountryFromCategory(catDesc);
          if (resolved) {
            const eff = effRatesMap.get(resolved.countryEng);
            if (eff) rev = min * (resolved.isMobile ? eff.mobile : eff.landline);
            else rev = min * intlRate;
          } else {
            rev = min * intlRate;
          }
        }

        const existing = numberMap.get(r.calledNumber);
        if (existing) {
          existing.calls++;
          existing.seconds += r.durationSeconds;
          existing.cost += r.cost || 0;
          existing.revenue += rev;
          existing.callerNumbers.add(r.callerNumber);
        } else {
          numberMap.set(r.calledNumber, {
            number: r.calledNumber,
            callerNumbers: new Set([r.callerNumber]),
            calls: 1,
            seconds: r.durationSeconds,
            cost: r.cost || 0,
            revenue: rev,
            category: r.category.description,
          });
        }
      });

      return Array.from(numberMap.values())
        .map(r => ({ ...r, callers: r.callerNumbers.size }))
        .sort((a, b) => (a.revenue - a.cost) - (b.revenue - b.cost));
    }

    // Fallback: use callerAnalysis when records are not available
    const result: { number: string; calls: number; seconds: number; cost: number; revenue: number; category: string; callers: number }[] = [];
    callerAnalysis.forEach(ca => {
      const clientInfo = numberToClientMap[ca.callerNumber];
      const clientId = clientInfo?.id;
      const cp = clientId ? clientPricing.find(p => p.client_id === clientId) : null;
      if (cp?.forfait_only) return;

      const mobileRate = Number(cp?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
      const landlineRate = Number(cp?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
      const intlRate = Number(cp?.international_rate || 0) || globalIntlRate;
      const premRate = Number(cp?.premium_rate || 0) || globalPremRate;

      ca.categories.forEach(cat => {
        if (!isMacroMatch(cat.category)) return;
        const min = cat.totalSeconds / 60;
        let rev = 0;
        const cl = cat.category.toLowerCase();
        if (cl === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => cl.includes(op))) rev = min * mobileRate;
        else if (cl === 'fisso') rev = min * landlineRate;
        else if (cl.includes('numero verde')) rev = 0;
        else if (cl.includes('numero premium') || cl.includes('numero speciale')) rev = premRate > 0 ? min * premRate : (cat.cost || 0);
        else {
          const resolved = resolveCountryFromCategory(cat.category);
          if (resolved) {
            const eff = effRatesMap.get(resolved.countryEng);
            if (eff) rev = min * (resolved.isMobile ? eff.mobile : eff.landline);
            else rev = min * intlRate;
          } else rev = min * intlRate;
        }

        result.push({
          number: ca.callerNumber,
          calls: cat.count,
          seconds: cat.totalSeconds,
          cost: cat.cost || 0,
          revenue: rev,
          category: `${cat.category} (chiamante)`,
          callers: 1,
        });
      });
    });

    return result.sort((a, b) => (a.revenue - a.cost) - (b.revenue - b.cost));
  }, [drillDownCategory, records, callerAnalysis, numberToClientMap, clientPricing, globalPricing]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryBarColor = (name: string) => {
    const n = name.toLowerCase();
    if (n === 'mobile') return 'bg-kpi-calls';
    if (n === 'fisso') return 'bg-kpi-cost';
    if (n.includes('premium') || n.includes('speciale')) return 'bg-destructive';
    if (n.includes('verde')) return 'bg-kpi-margin';
    return 'bg-kpi-callers';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-primary-foreground"
        style={{ background: 'linear-gradient(135deg, hsl(var(--gradient-hero-from)), hsl(var(--gradient-hero-to)))' }}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50"></div>
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Analisi Chiamate Telefoniche</h1>
              <p className="text-white/70 text-sm mt-0.5">File: {fileName}</p>
            </div>
          </div>
          <Button
            onClick={handleRecalculateCosts}
            disabled={recalculateLoading}
            variant="secondary"
            className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${recalculateLoading ? 'animate-spin' : ''}`} />
            {recalculateLoading ? 'Ricalcolando...' : 'Ricalcola Costi'}
          </Button>
        </div>
        <div className="relative flex items-center gap-6 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>Record: <strong className="text-white">{totalRecords.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>Chiamanti: <strong className="text-white">{callerAnalysis.length}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 1: Operativo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Totale Chiamate */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Chiamate</span>
              <div className="p-1.5 rounded-lg bg-kpi-calls/10">
                <Phone className="h-3.5 w-3.5 text-kpi-calls" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalCalls.toLocaleString()}</div>
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-kpi-calls" style={{ width: '100%' }} />
            </div>
          </CardContent>
        </Card>

        {/* Durata Totale */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Durata</span>
              <div className="p-1.5 rounded-lg bg-kpi-duration/10">
                <Clock className="h-3.5 w-3.5 text-kpi-duration" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalHours}h {totalMinutes}m</div>
            <p className="text-xs text-muted-foreground mt-1">{Math.floor(totalDuration / 60).toLocaleString()} min</p>
          </CardContent>
        </Card>

        {/* Costo Operatore */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Costo Op.</span>
              <div className="p-1.5 rounded-lg bg-kpi-cost/10">
                <Euro className="h-3.5 w-3.5 text-kpi-cost" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">€{totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">€{totalCalls > 0 ? (totalCost / totalCalls).toFixed(3) : '0.000'}/chiamata</p>
          </CardContent>
        </Card>

        {/* Ricavo */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ricavo</span>
              <div className="p-1.5 rounded-lg bg-kpi-revenue/10">
                <Wallet className="h-3.5 w-3.5 text-kpi-revenue" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Da fatturare</p>
          </CardContent>
        </Card>

        {/* Chiamanti */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Chiamanti</span>
              <div className="p-1.5 rounded-lg bg-kpi-callers/10">
                <Users className="h-3.5 w-3.5 text-kpi-callers" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{callerAnalysis.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Numeri unici</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Row 2: Finanziario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Margine Totale */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${totalMargin >= 0 ? 'bg-kpi-cost/10' : 'bg-destructive/10'}`}>
                {totalMargin >= 0
                  ? <ArrowUpRight className="h-5 w-5 text-kpi-cost" />
                  : <ArrowDownRight className="h-5 w-5 text-destructive" />}
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Margine Totale</span>
                <div className={`text-2xl font-bold ${totalMargin >= 0 ? 'text-kpi-cost' : 'text-destructive'}`}>
                  €{totalMargin.toFixed(2)}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Ricavo <strong className="text-foreground">€{totalRevenue.toFixed(2)}</strong></div>
                <div>Costo <strong className="text-foreground">€{totalCost.toFixed(2)}</strong></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Margine % */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${marginPct >= 0 ? 'bg-kpi-cost/10' : 'bg-destructive/10'}`}>
                <Activity className={`h-5 w-5 ${marginPct >= 0 ? 'text-kpi-cost' : 'text-destructive'}`} />
              </div>
              <div className="flex-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Margine %</span>
                <div className={`text-2xl font-bold ${marginPct >= 0 ? 'text-kpi-cost' : 'text-destructive'}`}>
                  {marginPct.toFixed(1)}%
                </div>
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${marginPct >= 0 ? 'bg-kpi-cost' : 'bg-destructive'}`}
                    style={{ width: `${Math.min(Math.abs(marginPct), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="bg-card border shadow-sm h-11 p-1 gap-0.5">
          <TabsTrigger value="summary" className="text-xs sm:text-sm">Riepilogo</TabsTrigger>
          <TabsTrigger value="charts" className="text-xs sm:text-sm">Grafici</TabsTrigger>
          <TabsTrigger value="hourly" className="text-xs sm:text-sm">Distribuzione</TabsTrigger>
          <TabsTrigger value="numbers" className="text-xs sm:text-sm">Numeri</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs sm:text-sm">Clienti</TabsTrigger>
          <TabsTrigger value="filters" className="text-xs sm:text-sm">Filtri</TabsTrigger>
          <TabsTrigger value="table" className="text-xs sm:text-sm">Tabella</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Riepilogo per Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {macroSummary.map((cat, index) => {
                  const margin = cat.revenue - cat.cost;
                  const pct = cat.count / totalCalls * 100;
                  return (
                    <div key={index} className="group rounded-xl border bg-card p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => setDrillDownCategory(cat.name)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{cat.icon}</span>
                          <div>
                            <h3 className="font-semibold text-sm text-card-foreground">{cat.name}</h3>
                            <p className="text-xs text-muted-foreground">{cat.count.toLocaleString()} chiamate · {pct.toFixed(1)}%</p>
                          </div>
                        </div>
                        <Search className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="h-1.5 rounded-full bg-muted mb-3 overflow-hidden">
                        <div className={`h-full rounded-full ${getCategoryBarColor(cat.name)} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Durata</span>
                          <p className="font-semibold text-card-foreground mt-0.5">{formatDuration(cat.totalSeconds)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Costo Op.</span>
                          <p className="font-semibold text-card-foreground mt-0.5">€{cat.cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ricavo</span>
                          <p className="font-semibold text-primary mt-0.5">€{cat.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                      {cat.revenue > 0 && (
                        <div className={`mt-2 pt-2 border-t text-xs ${margin >= 0 ? 'text-kpi-cost' : 'text-destructive'}`}>
                          Margine: €{margin.toFixed(2)} ({cat.revenue > 0 ? ((margin / cat.revenue) * 100).toFixed(0) : 0}%)
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* Drill-down Dialog */}
      <Dialog open={!!drillDownCategory} onOpenChange={(open) => !open && setDrillDownCategory(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Dettaglio: {drillDownCategory}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Summary totals */}
            {(() => {
              const totCalls = drillDownData.reduce((s, r) => s + r.calls, 0);
              const totCost = drillDownData.reduce((s, r) => s + r.cost, 0);
              const totRev = drillDownData.reduce((s, r) => s + r.revenue, 0);
              const totMargin = totRev - totCost;
              const lossCount = drillDownData.filter(r => r.revenue - r.cost < -0.001).length;
              const cardData = macroSummary.find(c => c.name === drillDownCategory);
              const callsMismatch = cardData && totCalls !== cardData.count;
              return (
                <>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-xs text-muted-foreground">Chiamate</div>
                      <div className="font-bold text-sm">{totCalls.toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-xs text-muted-foreground">Costo Op.</div>
                      <div className="font-bold text-sm">€{totCost.toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="text-xs text-muted-foreground">Ricavo</div>
                      <div className="font-bold text-sm text-primary">€{totRev.toFixed(2)}</div>
                    </div>
                    <div className={`rounded-lg p-2 ${totMargin >= 0 ? 'bg-kpi-cost/10' : 'bg-destructive/10'}`}>
                      <div className="text-xs text-muted-foreground">Margine</div>
                      <div className={`font-bold text-sm ${totMargin >= 0 ? 'text-kpi-cost' : 'text-destructive'}`}>€{totMargin.toFixed(2)}</div>
                    </div>
                  </div>
                  {callsMismatch && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-xs text-amber-700 flex items-center gap-2">
                      ⚠️ La card mostra {cardData!.count} chiamate ma i records disponibili ne contengono {totCalls}. Prova a ricaricare il file per dati aggiornati.
                    </div>
                  )}
                  {lossCount > 0 && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive flex items-center gap-2">
                      <span className="font-semibold">⚠️ {lossCount} {records.length > 0 ? 'numeri' : 'chiamanti'} in perdita</span>
                      <span className="text-destructive/70">— evidenziati in rosso, ordinati dal peggiore</span>
                    </div>
                  )}
                </>
              );
            })()}
            <p className="text-xs text-muted-foreground">
              {drillDownData.length} {records.length > 0 ? 'numeri chiamati' : 'chiamanti'} — ordinati per margine crescente
            </p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 font-medium">Numero Chiamato</th>
                    <th className="text-left p-2 font-medium">Sotto-cat.</th>
                    <th className="text-right p-2 font-medium">Chiam.</th>
                    <th className="text-right p-2 font-medium">Durata</th>
                    <th className="text-right p-2 font-medium">Costo Op.</th>
                    <th className="text-right p-2 font-medium">Ricavo</th>
                    <th className="text-right p-2 font-medium">Margine</th>
                  </tr>
                </thead>
                <tbody>
                  {drillDownData.slice(0, 100).map((row, i) => {
                    const margin = row.revenue - row.cost;
                    const isLoss = margin < -0.001;
                    return (
                      <tr key={i} className={`border-t ${isLoss ? 'bg-destructive/5' : 'hover:bg-muted/30'}`}>
                        <td className="p-2 font-mono">{row.number}</td>
                        <td className="p-2 text-muted-foreground">{row.category}</td>
                        <td className="p-2 text-right">{row.calls}</td>
                        <td className="p-2 text-right">{formatDuration(row.seconds)}</td>
                        <td className="p-2 text-right">€{row.cost.toFixed(2)}</td>
                        <td className="p-2 text-right text-primary font-medium">€{row.revenue.toFixed(2)}</td>
                        <td className={`p-2 text-right font-semibold ${isLoss ? 'text-destructive' : 'text-kpi-cost'}`}>
                          €{margin.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {drillDownData.length > 100 && (
              <p className="text-xs text-muted-foreground text-center">Mostrati i primi 100 di {drillDownData.length} numeri</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
