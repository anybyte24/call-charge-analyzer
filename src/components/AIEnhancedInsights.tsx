import React, { useState } from 'react';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Globe, 
  Zap,
  MessageSquare,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

interface AIEnhancedInsightsProps {
  data: any[];
  className?: string;
}

export const AIEnhancedInsights: React.FC<AIEnhancedInsightsProps> = ({ data, className }) => {
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  const enhancedAnalyses = [
    {
      id: 'customer_behavior',
      title: 'Analisi Comportamento Clienti',
      description: 'Identifica pattern di comportamento e preferenze dei clienti',
      icon: Users,
      color: 'bg-blue-500',
      analysisType: 'customer_behavior_analysis'
    },
    {
      id: 'cost_optimization',
      title: 'Ottimizzazione Costi Avanzata',
      description: 'Suggerimenti specifici per ridurre i costi delle chiamate',
      icon: Target,
      color: 'bg-green-500',
      analysisType: 'advanced_cost_optimization'
    },
    {
      id: 'predictive_analytics',
      title: 'Analytics Predittivi',
      description: 'Previsioni dettagliate su traffico e costi futuri',
      icon: TrendingUp,
      color: 'bg-purple-500',
      analysisType: 'predictive_analytics'
    },
    {
      id: 'geographic_analysis',
      title: 'Analisi Geografica',
      description: 'Pattern di chiamate per area geografica e suggerimenti tariffari',
      icon: Globe,
      color: 'bg-orange-500',
      analysisType: 'geographic_analysis'
    },
    {
      id: 'usage_patterns',
      title: 'Pattern di Utilizzo',
      description: 'Analisi avanzata dei pattern temporali e di utilizzo',
      icon: BarChart3,
      color: 'bg-cyan-500',
      analysisType: 'usage_pattern_analysis'
    },
    {
      id: 'conversation_insights',
      title: 'Insights Conversazionali',
      description: 'Analisi durata e qualità delle conversazioni',
      icon: MessageSquare,
      color: 'bg-pink-500',
      analysisType: 'conversation_insights'
    },
    {
      id: 'sentiment_analysis',
      title: 'Analisi Sentiment',
      description: 'Valutazione del sentiment basata su pattern di chiamata',
      icon: Brain,
      color: 'bg-indigo-500',
      analysisType: 'sentiment_analysis'
    },
    {
      id: 'seasonal_trends',
      title: 'Trend Stagionali',
      description: 'Identificazione di trend stagionali e ciclici',
      icon: Calendar,
      color: 'bg-yellow-500',
      analysisType: 'seasonal_trend_analysis'
    }
  ];

  const runEnhancedAnalysis = async (analysisType: string, title: string) => {
    if (!currentOrganization || !data || data.length === 0) {
      toast({
        title: "Dati insufficienti",
        description: "Carica prima alcuni dati delle chiamate per procedere",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          data: data.slice(0, 200), // Più dati per analisi avanzate
          analysis_type: analysisType,
          organization_id: currentOrganization.id,
          enhanced: true // Flag per analisi avanzate
        }
      });

      if (error) throw error;

      if (result?.success) {
        toast({
          title: "Analisi completata",
          description: `${title} generata con successo`,
        });
      } else {
        throw new Error(result?.error || 'Errore nell\'analisi');
      }
    } catch (error) {
      console.error('Error running enhanced analysis:', error);
      toast({
        title: "Errore nell'analisi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runBulkAnalysis = async () => {
    if (!currentOrganization || !data || data.length === 0) {
      toast({
        title: "Dati insufficienti",
        description: "Carica prima alcuni dati delle chiamate per procedere",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const analysisPromises = enhancedAnalyses.map(analysis => 
        supabase.functions.invoke('ai-insights', {
          body: {
            data: data.slice(0, 200),
            analysis_type: analysis.analysisType,
            organization_id: currentOrganization.id,
            enhanced: true
          }
        })
      );

      const results = await Promise.allSettled(analysisPromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;

      toast({
        title: "Analisi complete",
        description: `${successCount}/${enhancedAnalyses.length} analisi completate con successo`,
      });
    } catch (error) {
      console.error('Error running bulk analysis:', error);
      toast({
        title: "Errore nell'analisi",
        description: "Errore durante l'esecuzione delle analisi multiple",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Insights Avanzati</h2>
        </div>
        
        <ModernButton
          onClick={runBulkAnalysis}
          loading={loading}
          icon={Zap}
          variant="primary"
        >
          Esegui Tutte le Analisi
        </ModernButton>
      </div>

      {/* Enhanced Analyses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {enhancedAnalyses.map((analysis) => {
          const Icon = analysis.icon;
          return (
            <div
              key={analysis.id} 
              className="cursor-pointer group"
              onClick={() => runEnhancedAnalysis(analysis.analysisType, analysis.title)}
            >
              <ModernCard 
                variant="bordered" 
                className="p-6 hover:scale-[1.02] transition-all duration-200"
              >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-xl ${analysis.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                  <Icon className={`h-8 w-8 text-white`} style={{filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(6174%) hue-rotate(220deg) brightness(94%) contrast(107%)'}} />
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm mb-2">{analysis.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {analysis.description}
                  </p>
                </div>

                <ModernButton
                  size="sm"
                  variant="outline"
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  loading={loading}
                  disabled={!data || data.length === 0}
                >
                  Analizza
                </ModernButton>
              </div>
              </ModernCard>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <ModernCard variant="glass" className="p-6">
        <div className="flex items-start gap-4">
          <Brain className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Analisi AI Avanzate</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Utilizza l'intelligenza artificiale per ottenere insights approfonditi sui tuoi dati di chiamata. 
              Ogni analisi fornisce raccomandazioni specifiche per ottimizzare costi e performance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium mb-2">Funzionalità disponibili:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Analisi comportamentale clienti</li>
                  <li>• Ottimizzazione costi avanzata</li>
                  <li>• Previsioni predittive</li>
                  <li>• Pattern geografici e temporali</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Requisiti:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Minimo 50 record di chiamate</li>
                  <li>• Dati degli ultimi 30 giorni</li>
                  <li>• Configurazione OpenAI attiva</li>
                  <li>• Organizzazione verificata</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
};