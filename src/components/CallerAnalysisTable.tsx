import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
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
    if (newExpanded.has(callerNumber)) newExpanded.delete(callerNumber);
    else newExpanded.add(callerNumber);
    setExpandedRows(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    const c = category.toLowerCase();
    if (c === 'mobile') return 'bg-kpi-calls/10 text-kpi-calls';
    if (c === 'fisso') return 'bg-kpi-cost/10 text-kpi-cost';
    if (c.includes('numero verde')) return 'bg-kpi-margin/10 text-kpi-margin';
    if (c.includes('premium') || c.includes('speciale')) return 'bg-destructive/10 text-destructive';
    if (['spagna', 'francia', 'germania', 'regno unito', 'svizzera', 'austria', 'paesi bassi', 'belgio'].some(n => c.includes(n))) {
      return 'bg-kpi-callers/10 text-kpi-callers';
    }
    return 'bg-muted text-muted-foreground';
  };

  const calculateRevenue = (macroCategory: string, totalSeconds: number, clientId?: string, operatorCost: number = 0): number => {
    const min = totalSeconds / 60;
    const catLower = macroCategory.toLowerCase();
    const cp = clientId ? clientPricing.find(p => p.client_id === clientId) : null;
    const clientMobileRate = Number(cp?.mobile_rate || 0) || EFFECTIVE_NATIONAL_RATES.mobile;
    const clientLandlineRate = Number(cp?.landline_rate || 0) || EFFECTIVE_NATIONAL_RATES.landline;
    const clientIntlRate = Number(cp?.international_rate || 0) || Number(globalPricing?.international_rate || 0);
    const clientPremRate = Number(cp?.premium_rate || 0) || Number(globalPricing?.premium_rate || 0);

    if (catLower === 'mobile') return min * clientMobileRate;
    if (catLower === 'fisso') return min * clientLandlineRate;
    if (catLower === 'numero verde') return 0;
    if (catLower === 'numero premium' || catLower.includes('premium') || catLower.includes('speciale')) {
      return clientPremRate > 0 ? min * clientPremRate : operatorCost;
    }

    const resolved = resolveCountryFromCategory(macroCategory);
    if (resolved) {
      const effRate = effectiveRatesByCountry.get(resolved.countryEng);
      if (effRate) return min * (resolved.isMobile ? effRate.mobile : effRate.landline);
      return min * clientIntlRate;
    }

    if (['spagna', 'francia', 'germania', 'regno unito', 'svizzera', 'austria', 'paesi bassi', 'belgio'].some(n => catLower.includes(n))) {
      const isMob = catLower.includes('mobile');
      const resolved2 = resolveCountryFromCategory(macroCategory);
      if (resolved2) {
        const effRate = effectiveRatesByCountry.get(resolved2.countryEng);
        if (effRate) return min * (isMob ? effRate.mobile : effRate.landline);
      }
      return min * clientIntlRate;
    }

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
      } else if (cat.category.includes('TIM') || cat.category.includes('Vodafone') || 
                 cat.category.includes('Wind') || cat.category.includes('Iliad') || 
                 cat.category.includes('Fastweb') || cat.category.includes('Tre') ||
                 cat.category === 'Mobile') {
        macroCategory = 'Mobile';
      } else if (cat.category === 'Numero Verde') {
        macroCategory = 'Numero Verde';
      } else if (cat.category === 'Numero Premium') {
        macroCategory = 'Numero Premium';
      } else {
        macroCategory = 'Fisso';
      }
      if (!macroGroups.has(macroCategory)) macroGroups.set(macroCategory, []);
      macroGroups.get(macroCategory)!.push(cat);
    });

    return Array.from(macroGroups.entries()).map(([macroCategory, cats]) => ({
      macroCategory,
      count: cats.reduce((sum, cat) => sum + cat.count, 0),
      totalSeconds: cats.reduce((sum, cat) => sum + cat.totalSeconds, 0),
      cost: cats.reduce((sum, cat) => sum + (cat.cost || 0), 0),
      formattedDuration: formatDuration(cats.reduce((sum, cat) => sum + cat.totalSeconds, 0)),
      details: cats
    }));
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Analisi per Numero Chiamante
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groups.map(([groupName, callers]) => {
            const firstCaller = callers[0];
            const clientInfo = firstCaller ? numberToClient?.[firstCaller.callerNumber] : undefined;
            const clientId = clientInfo?.id;
            const cp = clientId ? clientPricing.find(p => p.client_id === clientId) : null;
            const isForfait = cp?.forfait_only === true;
            const forfaitMinutes = Number(cp?.forfait_minutes || 0);
            const monthlyFee = Number(cp?.monthly_flat_fee || 0);

            const groupTotalSeconds = callers.reduce((s, c) => s + c.totalDuration, 0);
            const groupTotalMinutes = groupTotalSeconds / 60;
            const hasOverage = isForfait && forfaitMinutes > 0 && groupTotalMinutes > forfaitMinutes;

            return (
              <div key={groupName} className="space-y-1">
                <div className="flex items-center justify-between px-1 py-2">
                  <div className="flex items-center gap-2">
                    {clientInfo?.color && (
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: clientInfo.color }} />
                    )}
                    <span className="text-sm font-semibold text-foreground">{groupName}</span>
                  </div>
                  {isForfait && forfaitMinutes > 0 && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      groupTotalMinutes > forfaitMinutes 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-kpi-cost/10 text-kpi-cost'
                    }`}>
                      Forfait: {Math.round(groupTotalMinutes)}/{forfaitMinutes} min
                      {groupTotalMinutes > forfaitMinutes && ` (+${Math.round(groupTotalMinutes - forfaitMinutes)})`}
                    </span>
                  )}
                </div>
                {callers.map((caller) => {
                  const macroGroups = groupCategoriesByMacro(caller.categories);
                  const callerRevenue = isForfait
                    ? 0
                    : macroGroups.reduce((sum, g) => sum + calculateRevenue(g.macroCategory, g.totalSeconds, clientId, g.cost), 0);

                  return (
                    <Collapsible key={caller.callerNumber}>
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => toggleRow(caller.callerNumber)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="text-muted-foreground">
                              {expandedRows.has(caller.callerNumber) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground font-mono">{caller.callerNumber}</p>
                              <p className="text-xs text-muted-foreground">{caller.totalCalls} chiamate</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-5">
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{caller.formattedTotalDuration}</p>
                              <p className="text-[11px] text-muted-foreground">Durata</p>
                            </div>
                            {!isForfait && (
                              <div className="text-right min-w-[80px]">
                                <p className="text-sm font-semibold text-primary">€{callerRevenue.toFixed(2)}</p>
                                <p className="text-[11px] text-muted-foreground">Da Fatturare</p>
                              </div>
                            )}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-9 mt-1 mb-3 border-l-2 border-border pl-4">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="text-xs h-8">Categoria</TableHead>
                                <TableHead className="text-xs h-8">Chiamate</TableHead>
                                <TableHead className="text-xs h-8">Durata</TableHead>
                                <TableHead className="text-xs h-8">Da Fatturare</TableHead>
                                <TableHead className="text-xs h-8 text-muted-foreground">Costo Op.</TableHead>
                                <TableHead className="text-xs h-8">% Totale</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {macroGroups.map((group, idx) => {
                                const percentage = ((group.totalSeconds / caller.totalDuration) * 100).toFixed(1);
                                const revenue = calculateRevenue(group.macroCategory, group.totalSeconds, clientId, group.cost);
                                return (
                                  <TableRow key={idx} className="hover:bg-muted/30">
                                    <TableCell className="py-2">
                                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${getCategoryColor(group.macroCategory)}`}>
                                        {group.macroCategory}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-xs py-2">{group.count}</TableCell>
                                    <TableCell className="text-xs py-2 font-mono">{group.formattedDuration}</TableCell>
                                    <TableCell className="text-xs py-2 font-semibold text-primary">
                                      {isForfait ? '—' : `€${revenue.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell className="text-[11px] py-2 text-muted-foreground">€{group.cost.toFixed(2)}</TableCell>
                                    <TableCell className="text-xs py-2">{percentage}%</TableCell>
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
                {isForfait && (() => {
                  const groupCost = callers.reduce((s, c) => 
                    s + c.categories.reduce((cs, cat) => cs + (cat.cost || 0), 0), 0);
                  const overageRevenue = hasOverage
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
                    : 0;
                  const totalBill = monthlyFee + overageRevenue;
                  const margin = totalBill - groupCost;
                  const marginPct = totalBill > 0 ? (margin / totalBill) * 100 : 0;

                  return (
                    <div className="ml-9 p-3 bg-muted/40 rounded-lg text-xs space-y-1.5">
                      <div>
                        <span className="text-muted-foreground">Da fatturare: </span>
                        <span className="font-bold text-primary">€{totalBill.toFixed(2)}</span>
                        {monthlyFee > 0 && <span className="text-muted-foreground"> (canone €{monthlyFee.toFixed(2)})</span>}
                        {forfaitMinutes === 0 && <span className="text-muted-foreground"> (illimitato)</span>}
                        {hasOverage && (
                          <span className="text-destructive"> + esubero {Math.round(groupTotalMinutes - forfaitMinutes)} min (€{overageRevenue.toFixed(2)})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 pt-1 border-t border-border/50">
                        <span>Costo op.: <strong>€{groupCost.toFixed(2)}</strong></span>
                        <span className={margin >= 0 ? 'text-kpi-cost' : 'text-destructive'}>
                          Margine: <strong>€{margin.toFixed(2)}</strong> ({marginPct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallerAnalysisTable;
