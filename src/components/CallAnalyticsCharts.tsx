
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CallSummary, CallerAnalysis } from '@/types/call-analysis';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface CallAnalyticsChartsProps {
  summary: CallSummary[];
  callerAnalysis: CallerAnalysis[];
}

const CallAnalyticsCharts: React.FC<CallAnalyticsChartsProps> = ({ summary, callerAnalysis }) => {
  // Prepare data for charts
  const categoryData = summary.map(cat => ({
    name: cat.category,
    calls: cat.count,
    cost: cat.cost || 0,
    duration: cat.totalMinutes
  }));

  // Top 10 callers by cost
  const topCallers = callerAnalysis.slice(0, 10).map(caller => {
    const totalCost = caller.categories.reduce((sum, cat) => sum + (cat.cost || 0), 0);
    return {
      caller: caller.callerNumber.length > 10 ? `...${caller.callerNumber.slice(-8)}` : caller.callerNumber,
      calls: caller.totalCalls,
      cost: totalCost,
      duration: Math.floor(caller.totalDuration / 60)
    };
  });

  // Colors for pie chart
  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'cost' ? `€${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category Distribution - Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-blue-600" />
              <span>Distribuzione per Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="calls"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost by Category - Bar Chart */}
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Costi per Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Callers Analysis */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Top 10 Chiamanti per Costo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topCallers} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="caller" 
                tick={{ fontSize: 11 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Calls vs Duration Comparison */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span>Chiamate vs Durata per Categoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="calls" fill="#3B82F6" name="Chiamate" />
              <Bar yAxisId="right" dataKey="duration" fill="#F59E0B" name="Durata (min)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallAnalyticsCharts;
