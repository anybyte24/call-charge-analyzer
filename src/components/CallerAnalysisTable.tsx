import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CallerAnalysis, CallSummary, CallRecord } from '@/types/call-analysis';
import { ClientPricing, UserGlobalPricing } from '@/hooks/useClients';
import { EFFECTIVE_NATIONAL_RATES, EFFECTIVE_INTERNATIONAL_RATES } from '@/utils/effective-selling-rates';
import { resolveCountryFromCategory } from '@/utils/country-name-mapping';

interface CallerAnalysisTableProps {
  callerAnalysis: CallerAnalysis[];
  numberToClient?: Record<string, { id: string; name: string; color?: string | null }>;
  clientPricing: ClientPricing[];
  globalPricing: UserGlobalPricing | null;
  records: CallRecord[];
}

const CallerAnalysisTable: React.FC<CallerAnalysisTableProps> = ({
  callerAnalysis,
  numberToClient,
  clientPricing,
  globalPricing,
  records,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Build effective international rates lookup
  const effectiveRatesByCountry = useMemo(() => {
    const map = new Map<string, { landline: number; mobile: number }>();
    EFFECTIVE_INTERNATIONAL_RATES.forEach(r => {
      map.set(r.country, { landline: r.landline, mobile: r.mobile });
    });
    return map;
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, CallerAnalysis[]>();
    callerAnalysis.forEach((c) => {
      const groupName = numberToClient?.[c.callerNumber]?.name || 'Senza cliente';
      if (!map.has(groupName)) map.set(groupName, []);
      map.get(groupName)!.push(c);
    });
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === 'Senza cliente') return 1;
      if (b === 'Senza cliente') return -1;
      return a.localeCompare(b);
    });
  }, [callerAnalysis, numberToClient]);

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
        if (['spagna', 'francia', 'germania', 'regno unito', 'svizzera', 'austria', 'paesi bassi', 'belgio'].some(n => category.toLowerCase().includes(n))) {
          if (category.toLowerCase().includes('mobile')) return 'bg-blue-100 text-blue-800';
          if (category.toLowerCase().includes('fisso')) return 'bg-green-100 text-green-800';
          return 'bg-purple-100 text-purple-800';
        }
        return 'bg-gray-100 text-gray-800';
    }
  };

  /** Calculate revenue (Da Fatturare) for a macro category */
  const calculateRevenue = (macroCategory: string, totalSeconds: number, clientId?: string): number => {
    const min = totalSeconds / 60;
    const catLower = macroCategory.toLowerCase();

    // Find client pricing
    const cp = clientId ? clientPricing.find(p => p.client_id === clientId) : null;
    const clientMobileRate = Number(cp?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
    const clientLandlineRate = Number(cp?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
    const clientIntlRate = Number(cp?.international_rate || 0) || Number(globalPricing?.international_rate || 0);
    const clientPremRate = Number(cp?.premium_rate || 0) || Number(globalPricing?.premium_rate || 0);

    // Mobile
    if (catLower === 'mobile') return min * clientMobileRate;
    // Fisso
    if (catLower === 'fisso') return min * clientLandlineRate;
    // Numero Verde
    if (catLower === 'numero verde') return 0;
    // Premium
    if (catLower === 'numero premium' || catLower.includes('premium') || catLower.includes('speciale')) return min * clientPremRate;

    // International - try to resolve country
    const resolved = resolveCountryFromCategory(macroCategory);
    if (resolved) {
      const effRate = effectiveRatesByCountry.get(resolved.countryEng);
      if (effRate) {
        return min * (resolved.isMobile ? effRate.mobile : effRate.landline);
      }
      return min * clientIntlRate;
    }

    // Fallback: if contains known country keywords, use international
    if (['spagna', 'francia', 'germania', 'regno unito', 'svizzera', 'austria', 'paesi bassi', 'belgio'].some(n => catLower.includes(n))) {
      const isMob = catLower.includes('mobile');
      // Try resolving
      const resolved2 = resolveCountryFromCategory(macroCategory);
      if (resolved2) {
        const effRate = effectiveRatesByCountry.get(resolved2.countryEng);
        if (effRate) return min * (isMob ? effRate.mobile : effRate.landline);
      }
      return min * clientIntlRate;
    }

    // Default to landline rate
    return min * clientLandlineRate;
  };

  const groupCategoriesByMacro = (categories: CallSummary[]) => {
    const macroGroups = new Map<string, CallSummary[]>();
    
    categories.forEach(cat => {
      let macroCategory = '';
      
      if (['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].some(paese => cat.category.includes(paese))) {
        if (cat.category.includes('Mobile')) {
          const paese = ['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].find(p => cat.category.includes(p));
          macroCategory = `${paese} Mobile`;
        } else if (cat.category.includes('Fisso')) {
          const paese = ['Spagna', 'Francia', 'Germania', 'Regno Unito', 'Svizzera', 'Austria', 'Paesi Bassi', 'Belgio'].find(p => cat.category.includes(p));
          macroCategory = `${paese} Fisso`;
        } else {
          macroCategory = cat.category;
        }
      }
      else if (cat.category.includes('TIM') || cat.category.includes('Vodafone') || 
               cat.category.includes('Wind') || cat.category.includes('Iliad') || 
               cat.category.includes('Fastweb') || cat.category.includes('Tre') ||
               cat.category === 'Mobile') {
        macroCategory = 'Mobile';
      }
      else if (cat.category === 'Numero Verde') {
        macroCategory = 'Numero Verde';
      } else if (cat.category === 'Numero Premium') {
        macroCategory = 'Numero Premium';
      }
      else {
        macroCategory = 'Fisso';
      }
      
      if (!macroGroups.has(macroCategory)) {
        macroGroups.set(macroCategory, []);
      }
      macroGroups.get(macroCategory)!.push(cat);
    });

    return Array.from(macroGroups.entries()).map(([macroCategory, cats]) => {
      const totalCount = cats.reduce((sum, cat) => sum + cat.count, 0);
      const totalSeconds = cats.reduce((sum, cat) => sum + cat.totalSeconds, 0);
      const totalCost = cats.reduce((sum, cat) => sum + (cat.cost || 0), 0);
      
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
        <div className="space-y-6">
          {groups.map(([groupName, callers]) => {
            // Find client id for this group
            const firstCaller = callers[0];
            const clientInfo = firstCaller ? numberToClient?.[firstCaller.callerNumber] : undefined;
            const clientId = clientInfo?.id;
            const cp = clientId ? clientPricing.find(p => p.client_id === clientId) : null;
            const isForfait = cp?.forfait_only === true;
            const forfaitMinutes = Number(cp?.forfait_minutes || 0);
            const monthlyFee = Number(cp?.monthly_flat_fee || 0);

            // Calculate group totals for forfait
            const groupTotalSeconds = callers.reduce((s, c) => s + c.totalDuration, 0);
            const groupTotalMinutes = groupTotalSeconds / 60;
            // forfaitMinutes = 0 means unlimited
            const hasOverage = isForfait && forfaitMinutes > 0 && groupTotalMinutes > forfaitMinutes;

            return (
              <div key={groupName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-muted-foreground">{groupName}</div>
                  {isForfait && forfaitMinutes > 0 && (
                    <div className={`text-xs px-2 py-1 rounded ${groupTotalMinutes > forfaitMinutes ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      Forfait: {Math.round(groupTotalMinutes)}/{forfaitMinutes} min
                      {groupTotalMinutes > forfaitMinutes && ` (+${Math.round(groupTotalMinutes - forfaitMinutes)} esubero)`}
                    </div>
                  )}
                </div>
                {callers.map((caller) => {
                  const macroGroups = groupCategoriesByMacro(caller.categories);
                  // Calculate total revenue for this caller
                  const callerRevenue = isForfait
                    ? 0 // forfait handled at group level
                    : macroGroups.reduce((sum, g) => sum + calculateRevenue(g.macroCategory, g.totalSeconds, clientId), 0);

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
                              <p className="text-sm text-muted-foreground">
                                {caller.totalCalls} chiamate
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-medium">{caller.formattedTotalDuration}</p>
                              <p className="text-sm text-muted-foreground">Durata</p>
                            </div>
                            {!isForfait && (
                              <div className="text-right">
                                <p className="font-medium text-primary">€{callerRevenue.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">Da Fatturare</p>
                              </div>
                            )}
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-8 mt-2 border-l-2 border-muted pl-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Chiamate</TableHead>
                                <TableHead>Durata</TableHead>
                                <TableHead>Da Fatturare</TableHead>
                                <TableHead className="text-muted-foreground text-xs">Costo Op.</TableHead>
                                <TableHead>% del Totale</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {macroGroups.map((group, idx) => {
                                const percentage = ((group.totalSeconds / caller.totalDuration) * 100).toFixed(1);
                                const revenue = calculateRevenue(group.macroCategory, group.totalSeconds, clientId);
                                return (
                                  <TableRow key={idx}>
                                    <TableCell>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.macroCategory)}`}>
                                        {group.macroCategory}
                                      </span>
                                    </TableCell>
                                    <TableCell>{group.count}</TableCell>
                                    <TableCell>{group.formattedDuration}</TableCell>
                                    <TableCell className="font-semibold text-primary">
                                      {isForfait ? '—' : `€${revenue.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">€{group.cost.toFixed(2)}</TableCell>
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
                {/* Forfait summary for group */}
                {isForfait && (
                  <div className="ml-8 p-3 bg-muted/50 rounded-lg text-sm">
                    <span className="font-medium">Totale da fatturare: </span>
                    <span className="font-bold text-primary">
                      €{(monthlyFee + (hasOverage
                        ? (() => {
                            const overageMin = groupTotalMinutes - forfaitMinutes;
                            const clientMobileRate = Number(cp?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
                            const clientLandlineRate = Number(cp?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
                            const clientIntlRate = Number(cp?.international_rate || 0) || Number(globalPricing?.international_rate || 0);
                            const clientNumbers = callers.map(c => c.callerNumber);
                            const clientRecs = records.filter(r => clientNumbers.includes(r.callerNumber));
                            let mobM = 0, landM = 0, intlM = 0;
                            clientRecs.forEach(r => {
                              const m = r.durationSeconds / 60;
                              if (r.category.type === 'mobile') mobM += m;
                              else if (r.category.type === 'international') intlM += m;
                              else landM += m;
                            });
                            const tot = mobM + landM + intlM;
                            return tot > 0
                              ? overageMin * ((mobM/tot) * clientMobileRate + (landM/tot) * clientLandlineRate + (intlM/tot) * clientIntlRate)
                              : overageMin * clientMobileRate;
                          })()
                        : 0
                      )).toFixed(2)}
                    </span>
                    {monthlyFee > 0 && <span className="text-muted-foreground"> (canone €{monthlyFee.toFixed(2)})</span>}
                    {forfaitMinutes === 0 && <span className="text-muted-foreground"> (minuti illimitati)</span>}
                    {hasOverage && (
                      <span className="text-destructive"> + esubero {Math.round(groupTotalMinutes - forfaitMinutes)} min</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallerAnalysisTable;
