import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CostAlert {
  id: string;
  type: 'daily' | 'monthly' | 'number' | 'caller';
  threshold: number;
  target?: string;
  isActive: boolean;
}

const CostAlertsManager: React.FC = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = React.useState<CostAlert[]>([
    { id: '1', type: 'daily', threshold: 50, isActive: true },
    { id: '2', type: 'monthly', threshold: 1000, isActive: true }
  ]);
  
  const [newAlert, setNewAlert] = React.useState<{
    type: 'daily' | 'monthly' | 'number' | 'caller';
    threshold: number;
    target: string;
  }>({
    type: 'daily' as const,
    threshold: 0,
    target: ''
  });

  const addAlert = () => {
    if (newAlert.threshold <= 0) {
      toast({
        title: "Soglia non valida",
        description: "Inserisci una soglia maggiore di 0",
        variant: "destructive"
      });
      return;
    }

    const alert: CostAlert = {
      id: Date.now().toString(),
      type: newAlert.type,
      threshold: newAlert.threshold,
      target: newAlert.target || undefined,
      isActive: true
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ type: 'daily', threshold: 0, target: '' });
    
    toast({
      title: "Alert aggiunto",
      description: `Alert per €${newAlert.threshold} configurato con successo`
    });
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast({
      title: "Alert rimosso",
      description: "Alert eliminato con successo"
    });
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Giornaliero';
      case 'monthly': return 'Mensile';
      case 'number': return 'Per Numero';
      case 'caller': return 'Per Chiamante';
      default: return type;
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Gestione Alert Costi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Alerts */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Alert Attivi</Label>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-sm">Nessun alert configurato</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
                    <p className="text-sm mt-1">
                      Soglia: €{alert.threshold}
                      {alert.target && ` - Target: ${alert.target}`}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => removeAlert(alert.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New Alert */}
        <div className="border-t pt-4 space-y-4">
          <Label className="text-sm font-medium">Nuovo Alert</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo Alert</Label>
              <Select
                value={newAlert.type}
                onValueChange={(value: any) => setNewAlert({ ...newAlert, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Costo Giornaliero</SelectItem>
                  <SelectItem value="monthly">Costo Mensile</SelectItem>
                  <SelectItem value="number">Costo per Numero</SelectItem>
                  <SelectItem value="caller">Costo per Chiamante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Soglia (€)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newAlert.threshold || ''}
                onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {(newAlert.type === 'number' || newAlert.type === 'caller') && (
            <div className="space-y-2">
              <Label>Target {newAlert.type === 'number' ? 'Numero' : 'Chiamante'}</Label>
              <Input
                placeholder={newAlert.type === 'number' ? "es. 393123456789" : "es. 0583947974"}
                value={newAlert.target}
                onChange={(e) => setNewAlert({ ...newAlert, target: e.target.value })}
              />
            </div>
          )}

          <Button onClick={addAlert} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Alert
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostAlertsManager;
