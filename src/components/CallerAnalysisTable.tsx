
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CallerAnalysis } from '@/types/call-analysis';

interface CallerAnalysisTableProps {
  callerAnalysis: CallerAnalysis[];
}

const CallerAnalysisTable: React.FC<CallerAnalysisTableProps> = ({ callerAnalysis }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (callerNumber: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(callerNumber)) {
      newExpanded.delete(callerNumber);
    } else {
      newExpanded.add(callerNumber);
    }
    setExpandedRows(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mobile': return 'bg-blue-100 text-blue-800';
      case 'fisso': return 'bg-green-100 text-green-800';
      case 'numero speciale': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisi per Numero Chiamante</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {callerAnalysis.map((caller) => (
            <Collapsible key={caller.callerNumber}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => toggleRow(caller.callerNumber)}
                  className="w-full justify-between p-4 h-auto"
                >
                  <div className="flex items-center space-x-3">
                    {expandedRows.has(caller.callerNumber) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <p className="font-medium">{caller.callerNumber}</p>
                      <p className="text-sm text-gray-500">
                        {caller.totalCalls} chiamate
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{caller.formattedTotalDuration}</p>
                    <p className="text-sm text-gray-500">Durata totale</p>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-8 mt-2 border-l-2 border-gray-200 pl-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Chiamate</TableHead>
                        <TableHead>Durata</TableHead>
                        <TableHead>% del Totale</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {caller.categories.map((category, idx) => {
                        const percentage = ((category.totalSeconds / caller.totalDuration) * 100).toFixed(1);
                        return (
                          <TableRow key={idx}>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.category)}`}>
                                {category.category}
                              </span>
                            </TableCell>
                            <TableCell>{category.count}</TableCell>
                            <TableCell>{category.formattedDuration}</TableCell>
                            <TableCell>{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallerAnalysisTable;
