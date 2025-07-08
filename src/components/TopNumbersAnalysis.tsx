import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CallRecord } from '@/types/call-analysis';
import { Phone, Repeat, TrendingUp, AlertTriangle } from 'lucide-react';

interface TopNumbersAnalysisProps {
  records: CallRecord[];
}

interface NumberAnalysis {
  number: string;
  callCount: number;
  totalDuration: number;
  totalCost: number;
  category: string;
  averageCallDuration: number;
  callers: string[];
  uniqueCallers: number;
  formattedDuration: string;
  isRepeated: boolean;
}

const TopNumbersAnalysis: React.FC<TopNumbersAnalysisProps> = ({ records }) => {
  const numberAnalysis = React.useMemo(() => {
    const numberMap = new Map<string, NumberAnalysis>();

    records.forEach(record => {
      const number = record.calledNumber;
      const existing = numberMap.get(number);

      if (existing) {
        existing.callCount++;
        existing.totalDuration += record.durationSeconds;
        existing.totalCost += record.cost || 0;
        if (!existing.callers.includes(record.callerNumber)) {
          existing.callers.push(record.callerNumber);
        }
      } else {
        numberMap.set(number, {
          number,
          callCount: 1,
          totalDuration: record.durationSeconds,
          totalCost: record.cost || 0,
          category: record.category.description,
          averageCallDuration: 0,
          callers: [record.callerNumber],
          uniqueCallers: 0,
          formattedDuration: '',
          isRepeated: false
        });
      }
    });

    // Calcola valori finali
    const analysis = Array.from(numberMap.values()).map(item => ({
      ...item,
      uniqueCallers: item.callers.length,
      averageCallDuration: item.callCount > 0 ? item.totalDuration / item.callCount : 0,
      formattedDuration: formatDuration(item.totalDuration),
      isRepeated: item.callCount > 1
    }));

    // Ordina per numero di chiamate (decrescente)
    return analysis.sort((a, b) => b.callCount - a.callCount);
  }, [records]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBadgeVariant = (callCount: number) => {
    if (callCount >= 10) return 'destructive';
    if (callCount >= 5) return 'default';
    return 'secondary';
  };

  const getRepeatIcon = (isRepeated: boolean) => {
    return isRepeated ? (
      <Repeat className="h-4 w-4 text-orange-500" />
    ) : (
      <Phone className="h-4 w-4 text-gray-400" />
    );
  };

  // Top 10 numeri più chiamati
  const topNumbers = numberAnalysis.slice(0, 10);
  
  // Numeri ripetitivi (chiamati più di 1 volta)
  const repeatedNumbers = numberAnalysis.filter(n => n.isRepeated).slice(0, 15);

  // Numeri più costosi
  const expensiveNumbers = [...numberAnalysis]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Statistiche generali */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Numeri Unici</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{numberAnalysis.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Numeri Ripetitivi</CardTitle>
            <Repeat className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{repeatedNumbers.length}</div>
            <p className="text-xs text-gray-500">
              {((repeatedNumbers.length / numberAnalysis.length) * 100).toFixed(1)}% del totale
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Numero Più Chiamato</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {topNumbers[0]?.callCount || 0} volte
            </div>
            <p className="text-xs text-gray-500 truncate">
              {topNumbers[0]?.number || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiamate Ripetute</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {repeatedNumbers.reduce((sum, n) => sum + n.callCount, 0)}
            </div>
            <p className="text-xs text-gray-500">
              {((repeatedNumbers.reduce((sum, n) => sum + n.callCount, 0) / records.length) * 100).toFixed(1)}% del totale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Numeri Più Chiamati */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Top 10 Numeri Più Chiamati</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Chiamate</TableHead>
                <TableHead>Durata Totale</TableHead>
                <TableHead>Costo Totale</TableHead>
                <TableHead>Chiamanti Unici</TableHead>
                <TableHead>Durata Media</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topNumbers.map((number, index) => (
                <TableRow key={number.number}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getRepeatIcon(number.isRepeated)}
                      <span className="font-mono text-sm">{number.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{number.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(number.callCount)}>
                      {number.callCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{number.formattedDuration}</TableCell>
                  <TableCell className="font-semibold text-green-600">€{number.totalCost.toFixed(2)}</TableCell>
                  <TableCell>{number.uniqueCallers}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatDuration(Math.floor(number.averageCallDuration))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Numeri Più Costosi */}
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Top 10 Numeri Più Costosi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Costo Totale</TableHead>
                <TableHead>Chiamate</TableHead>
                <TableHead>Costo Medio</TableHead>
                <TableHead>Durata Totale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensiveNumbers.map((number, index) => (
                <TableRow key={number.number}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getRepeatIcon(number.isRepeated)}
                      <span className="font-mono text-sm">{number.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{number.category}</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-green-600">€{number.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(number.callCount)}>
                      {number.callCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    €{(number.totalCost / number.callCount).toFixed(3)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{number.formattedDuration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Numeri Ripetitivi */}
      {repeatedNumbers.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Repeat className="h-5 w-5 text-orange-600" />
              <span>Numeri Chiamati Ripetutamente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ripetizioni</TableHead>
                  <TableHead>Chiamanti Diversi</TableHead>
                  <TableHead>Costo Totale</TableHead>
                  <TableHead>Durata Totale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repeatedNumbers.map((number, index) => (
                  <TableRow key={number.number}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Repeat className="h-4 w-4 text-orange-500" />
                        <span className="font-mono text-sm">{number.number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{number.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(number.callCount)}>
                        {number.callCount}
                      </Badge>
                    </TableCell>
                    <TableCell>{number.uniqueCallers}</TableCell>
                    <TableCell className="font-semibold text-green-600">€{number.totalCost.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-sm">{number.formattedDuration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopNumbersAnalysis;