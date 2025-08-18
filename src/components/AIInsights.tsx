import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, TrendingUp, AlertTriangle, Lightbulb, 
  Activity, Users, Clock, DollarSign, Zap
} from 'lucide-react';

interface AIInsightsProps {
  data: any[];
  className?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ data, className }) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  
  const { aiInsights } = useRealtime();
  const { currentOrganization } = useOrganization();

  // Load existing insights from database
  useEffect(() => {
    const loadInsights = async () => {
      if (!currentOrganization) return;

      const { data: dbInsights, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && dbInsights) {
        setInsights(dbInsights);
      }
    };

    loadInsights();
  }, [currentOrganization]);

  // Update insights with real-time data
  useEffect(() => {
    if (aiInsights.length > 0) {
      setInsights(prev => {
        const newInsights = aiInsights.filter(
          newInsight => !prev.some(existing => existing.id === newInsight.id)
        );
        return [...newInsights, ...prev].slice(0, 10);
      });
    }
  }, [aiInsights]);

  const generateInsights = async (analysisType: string) => {
    if (!currentOrganization || !data || data.length === 0) return;

    setGeneratingInsights(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          data: data.slice(0, 100), // Limit data for API call
          analysis_type: analysisType,
          organization_id: currentOrganization.id
        }
      });

      if (error) throw error;

      console.log('AI Insights generated:', result);
      
      // The insights will be automatically updated via real-time subscription
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern_analysis': return Brain;
      case 'cost_prediction': return TrendingUp;
      case 'anomaly_detection': return AlertTriangle;
      case 'automation_alert': return Zap;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (confidenceScore: number) => {
    if (confidenceScore >= 0.8) return 'bg-green-500';
    if (confidenceScore >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalCost = data.reduce((sum, record) => sum + (record.cost || 0), 0);
  const totalCalls = data.length;
  const avgCallDuration = data.reduce((sum, record) => sum + (record.durationSeconds || 0), 0) / totalCalls;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Costo Totale</p>
              <p className="text-2xl font-bold">
                €<AnimatedCounter value={totalCost} decimals={2} />
              </p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Chiamate</p>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={totalCalls} />
              </p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Durata Media</p>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={avgCallDuration / 60} decimals={1} />m
              </p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">AI Insights</p>
              <p className="text-2xl font-bold">
                <AnimatedCounter value={insights.length} />
              </p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* AI Insights Generation */}
      <ModernCard variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">AI Insights</h3>
          </div>
          
          <div className="flex gap-2">
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => generateInsights('pattern_analysis')}
              loading={generatingInsights}
              disabled={!data || data.length === 0}
              icon={Brain}
            >
              Analizza Pattern
            </ModernButton>
            
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => generateInsights('cost_prediction')}
              loading={generatingInsights}
              disabled={!data || data.length === 0}
              icon={TrendingUp}
            >
              Predici Costi
            </ModernButton>
            
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => generateInsights('anomaly_detection')}
              loading={generatingInsights}
              disabled={!data || data.length === 0}
              icon={AlertTriangle}
            >
              Rileva Anomalie
            </ModernButton>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nessun insight disponibile</p>
              <p>Genera insights AI sui tuoi dati delle chiamate</p>
            </div>
          ) : (
            insights.map((insight) => {
              const Icon = getInsightIcon(insight.insight_type);
              return (
                <ModernCard key={insight.id} variant="bordered" className="p-4 hover:scale-[1.01] transition-transform">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getInsightColor(insight.confidence_score || 0.5)}`}
                          />
                          <Badge variant="secondary" className="text-xs">
                            {Math.round((insight.confidence_score || 0.5) * 100)}% fiducia
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3">
                        {insight.description}
                      </p>

                      {insight.data?.recommendation && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <p className="text-sm font-medium text-primary">
                            💡 Raccomandazione: {insight.data.recommendation}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>Tipo: {insight.insight_type.replace('_', ' ')}</span>
                        <span>{new Date(insight.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              );
            })
          )}
        </div>
      </ModernCard>
    </div>
  );
};