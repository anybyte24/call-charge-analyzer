import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CallerAnalysis } from '@/types/call-analysis';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Euro, PiggyBank, Briefcase, Clock, TrendingUp } from 'lucide-react';

interface ClientAnalyticsProps {
  callerAnalysis: CallerAnalysis[];
  numberToClient: Record<string, { id: string; name: string; color?: string | null }>;
}

type RevenueMode = 'rate' | 'markup';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const COLORS = ['#2563eb', '#16a34a', '#f97316', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f59e0b', '#3b82f6', '#84cc16'];

const ClientAnalytics: React.FC<ClientAnalyticsProps> = ({ callerAnalysis, numberToClient }) => {
  const [mode, setMode] = React.useState<RevenueMode>('rate');
  const [ratePerMinuteMobile, setRatePerMinuteMobile] = React.useState<number>(0.12);
  const [ratePerMinuteLandline, setRatePerMinuteLandline] = React.useState<number>(0.08);
  const [markupPercentMobile, setMarkupPercentMobile] = React.useState<number>(30);
  const [markupPercentLandline, setMarkupPercentLandline] = React.useState<number>(30);

  const clients = React.useMemo(() => {
    type Agg = {
      id: string;
      name: string;
      color?: string | null;
      totalCalls: number;
      totalSeconds: number;
      totalCost: number;
      numbers: Set<string>;
      categories: Record<string, { count: number; seconds: number; cost: number }>
    };
    const map = new Map<string, Agg>();

    callerAnalysis.forEach(ca => {
      const client = numberToClient[ca.callerNumber];
      const key = client?.name || 'Senza cliente';
      const id = client?.id || 'no-client';
      const color = client?.color;

      if (!map.has(key)) {
        map.set(key, { id, name: key, color, totalCalls: 0, totalSeconds: 0, totalCost: 0, numbers: new Set(), categories: {} });
      }
      const agg = map.get(key)!;
      agg.totalCalls += ca.totalCalls;
      agg.totalSeconds += ca.totalDuration;
      agg.numbers.add(ca.callerNumber);
      ca.categories.forEach(cat => {
        const c = agg.categories[cat.category] || { count: 0, seconds: 0, cost: 0 };
        c.count += cat.count;
        c.seconds += cat.totalSeconds;
        c.cost += cat.cost || 0;
        agg.categories[cat.category] = c;
        agg.totalCost += cat.cost || 0;
      });
    });

    const arr = Array.from(map.values()).map(v => {
      const minutesMobile = (v.categories['mobile']?.seconds || 0) / 60;
      const minutesLandline = (v.categories['landline']?.seconds || 0) / 60;
      const revenueRate = minutesMobile * ratePerMinuteMobile + minutesLandline * ratePerMinuteLandline;
      const costMobile = v.categories['mobile']?.cost || 0;
      const costLandline = v.categories['landline']?.cost || 0;
      const costOther = Math.max(0, v.totalCost - costMobile - costLandline);
      const revenueMarkup = (costMobile * (1 + markupPercentMobile / 100)) + (costLandline * (1 + markupPercentLandline / 100)) + costOther;
      const revenue = mode === 'rate' ? revenueRate : revenueMarkup;
      const margin = revenue - v.totalCost;
      const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
      return {
        ...v,
        numbersCount: v.numbers.size,
        revenue,
        margin,
        marginPct
      };
    });

    // Sort by cost desc
    return arr.sort((a, b) => b.totalCost - a.totalCost);
  }, [callerAnalysis, numberToClient, ratePerMinuteMobile, ratePerMinuteLandline, markupPercentMobile, markupPercentLandline, mode]);

  const totals = React.useMemo(() => {
    const totalCost = clients.reduce((s, c) => s + c.totalCost, 0);
    const totalRevenue = clients.reduce((s, c) => s + c.revenue, 0);
    const totalMargin = totalRevenue - totalCost;
    const assignedClients = clients.filter(c => c.id !== 'no-client').length;
    const unassigned = clients.find(c => c.id === 'no-client')?.numbersCount || 0;
    return { totalCost, totalRevenue, totalMargin, assignedClients, unassigned };
  }, [clients]);

  const topByCost = clients.slice(0, 10).map(c => ({ name: c.name, cost: Number(c.totalCost.toFixed(2)) }));
  const topByDuration = clients.slice(0, 10).map(c => ({ name: c.name, hours: Number((c.totalSeconds / 3600).toFixed(2)) }));
  const pieData = clients.slice(0, 8).map((c, i) => ({ name: c.name, value: Number(c.totalCost.toFixed(2)) }));

  // Prepare stacked by category for top 7 clients
  const categoryKeys = Array.from(new Set(clients.flatMap(c => Object.keys(c.categories))));
  const stacked = clients.slice(0, 7).map(c => {
    const row: any = { name: c.name };
    categoryKeys.forEach(k => {
      row[k] = Number((c.categories[k]?.cost || 0).toFixed(2));
    });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Analisi Clienti</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-2 rounded-lg border ${mode === 'rate' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              onClick={() => setMode('rate')}
            >Tariffa €/min</button>
            <button
              className={`px-3 py-2 rounded-lg border ${mode === 'markup' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              onClick={() => setMode('markup')}
            >Markup %</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 min-w-[120px]">Tariffa Mobile €/min</label>
            <Input type="number" step="0.01" value={ratePerMinuteMobile}
              onChange={(e) => setRatePerMinuteMobile(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 min-w-[120px]">Tariffa Fisso €/min</label>
            <Input type="number" step="0.01" value={ratePerMinuteLandline}
              onChange={(e) => setRatePerMinuteLandline(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 min-w-[120px]">Markup Mobile %</label>
            <Input type="number" step="1" value={markupPercentMobile}
              onChange={(e) => setMarkupPercentMobile(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 min-w-[120px]">Markup Fisso %</label>
            <Input type="number" step="1" value={markupPercentLandline}
              onChange={(e) => setMarkupPercentLandline(parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clienti</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totals.assignedClients}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Totale</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totals.totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavo Totale</CardTitle>
            <PiggyBank className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">€{totals.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margine Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">€{totals.totalMargin.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

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
          <CardTitle>Riepilogo per Cliente</CardTitle>
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
                {clients.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: c.color || '#64748B' }} />
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell>{c.numbersCount}</TableCell>
                    <TableCell>{c.totalCalls}</TableCell>
                    <TableCell className="font-mono text-sm">{formatDuration(c.totalSeconds)}</TableCell>
                    <TableCell className="font-semibold text-green-600">€{c.totalCost.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-indigo-600">€{c.revenue.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-orange-600">€{c.margin.toFixed(2)}</TableCell>
                    <TableCell>{c.marginPct.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAnalytics;
