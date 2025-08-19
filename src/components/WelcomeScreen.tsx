import React from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  FileSpreadsheet,
  Database
} from 'lucide-react';

interface WelcomeScreenProps {
  onUpload: () => void;
  hasData: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUpload, hasData }) => {
  const { currentOrganization, organizations } = useOrganization();

  const requirements = [
    {
      id: 'organization',
      title: 'Seleziona Organizzazione',
      description: 'Scegli l\'organizzazione per cui analizzare i dati',
      completed: !!currentOrganization,
      icon: Building
    },
    {
      id: 'data',
      title: 'Carica Dati',
      description: 'Importa i file CSV con i dati delle chiamate',
      completed: hasData,
      icon: Upload
    }
  ];

  const allRequirementsMet = requirements.every(req => req.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center mx-auto shadow-lg">
          <Database className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-brand-accent bg-clip-text text-transparent mb-2">
            Benvenuto in Call Analytics
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema avanzato per l'analisi delle chiamate telefoniche
          </p>
        </div>
      </div>

      {/* Status Alert */}
      {!currentOrganization && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Attenzione:</strong> Seleziona un'organizzazione dall'header in alto per iniziare ad utilizzare il sistema.
          </AlertDescription>
        </Alert>
      )}

      {/* Requirements Checklist */}
      <Card className="premium-card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Setup Iniziale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requirements.map((req) => {
            const IconComponent = req.icon;
            return (
              <div 
                key={req.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  req.completed 
                    ? 'bg-green-50 border-green-200 text-green-900' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  req.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {req.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{req.title}</h3>
                  <p className="text-sm text-muted-foreground">{req.description}</p>
                </div>
                {req.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="premium-card-glass hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Upload CSV</h3>
                <p className="text-sm text-muted-foreground">
                  Carica i tuoi file CSV con i dati delle chiamate
                </p>
              </div>
            </div>
            <Button 
              onClick={onUpload}
              disabled={!currentOrganization}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              Carica Dati
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="premium-card-glass hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                <Database className="h-6 w-6 text-brand-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">FTP Import</h3>
                <p className="text-sm text-muted-foreground">
                  Configura l'importazione automatica via FTP
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              disabled={!currentOrganization}
              className="w-full gap-2"
              onClick={() => {/* Navigate to FTP */}}
            >
              <Database className="h-4 w-4" />
              Configura FTP
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Info */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          <strong>Organizzazione corrente:</strong>{' '}
          {currentOrganization ? (
            <span className="text-primary font-medium">{currentOrganization.name}</span>
          ) : (
            <span className="text-yellow-600">Nessuna organizzazione selezionata</span>
          )}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          {allRequirementsMet ? (
            <span className="text-green-600 font-medium">Pronto per l'uso</span>
          ) : (
            <span className="text-yellow-600">Completare il setup</span>
          )}
        </p>
      </div>
    </div>
  );
};