
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CallerAnalysis, CallSummary } from '@/types/call-analysis';
import { NumberCategorizer } from '@/utils/number-categorizer';

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
      case 'numero verde': return 'bg-emerald-100 text-emerald-800';
      case 'numero premium': return 'bg-red-100 text-red-800';
      default: 
        // Per le nazioni internazionali
        if (['spagna', 'francia', 'germania', 'regno unito', 'svizzera', 'austria', 'paesi bassi', 'belgio'].some(n => category.toLowerCase().includes(n))) {
          if (category.toLowerCase().includes('mobile')) {
            return 'bg-blue-100 text-blue-800';
          } else if (category.toLowerCase().includes('fisso')) {
            return 'bg-green-100 text-green-800';
          }
          return 'bg-purple-100 text-purple-800';
        }
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Raggruppa le categorie per macro-categoria
  const groupCategoriesByMacro = (categories: CallSummary[]) => {
    const macroGroups = new Map<string, CallSummary[]>();
    
    categories.forEach(cat => {
      console.log('🔍 Processing category:', cat.category);
      
      let macroCategory = '';
      
      // Per le categorie internazionali dettagliate
      if (['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].some(paese => cat.category.includes(paese))) {
        if (cat.category.includes('Mobile')) {
          // Estrai solo il nome del paese + Mobile (es: "Spagna Mobile", "Francia Mobile")
          const paese = ['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].find(p => cat.category.includes(p));
          macroCategory = `${paese} Mobile`;
        } else if (cat.category.includes('Fisso')) {
          // Estrai solo il nome del paese + Fisso (es: "Spagna Fisso", "Francia Fisso")
          const paese = ['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].find(p => cat.category.includes(p));
          macroCategory = `${paese} Fisso`;
        } else {
          // Se non ha Fisso/Mobile, usa solo il nome del paese
          macroCategory = cat.category;
        }
        console.log('🌍 International category processed:', cat.category, '→', macroCategory);
      }
      // Per TUTTI i mobili italiani (specifici e generici), raggruppa sotto "Mobile"
      else if (cat.category.includes('TIM') || cat.category.includes('Vodafone') || 
               cat.category.includes('Wind') || cat.category.includes('Iliad') || 
               cat.category.includes('Fastweb') || cat.category.includes('Tre') ||
               cat.category === 'Mobile') {
        macroCategory = 'Mobile';
        console.log('📱 Italian mobile category grouped:', cat.category, '→', macroCategory);
      }
      // Per numeri speciali, mantieni la categoria specifica
      else if (cat.category === 'Numero Verde') {
        macroCategory = 'Numero Verde';
      } else if (cat.category === 'Numero Premium') {
        macroCategory = 'Numero Premium';
      }
      // Per tutti gli altri (fissi italiani), raggruppa sotto "Fisso"
      else {
        macroCategory = 'Fisso';
        console.log('🏠 Italian landline category grouped:', cat.category, '→', macroCategory);
      }
      
      console.log('📋 Final mapping: Original:', cat.category, '→ Macro:', macroCategory);
      
      if (!macroGroups.has(macroCategory)) {
        macroGroups.set(macroCategory, []);
      }
      macroGroups.get(macroCategory)!.push(cat);
    });

    // Converti in array e aggrega i totali per macro-categoria
    return Array.from(macroGroups.entries()).map(([macroCategory, cats]) => {
      const totalCount = cats.reduce((sum, cat) => sum + cat.count, 0);
      const totalSeconds = cats.reduce((sum, cat) => sum + cat.totalSeconds, 0);
      const totalCost = cats.reduce((sum, cat) => sum + (cat.cost || 0), 0);
      
      console.log('📊 Macro category summary:', macroCategory, 'Count:', totalCount, 'Seconds:', totalSeconds, 'Cost:', totalCost);
      
      return {
        macroCategory,
        count: totalCount,
        totalSeconds,
        cost: totalCost,
        formattedDuration: formatDuration(totalSeconds),
        details: cats
      };
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisi per Numero Chiamante</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {callerAnalysis.map((caller) => {
            const macroGroups = groupCategoriesByMacro(caller.categories);
            
            return (
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
                          <TableHead>Costo</TableHead>
                          <TableHead>% del Totale</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {macroGroups.map((group, idx) => {
                          const percentage = ((group.totalSeconds / caller.totalDuration) * 100).toFixed(1);
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.macroCategory)}`}>
                                  {group.macroCategory}
                                </span>
                              </TableCell>
                              <TableCell>{group.count}</TableCell>
                              <TableCell>{group.formattedDuration}</TableCell>
                              <TableCell>€{group.cost.toFixed(2)}</TableCell>
                              <TableCell>{percentage}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallerAnalysisTable;
