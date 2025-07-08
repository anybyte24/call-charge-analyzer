import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CallRecord } from '@/types/call-analysis';
import { Clock } from 'lucide-react';

interface HourlyDistributionChartProps {
  records: CallRecord[];
}

const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({ records }) => {
  // Analizza la distribuzione oraria
  const hourlyData = React.useMemo(() => {
    const hourCounts = new Array(24).fill(0).map((_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourNumber: hour,
      calls: 0,
      cost: 0,
      duration: 0
    }));

    records.forEach(record => {
      if (record.timestamp) {
        // Estrai l'ora dal timestamp (formato: "HH:MM:SS")
        const timeParts = record.timestamp.split(':');
        if (timeParts.length >= 1) {
          const hour = parseInt(timeParts[0]);
          if (hour >= 0 && hour < 24) {
            hourCounts[hour].calls++;
            hourCounts[hour].cost += record.cost || 0;
            hourCounts[hour].duration += record.durationSeconds;
          }
        }
      }
    });

    return hourCounts;
  }, [records]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">Chiamate: {data.calls}</p>
          <p className="text-sm text-green-600">Costo: €{data.cost.toFixed(2)}</p>
          <p className="text-sm text-purple-600">Durata: {Math.floor(data.duration / 60)} min</p>
        </div>
      );
    }
    return null;
  };

  // Trova le ore di picco
  const peakHours = hourlyData
    .filter(hour => hour.calls > 0)
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Distribuzione oraria - Bar Chart */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Distribuzione Oraria delle Chiamate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {peakHours.map((hour, idx) => (
              <div key={hour.hour} className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                <span>Picco {idx + 1}: {hour.hour} ({hour.calls} chiamate)</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 11 }}
                interval={1}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="calls" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Chiamate"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend orario con linea */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span>Trend Orario Chiamate e Costi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 11 }}
                interval={2}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="calls" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Chiamate"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cost" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Costo (€)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default HourlyDistributionChart;