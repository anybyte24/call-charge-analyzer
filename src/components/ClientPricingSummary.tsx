import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClients } from '@/hooks/useClients';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend, PieChart, Pie, Cell } from 'recharts';

import { CallerAnalysis, PrefixConfig } from '@/types/call-analysis';

interface ClientPricingSummaryProps {
  callerAnalysis: CallerAnalysis[];
  prefixConfig: PrefixConfig[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const ClientPricingSummary: React.FC<ClientPricingSummaryProps> = ({ callerAnalysis }) => {
  const { numberToClientMap, clientPricing, globalPricing } = useClients();

  type Agg = {
    id: string;
    name: string;
    numbers: Set<string>;
    totalCalls: number;
    totalSeconds: number;
    myCost: number; // costo a me dai dati del CSV
    revenue: number; // ricavo calcolato da tariffe
  };

  const rows = React.useMemo(() => {
    const map = new Map<string, Agg>();

    const intlRate = Number(globalPricing?.international_rate || 0);
    const premiumRate = Number(globalPricing?.premium_rate || 0);

    callerAnalysis.forEach((ca) => {
      const clientInfo = numberToClientMap[ca.callerNumber];
      const key = clientInfo?.id || 'no-client';
      const name = clientInfo?.name || 'Senza cliente';

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name,
          numbers: new Set<string>(),
          totalCalls: 0,
          totalSeconds: 0,
          myCost: 0,
          revenue: 0,
        });
      }
      const agg = map.get(key)!;

      agg.numbers.add(ca.callerNumber);
      agg.totalCalls += ca.totalCalls;
      agg.totalSeconds += ca.totalDuration;

      // costo effettivo (dai dati)
      ca.categories.forEach((cat) => {
        agg.myCost += Number(cat.cost || 0);
      });

// ricavo: tariffe per cliente
const clientRate = clientPricing.find((p) => p.client_id === key);
const mobileRate = Number(clientRate?.mobile_rate || 0);
const landlineRate = Number(clientRate?.landline_rate || 0);
const flat = Number(clientRate?.monthly_flat_fee || 0);
const onlyFlat = Boolean(clientRate?.forfait_only);

let revenueForCaller = 0; // forfait si somma una sola volta a fine cliente
let mobileSec = 0, landlineSec = 0, intlSec = 0, premiumSec = 0;

ca.categories.forEach((cat) => {
  const sec = cat.totalSeconds || 0;
  switch (cat.category.toLowerCase()) {
    case 'mobile':
      mobileSec += sec;
      break;
    case 'landline':
    case 'fisso':
      landlineSec += sec;
      break;
    case 'international':
    case 'internazionale':
      intlSec += sec;
      break;
    case 'special':
    case 'numero speciale':
    case 'numero premium':
      premiumSec += sec;
      break;
    default:
      break;
  }
});

if (!onlyFlat) {
  revenueForCaller += (mobileSec / 60) * mobileRate;
  revenueForCaller += (landlineSec / 60) * landlineRate;
  revenueForCaller += (intlSec / 60) * intlRate;
  revenueForCaller += (premiumSec / 60) * premiumRate;
}

agg.revenue += revenueForCaller;
    });

// aggiungi forfait una volta per cliente
for (const [key, agg] of map) {
  const clientRate = clientPricing.find((p) => p.client_id === key);
  const flat = Number(clientRate?.monthly_flat_fee || 0);
  if (flat > 0) agg.revenue += flat;
}

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [callerAnalysis, numberToClientMap, clientPricing, globalPricing]);

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
      if (k.includes('mobile')) return 'mobile';
      if (k.includes('landline') || k.includes('fisso')) return 'landline';
      if (k.includes('international') || k.includes('internazionale')) return 'international';
      if (k.includes('special') || k.includes('premium') || k.includes('numero')) return 'special';
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
      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle>Top 10 Clienti per Costo</CardTitle>
          </CardHeader>
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

        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle>Top 10 Clienti per Durata</CardTitle>
          </CardHeader>
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

        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle>Quota Costo per Cliente</CardTitle>
          </CardHeader>
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

        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle>Costo per Categoria (Top 7 Clienti)</CardTitle>
          </CardHeader>
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

      {/* Table */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle>Analisi Clienti (tariffe salvate)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Numeri</TableHead>
                  <TableHead>Chiamate</TableHead>
                  <TableHead>Durata</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Ricavo</TableHead>
                  <TableHead>Margine</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const margin = r.revenue - r.myCost;
                  const marginPct = r.revenue > 0 ? (margin / r.revenue) * 100 : 0;
                  return (
                    <TableRow key={r.id + r.name}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.numbers.size}</TableCell>
                      <TableCell>{r.totalCalls}</TableCell>
                      <TableCell className="font-mono text-sm">{formatDuration(r.totalSeconds)}</TableCell>
                      <TableCell className="font-semibold text-green-600">€{r.myCost.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-indigo-600">€{r.revenue.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-orange-600">€{margin.toFixed(2)}</TableCell>
                      <TableCell>{marginPct.toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Totale costo: <span className="font-medium">€{totals.totalCost.toFixed(2)}</span> • Ricavo: <span className="font-medium">€{totals.totalRevenue.toFixed(2)}</span> • Margine: <span className="font-medium">€{totals.totalMargin.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPricingSummary;
