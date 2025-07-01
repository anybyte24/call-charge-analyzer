
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Clock, TrendingUp, Users, Euro } from 'lucide-react';
import { CallSummary, CallerAnalysis } from '@/types/call-analysis';

interface DashboardProps {
  summary: CallSummary[];
  callerAnalysis: CallerAnalysis[];
  totalRecords: number;
  fileName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  summary, 
  callerAnalysis, 
  totalRecords, 
  fileName 
}) => {
  const totalCalls = summary.reduce((sum, cat) => sum + cat.count, 0);
  const totalDuration = summary.reduce((sum, cat) => sum + cat.totalSeconds, 0);
  const totalCost = summary.reduce((sum, cat) => sum + (cat.cost || 0), 0);
  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mobile': return 'bg-blue-500';
      case 'fisso': return 'bg-green-500';
      case 'numero speciale': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Analisi Chiamate Telefoniche</h1>
        <p className="text-blue-100">File: {fileName}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Chiamate</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Record processati: {totalRecords}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durata Totale</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h {totalMinutes}m</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(totalDuration / 60)} minuti totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Totale</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Importo fatturabile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Numeri Chiamanti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callerAnalysis.length}</div>
            <p className="text-xs text-muted-foreground">
              Numeri unici
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Medio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalCalls > 0 ? (totalCost / totalCalls).toFixed(3) : '0.000'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per chiamata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getCategoryColor(category.category)}`}></div>
                  <div>
                    <h3 className="font-medium">{category.category}</h3>
                    <p className="text-sm text-gray-500">{category.count} chiamate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{category.formattedDuration}</p>
                  <p className="text-sm font-semibold text-green-600">
                    €{category.cost?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
