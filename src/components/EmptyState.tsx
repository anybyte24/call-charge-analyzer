import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Upload, 
  FileText, 
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';

interface EmptyStateProps {
  onUpload: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onUpload, className }) => {
  const features = [
    {
      icon: BarChart3,
      title: 'Analisi Avanzate',
      description: 'Grafici e metriche dettagliate'
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Intelligenza artificiale per ottimizzare i costi'
    },
    {
      icon: Database,
      title: 'Gestione Automatica',
      description: 'Import FTP e automazioni'
    }
  ];

  return (
    <div className={`flex-1 flex items-center justify-center p-8 ${className}`}>
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="heading-lg">Nessun dato da visualizzare</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Carica un file CSV nella sezione "Carica" per vedere i dati qui
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          {features.map((feature, index) => (
            <Card key={index} className="modern-card border-dashed">
              <CardContent className="p-6 text-center">
                <feature.icon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <Button 
            onClick={onUpload}
            size="lg"
            className="btn-primary h-12 px-8 text-base"
          >
            <Upload className="h-5 w-5 mr-2" />
            Carica il tuo primo file
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Supportiamo file CSV, Excel e import automatico FTP</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-6 pt-8 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">50+</div>
            <div className="text-xs text-muted-foreground">Formati supportati</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">AI</div>
            <div className="text-xs text-muted-foreground">Insights automatici</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-xs text-muted-foreground">Monitoraggio</div>
          </div>
        </div>
      </div>
    </div>
  );
};