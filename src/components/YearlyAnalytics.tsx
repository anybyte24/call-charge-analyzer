import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend } from 'recharts';
import { AnalysisSession } from '@/types/call-analysis';
import { useClients } from '@/hooks/useClients';

interface YearlyAnalyticsProps {
  sessions: AnalysisSession[];
}

const formatMonth = (iso?: string) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const YearlyAnalytics: React.FC<YearlyAnalyticsProps> = ({ sessions }) => {
  const { numberToClientMap, clientPricing, globalPricing } = useClients();

  const data = React.useMemo(() => {
    const byMonth = new Map<string, { cost: number; revenue: number }>();
    const intlRate = Number(globalPricing?.international_rate || 0);
    const premiumRate = Number(globalPricing?.premium_rate || 0);

    sessions.forEach((s) => {
      const key = formatMonth(s.uploadDate);
      if (!byMonth.has(key)) byMonth.set(key, { cost: 0, revenue: 0 });
      const agg = byMonth.get(key)!;

      // Cost from summary
      const totalCost = (s.summary || []).reduce((sum, cat) => sum + (Number(cat.cost || 0)), 0);
      agg.cost += totalCost;

      // Revenue estimate using current pricing and assignments
      const flatAdded = new Set<string>();
      (s.callerAnalysis || []).forEach((ca) => {
        const clientInfo = numberToClientMap[ca.callerNumber];
        const clientId = clientInfo?.id || 'no-client';
        const cp = clientPricing.find((p) => p.client_id === clientId);
        const onlyFlat = Boolean(cp?.forfait_only);
        const mobileRate = Number(cp?.mobile_rate || 0);
        const landlineRate = Number(cp?.landline_rate || 0);
        const flat = Number(cp?.monthly_flat_fee || 0);

        let mobileSec = 0, landlineSec = 0, intlSec = 0, premiumSec = 0;
        ca.categories.forEach((cat) => {
          const sec = cat.totalSeconds || 0;
          const c = cat.category.toLowerCase();
          if (c.includes('mobile')) mobileSec += sec;
          else if (c.includes('landline') || c.includes('fisso')) landlineSec += sec;
          else if (c.includes('international') || c.includes('internazionale')) intlSec += sec;
          else if (c.includes('special') || c.includes('premium') || c.includes('numero')) premiumSec += sec;
        });

        if (!onlyFlat) {
          agg.revenue += (mobileSec / 60) * mobileRate;
          agg.revenue += (landlineSec / 60) * landlineRate;
          agg.revenue += (intlSec / 60) * intlRate;
          agg.revenue += (premiumSec / 60) * premiumRate;
        }

        if (flat > 0 && !flatAdded.has(clientId)) {
          agg.revenue += flat;
          flatAdded.add(clientId);
        }
      });
    });

    const sorted = Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, v]) => ({ month, cost: Number(v.cost.toFixed(2)), revenue: Number(v.revenue.toFixed(2)), margin: Number((v.revenue - v.cost).toFixed(2)) }));

    return sorted;
  }, [sessions, numberToClientMap, clientPricing, globalPricing]);

  return (
    <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
      <CardHeader>
        <CardTitle>Analisi Annuale (12 mesi)</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ReTooltip />
            <Legend />
            <Line type="monotone" dataKey="cost" name="Costo (€)" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="revenue" name="Ricavo (€)" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="margin" name="Margine (€)" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default YearlyAnalytics;
