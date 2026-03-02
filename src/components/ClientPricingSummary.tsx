import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useExcelExport } from '@/hooks/useExcelExport';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { CallerAnalysis, CallRecord } from '@/types/call-analysis';
import { EFFECTIVE_NATIONAL_RATES, EFFECTIVE_INTERNATIONAL_RATES } from '@/utils/effective-selling-rates';
import { resolveCountryFromCategory } from '@/utils/country-name-mapping';
import { FileDown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClientPricingSummaryProps {
  callerAnalysis: CallerAnalysis[];
  records: CallRecord[];
  fileName: string;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const ClientPricingSummary: React.FC<ClientPricingSummaryProps> = ({ callerAnalysis, records, fileName }) => {
  const { numberToClientMap, clientPricing, globalPricing, assignments } = useClients();
  const { exportClientReport } = useExcelExport();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Extract available months from records
  const availableMonths = React.useMemo(() => {
    const monthSet = new Set<string>();
    records.forEach(r => {
      if (r.date) {
        // date format could be DD/MM/YYYY or YYYY-MM-DD
        let m: string | null = null;
        if (r.date.includes('/')) {
          const parts = r.date.split('/');
          if (parts.length === 3) m = `${parts[2]}-${parts[1].padStart(2, '0')}`;
        } else if (r.date.includes('-')) {
          const parts = r.date.split('-');
          if (parts.length === 3 && parts[0].length === 4) m = `${parts[0]}-${parts[1]}`;
          else if (parts.length === 3 && parts[2].length === 4) m = `${parts[2]}-${parts[1]}`;
        }
        if (m) monthSet.add(m);
      }
    });
    return Array.from(monthSet).sort();
  }, [records]);

  // Filter records by selected month
  const filteredRecords = React.useMemo(() => {
    if (selectedMonth === 'all') return records;
    return records.filter(r => {
      if (!r.date) return false;
      if (r.date.includes('/')) {
        const parts = r.date.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}` === selectedMonth;
      } else if (r.date.includes('-')) {
        const parts = r.date.split('-');
        if (parts.length === 3 && parts[0].length === 4) return `${parts[0]}-${parts[1]}` === selectedMonth;
        if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1]}` === selectedMonth;
      }
      return false;
    });
  }, [records, selectedMonth]);

  // Filter callerAnalysis by records in selected month
  const filteredCallerNumbers = React.useMemo(() => {
    if (selectedMonth === 'all') return null; // use all
    const nums = new Set(filteredRecords.map(r => r.callerNumber));
    return nums;
  }, [selectedMonth, filteredRecords]);

  // Rebuild callerAnalysis from filtered records when month is selected
  const filteredCallerAnalysis = React.useMemo(() => {
    if (selectedMonth === 'all') return callerAnalysis;
    
    // Group filtered records by caller number
    const byNumber = new Map<string, CallRecord[]>();
    filteredRecords.forEach(r => {
      if (!byNumber.has(r.callerNumber)) byNumber.set(r.callerNumber, []);
      byNumber.get(r.callerNumber)!.push(r);
    });

    // Rebuild CallerAnalysis from filtered records
    return Array.from(byNumber.entries()).map(([callerNumber, recs]) => {
      const catMap = new Map<string, { count: number; totalSeconds: number; cost: number }>();
      recs.forEach(r => {
        const desc = r.category.description;
        if (!catMap.has(desc)) catMap.set(desc, { count: 0, totalSeconds: 0, cost: 0 });
        const cat = catMap.get(desc)!;
        cat.count++;
        cat.totalSeconds += r.durationSeconds;
        cat.cost += r.cost || 0;
      });
      
      const totalDuration = recs.reduce((s, r) => s + r.durationSeconds, 0);
      const categories = Array.from(catMap.entries()).map(([category, data]) => ({
        category,
        count: data.count,
        totalSeconds: data.totalSeconds,
        totalMinutes: data.totalSeconds / 60,
        totalHours: data.totalSeconds / 3600,
        formattedDuration: formatDuration(data.totalSeconds),
        cost: data.cost,
      }));

      return {
        callerNumber,
        totalCalls: recs.length,
        categories,
        totalDuration,
        formattedTotalDuration: formatDuration(totalDuration),
      } as CallerAnalysis;
    });
  }, [callerAnalysis, selectedMonth, filteredRecords]);

  type Agg = {
    id: string;
    name: string;
    numbers: Set<string>;
    totalCalls: number;
    totalSeconds: number;
    myCost: number;
    revenue: number;
    forfaitInfo?: { used: number; included: number; overage: number; overageRevenue: number };
  };

  // Build a lookup: ALFA country name (uppercase) → { landline, mobile } effective selling rate
  const effectiveRatesByCountry = React.useMemo(() => {
    const map = new Map<string, { landline: number; mobile: number }>();
    EFFECTIVE_INTERNATIONAL_RATES.forEach(r => {
      map.set(r.country, { landline: r.landline, mobile: r.mobile });
    });
    return map;
  }, []);

  const rows = React.useMemo(() => {
    const map = new Map<string, Agg>();

    // Tariffe di VENDITA globali (ricavo) per fallback
    const globalIntlSellingRate = Number(globalPricing?.international_rate || 0);
    const globalPremiumSellingRate = Number(globalPricing?.premium_rate || 0);

    filteredCallerAnalysis.forEach((ca) => {
      const clientInfo = numberToClientMap[ca.callerNumber];
      const key = clientInfo?.id || 'no-client';
      const name = clientInfo?.name || 'Senza cliente';

      if (!map.has(key)) {
        map.set(key, { id: key, name, numbers: new Set<string>(), totalCalls: 0, totalSeconds: 0, myCost: 0, revenue: 0 });
      }
      const agg = map.get(key)!;
      agg.numbers.add(ca.callerNumber);
      agg.totalCalls += ca.totalCalls;
      agg.totalSeconds += ca.totalDuration;

      // Client-specific pricing
      const clientRate = clientPricing.find((p) => p.client_id === key);
      const forfaitOnly = clientRate?.forfait_only === true;
      const forfaitMinutes = Number(clientRate?.forfait_minutes || 0);
      const clientMobileRate = Number(clientRate?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
      const clientLandlineRate = Number(clientRate?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
      const clientIntlRate = Number(clientRate?.international_rate || 0) || globalIntlSellingRate;
      const clientPremRate = Number(clientRate?.premium_rate || 0) || globalPremiumSellingRate;

      ca.categories.forEach((cat) => {
        const sec = cat.totalSeconds || 0;
        const min = sec / 60;
        const catCost = cat.cost || 0;
        const catType = cat.category;

        const catLower = catType.toLowerCase();
        const isNationalMobile = catLower === 'mobile' || 
          ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => catLower.includes(op));
        const isNationalLandline = catLower === 'fisso' || cat.category === 'Fisso';
        const isNumeroVerde = catLower.includes('numero verde');
        const isPremium = catLower.includes('numero premium') || catLower.includes('numero speciale') ||
          catLower.includes('899') || catLower.includes('199');
        const isSpecialService = catLower.includes('servizi speciali') || catLower.includes('servizi satellitari');
        // Detect Italian city landlines (e.g. "Napoli", "Palermo")
        const isItalianCity = !isNationalMobile && !isNationalLandline && !isNumeroVerde && !isPremium && !isSpecialService &&
          !resolveCountryFromCategory(catType) && !catLower.includes('internazionale') && !catLower.startsWith('00');

        // COSTO OPERATORE: usa cat.cost dal CSV
        agg.myCost += catCost;

        // RICAVO: tariffe di vendita al cliente
        if (forfaitOnly && (forfaitMinutes === 0 || !agg.forfaitInfo)) {
          // Will be handled after aggregation for overage
          return;
        }
        if (forfaitOnly) return; // skip per-minute billing for forfait

        if (isNationalMobile) {
          agg.revenue += min * clientMobileRate;
        } else if (isNationalLandline || isItalianCity) {
          agg.revenue += min * clientLandlineRate;
        } else if (isNumeroVerde) {
          // no charge
        } else if (isPremium || isSpecialService) {
          agg.revenue += clientPremRate > 0 ? min * clientPremRate : catCost;
        } else {
          const resolved = resolveCountryFromCategory(catType);
          if (resolved) {
            const effRate = effectiveRatesByCountry.get(resolved.countryEng);
            if (effRate) {
              const rate = resolved.isMobile ? effRate.mobile : effRate.landline;
              agg.revenue += min * rate;
            } else if (clientIntlRate > 0) {
              agg.revenue += min * clientIntlRate;
            }
          } else if (clientIntlRate > 0) {
            agg.revenue += min * clientIntlRate;
          }
        }
      });
    });

    // Forfait logic: add flat fee and calculate overage
    for (const [key, agg] of map) {
      const clientRate = clientPricing.find((p) => p.client_id === key);
      const flat = Number(clientRate?.monthly_flat_fee || 0);
      const forfaitOnly = clientRate?.forfait_only === true;
      const forfaitMinutes = Number(clientRate?.forfait_minutes || 0);

      if (forfaitOnly) {
        if (flat > 0) agg.revenue += flat;
        const totalMinutes = agg.totalSeconds / 60;

        if (forfaitMinutes > 0 && totalMinutes > forfaitMinutes) {
          // Calculate overage revenue per category using correct selling rates
          const overageMin = totalMinutes - forfaitMinutes;
          const clientMobileRate = Number(clientRate?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
          const clientLandlineRate = Number(clientRate?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
          const clientIntlRate = Number(clientRate?.international_rate || 0) || Number(globalPricing?.international_rate || 0);
          
          // Calculate proportional overage by category from filtered records
          const clientNumbers = Array.from(agg.numbers);
          const clientRecs = filteredRecords.filter(r => clientNumbers.includes(r.callerNumber));
          let mobileMins = 0, landlineMins = 0, intlMins = 0;
          clientRecs.forEach(r => {
            const t = r.category.type;
            const m = r.durationSeconds / 60;
            if (t === 'mobile') mobileMins += m;
            else if (t === 'landline') landlineMins += m;
            else if (t === 'international') intlMins += m;
            else landlineMins += m; // default to landline
          });
          const totalCatMins = mobileMins + landlineMins + intlMins;
          const overageRevenue = totalCatMins > 0
            ? overageMin * (
                (mobileMins / totalCatMins) * clientMobileRate +
                (landlineMins / totalCatMins) * clientLandlineRate +
                (intlMins / totalCatMins) * clientIntlRate
              )
            : overageMin * clientMobileRate;
          
          agg.revenue += overageRevenue;
          agg.forfaitInfo = {
            used: Math.round(totalMinutes),
            included: forfaitMinutes,
            overage: Math.round(overageMin),
            overageRevenue,
          };
        } else if (forfaitMinutes > 0) {
          agg.forfaitInfo = {
            used: Math.round(totalMinutes),
            included: forfaitMinutes,
            overage: 0,
            overageRevenue: 0,
          };
        }
      } else {
        if (flat > 0) agg.revenue += flat;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredCallerAnalysis, numberToClientMap, clientPricing, globalPricing, effectiveRatesByCountry]);

  const totals = React.useMemo(() => {
    const totalCost = rows.reduce((s, r) => s + r.myCost, 0);
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const totalMargin = totalRevenue - totalCost;
    const assignedClients = rows.filter((r) => r.id !== 'no-client').length;
    const unassigned = rows.find((r) => r.id === 'no-client')?.numbers.size || 0;
    return { totalCost, totalRevenue, totalMargin, assignedClients, unassigned };
  }, [rows]);

  const COLORS = ['#2563eb', '#16a34a', '#f97316', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f59e0b', '#3b82f6', '#84cc16'];

  const topByCost = rows.slice(0, 10).map(r => ({ name: r.name, cost: Number(r.myCost.toFixed(2)) }));
  const topByDuration = rows.slice(0, 10).map(r => ({ name: r.name, hours: Number((r.totalSeconds / 3600).toFixed(2)) }));
  const pieData = rows.slice(0, 8).map(r => ({ name: r.name, value: Number(r.myCost.toFixed(2)) }));

  const categoryCostMap = React.useMemo(() => {
    const m = new Map<string, Record<string, number>>();
    const norm = (c: string) => {
      const k = c.toLowerCase();
      if (k === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => k.includes(op))) return 'mobile';
      if (k === 'fisso') return 'landline';
      if (k.includes('numero verde') || k.includes('numero premium') || k.includes('numero speciale') ||
          k.includes('servizi speciali') || k.includes('servizi satellitari')) return 'special';
      const resolved = resolveCountryFromCategory(c);
      if (resolved) return 'international';
      return 'other';
    };
    filteredCallerAnalysis.forEach(ca => {
      const clientInfo = numberToClientMap[ca.callerNumber];
      const key = clientInfo?.id || 'no-client';
      if (!m.has(key)) m.set(key, {});
      const rec = m.get(key)!;
      ca.categories.forEach(cat => {
        const catKey = norm(cat.category);
        const cost = Number(cat.cost || 0);
        rec[catKey] = (rec[catKey] || 0) + cost;
      });
    });
    return m;
  }, [filteredCallerAnalysis, numberToClientMap]);

  const categoryKeys = ['mobile', 'landline', 'international', 'special'];
  const stacked = rows.slice(0, 7).map(r => {
    const rec = categoryCostMap.get(r.id) || {};
    return {
      name: r.name,
      mobile: Number(((rec as any).mobile || 0).toFixed(2)),
      landline: Number(((rec as any).landline || 0).toFixed(2)),
      international: Number(((rec as any).international || 0).toFixed(2)),
      special: Number(((rec as any).special || 0).toFixed(2)),
    };
  });

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    const names = ['', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    return `${names[parseInt(mo)] || mo} ${y}`;
  };

  return (
    <div className="space-y-4">
      {/* Month selector */}
      {availableMonths.length > 1 && (
        <Card className="bg-background/70 backdrop-blur-sm border shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap">Filtra per mese:</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Tutti i mesi ({records.length} record)</SelectItem>
                  {availableMonths.map(m => (
                    <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMonth !== 'all' && (
                <Badge variant="secondary">{filteredRecords.length} record</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-background/70 backdrop-blur-sm border shadow-lg">
          <CardHeader><CardTitle>Top 10 Clienti per Costo</CardTitle></CardHeader>
          <CardContent style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByCost}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="cost" name="Costo (€)" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-background/70 backdrop-blur-sm border shadow-lg">
          <CardHeader><CardTitle>Top 10 Clienti per Durata</CardTitle></CardHeader>
          <CardContent style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByDuration}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="hours" name="Ore" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-background/70 backdrop-blur-sm border shadow-lg">
          <CardHeader><CardTitle>Quota Costo per Cliente</CardTitle></CardHeader>
          <CardContent style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} label dataKey="value" nameKey="name" outerRadius={110}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-background/70 backdrop-blur-sm border shadow-lg">
          <CardHeader><CardTitle>Costo per Categoria (Top 7 Clienti)</CardTitle></CardHeader>
          <CardContent style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stacked}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <ReTooltip />
                <Legend />
                {categoryKeys.map((k, i) => (
                  <Bar key={k} dataKey={k} stackId="a" fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background/70 backdrop-blur-sm border shadow-lg">
        <CardHeader><CardTitle>Analisi Clienti (tariffe salvate)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Numeri</TableHead>
                  <TableHead>Chiamate</TableHead>
                  <TableHead>Durata</TableHead>
                  <TableHead>Forfait</TableHead>
                  <TableHead>Costo Operatore</TableHead>
                  <TableHead>Ricavo</TableHead>
                  <TableHead>Margine</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const margin = r.revenue - r.myCost;
                  const marginPct = r.revenue > 0 ? (margin / r.revenue) * 100 : (r.myCost > 0 ? -100 : 0);
                  return (
                    <TableRow key={r.id + r.name}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.numbers.size}</TableCell>
                      <TableCell>{r.totalCalls}</TableCell>
                      <TableCell className="font-mono text-sm">{formatDuration(r.totalSeconds)}</TableCell>
                      <TableCell>
                        {r.forfaitInfo ? (
                          <div className="text-xs space-y-0.5">
                            <div className={r.forfaitInfo.overage > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                              {r.forfaitInfo.used} / {r.forfaitInfo.included} min
                            </div>
                            {r.forfaitInfo.overage > 0 && (
                              <div className="flex items-center gap-1 text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                +{r.forfaitInfo.overage} min esubero (€{r.forfaitInfo.overageRevenue.toFixed(2)})
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-destructive">€{r.myCost.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-primary">€{r.revenue.toFixed(2)}</TableCell>
                      <TableCell className={`font-semibold ${margin >= 0 ? 'text-green-600' : 'text-destructive'}`}>€{margin.toFixed(2)}</TableCell>
                      <TableCell>{marginPct.toFixed(1)}%</TableCell>
                      <TableCell>
                        {r.id !== 'no-client' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const clientNumbers = (assignments || [])
                                .filter(a => a.client_id === r.id)
                                .map(a => a.caller_number);
                              const cp = clientPricing.find(p => p.client_id === r.id);
                              exportClientReport(
                                filteredRecords.length > 0 ? filteredRecords : records,
                                r.name,
                                clientNumbers,
                                fileName,
                                cp ? {
                                  mobile_rate: Number(cp.mobile_rate),
                                  landline_rate: Number(cp.landline_rate),
                                  international_rate: Number(cp.international_rate),
                                  premium_rate: Number(cp.premium_rate),
                                  monthly_flat_fee: Number(cp.monthly_flat_fee),
                                  forfait_only: Boolean(cp.forfait_only),
                                  forfait_minutes: Number(cp.forfait_minutes),
                                } : undefined
                              );
                            }}
                          >
                            <FileDown className="h-4 w-4 mr-1" />
                            Excel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Costo operatore: <span className="font-medium">€{totals.totalCost.toFixed(2)}</span> • Ricavo: <span className="font-medium">€{totals.totalRevenue.toFixed(2)}</span> • Margine: <span className={`font-medium ${totals.totalMargin >= 0 ? 'text-green-600' : 'text-destructive'}`}>€{totals.totalMargin.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPricingSummary;
