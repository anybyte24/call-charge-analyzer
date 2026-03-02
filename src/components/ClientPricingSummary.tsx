import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import { useExcelExport } from '@/hooks/useExcelExport';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { CallerAnalysis, CallRecord } from '@/types/call-analysis';
import { EFFECTIVE_NATIONAL_RATES, EFFECTIVE_INTERNATIONAL_RATES } from '@/utils/effective-selling-rates';
import { resolveCountryFromCategory } from '@/utils/country-name-mapping';
import { FileDown } from 'lucide-react';

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

  type Agg = {
    id: string;
    name: string;
    numbers: Set<string>;
    totalCalls: number;
    totalSeconds: number;
    myCost: number;
    revenue: number;
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

    callerAnalysis.forEach((ca) => {
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
      const clientMobileRate = Number(clientRate?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
      const clientLandlineRate = Number(clientRate?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
      const clientIntlRate = Number(clientRate?.international_rate || 0) || globalIntlSellingRate;
      const clientPremRate = Number(clientRate?.premium_rate || 0) || globalPremiumSellingRate;

      ca.categories.forEach((cat) => {
        const sec = cat.totalSeconds || 0;
        const min = sec / 60;
        const catCost = cat.cost || 0; // Costo operatore ALFA (già calcolato nel CSV)
        const catType = cat.category; // Description from number-categorizer

        // Determine category type
        const catLower = catType.toLowerCase();
        const isNationalMobile = catLower === 'mobile' || 
          ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => catLower.includes(op));
        const isNationalLandline = catLower === 'fisso' || cat.category === 'Fisso';
        const isNumeroVerde = catLower.includes('numero verde');
        const isPremium = catLower.includes('numero premium') || catLower.includes('numero speciale') ||
          catLower.includes('899') || catLower.includes('199');
        const isSpecialService = catLower.includes('servizi speciali') || catLower.includes('servizi satellitari');

        // COSTO OPERATORE: usa cat.cost dal CSV (già calcolato con tariffe ALFA)
        agg.myCost += catCost;

        // RICAVO: tariffe di vendita al cliente
        if (forfaitOnly) return; // Solo forfait, niente tariffe a consumo

        if (isNationalMobile) {
          agg.revenue += min * clientMobileRate;
        } else if (isNationalLandline) {
          agg.revenue += min * clientLandlineRate;
        } else if (isNumeroVerde) {
          // Numero verde: nessun costo/ricavo
        } else if (isPremium || isSpecialService) {
          agg.revenue += min * clientPremRate;
        } else {
          // International: resolve country name ITA→ENG
          const resolved = resolveCountryFromCategory(catType);
          if (resolved) {
            const effRate = effectiveRatesByCountry.get(resolved.countryEng);
            if (effRate) {
              const rate = resolved.isMobile ? effRate.mobile : effRate.landline;
              agg.revenue += min * rate;
            } else if (clientIntlRate > 0) {
              // Fallback: use flat international rate
              agg.revenue += min * clientIntlRate;
            }
          } else if (clientIntlRate > 0) {
            // Unknown category, try flat international rate
            agg.revenue += min * clientIntlRate;
          }
        }
      });
    });

    // Add forfait (monthly flat fee) to revenue
    for (const [key, agg] of map) {
      const clientRate = clientPricing.find((p) => p.client_id === key);
      const flat = Number(clientRate?.monthly_flat_fee || 0);
      if (flat > 0) agg.revenue += flat;
    }

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [callerAnalysis, numberToClientMap, clientPricing, globalPricing, effectiveRatesByCountry]);

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
      // National categories
      if (k === 'mobile' || ['tim', 'vodafone', 'wind', 'iliad', 'fastweb', 'tre'].some(op => k.includes(op))) return 'mobile';
      if (k === 'fisso') return 'landline';
      if (k.includes('numero verde') || k.includes('numero premium') || k.includes('numero speciale') ||
          k.includes('servizi speciali') || k.includes('servizi satellitari')) return 'special';
      // Check if it's an international category
      const resolved = resolveCountryFromCategory(c);
      if (resolved) return 'international';
      // Italian city landlines (Roma, Milano, etc.) have type 'landline' but description is city name
      return 'other';
    };
    callerAnalysis.forEach(ca => {
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
  }, [callerAnalysis, numberToClientMap]);

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

  return (
    <div className="space-y-4">
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
                              exportClientReport(records, r.name, clientNumbers, fileName);
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
