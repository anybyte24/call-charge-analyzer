import React, { useEffect, useState } from 'react';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  Zap, Plus, Play, Pause, Settings, Trash2, 
  Mail, Bell, Webhook, Database, AlertTriangle,
  CheckCircle, Clock, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationWorkflowProps {
  className?: string;
}

export const AutomationWorkflow: React.FC<AutomationWorkflowProps> = ({ className }) => {
  const [automations, setAutomations] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingNew, setCreatingNew] = useState(false);

  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (currentOrganization) {
      loadAutomations();
      loadExecutions();
    }
  }, [currentOrganization]);

  const loadAutomations = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Error loading automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('automation_executions')
        .select(`
          *,
          automation:automations(name)
        `)
        .in('automation_id', automations.map(a => a.id))
        .order('executed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const createDefaultAutomations = async () => {
    if (!currentOrganization) return;

    setCreatingNew(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const defaultAutomations = [
        {
          name: 'Alert Costi Elevati',
          description: 'Invia notifica quando il costo di una chiamata supera €5',
          trigger_type: 'cost_threshold',
          trigger_conditions: [
            { field: 'cost', operator: 'greater_than', value: 5 }
          ],
          actions: [
            {
              action_type: 'send_notification',
              config: {
                title: 'Costo Chiamata Elevato',
                message: 'Una chiamata ha superato il limite di €5',
                user_ids: [user.id]
              }
            },
            {
              action_type: 'create_alert',
              config: {
                alert_type: 'cost_warning',
                title: 'Chiamata Costosa Rilevata',
                description: 'Controllare i dettagli della chiamata nel dashboard'
              }
            }
          ],
          organization_id: currentOrganization.id,
          created_by: user.id,
          is_active: true
        },
        {
          name: 'Report Settimanale',
          description: 'Genera report automatico ogni lunedì',
          trigger_type: 'schedule',
          trigger_conditions: [
            { field: 'day_of_week', operator: 'equals', value: 1 },
            { field: 'hour', operator: 'equals', value: 9 }
          ],
          actions: [
            {
              action_type: 'send_email',
              config: {
                to: user.email,
                subject: 'Report Settimanale Analisi Chiamate',
                template: 'weekly_report'
              }
            }
          ],
          organization_id: currentOrganization.id,
          created_by: user.id,
          is_active: false
        },
        {
          name: 'Rilevamento Anomalie',
          description: 'Identifica pattern di chiamate inusuali',
          trigger_type: 'anomaly_detection',
          trigger_conditions: [
            { field: 'calls_per_hour', operator: 'greater_than', value: 50 },
            { field: 'average_duration', operator: 'less_than', value: 10 }
          ],
          actions: [
            {
              action_type: 'create_alert',
              config: {
                alert_type: 'anomaly_detected',
                title: 'Pattern Anomalo Rilevato',
                description: 'Rilevato pattern di chiamate inusuale che potrebbe indicare un problema'
              }
            },
            {
              action_type: 'webhook',
              config: {
                url: 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/',
                method: 'POST',
                body_template: {
                  alert_type: 'anomaly',
                  organization: '{{organization_name}}',
                  timestamp: '{{timestamp}}'
                }
              }
            }
          ],
          organization_id: currentOrganization.id,
          created_by: user.id,
          is_active: true
        }
      ];

      for (const automation of defaultAutomations) {
        const { error } = await supabase
          .from('automations')
          .insert(automation);

        if (error) throw error;
      }

      await loadAutomations();
      
      toast({
        title: "Automazioni Create",
        description: "Le automazioni di default sono state create con successo"
      });

    } catch (error) {
      console.error('Error creating automations:', error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione delle automazioni",
        variant: "destructive"
      });
    } finally {
      setCreatingNew(false);
    }
  };

  const toggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automations')
        .update({ is_active: !isActive })
        .eq('id', automationId);

      if (error) throw error;

      setAutomations(prev => prev.map(auto => 
        auto.id === automationId 
          ? { ...auto, is_active: !isActive }
          : auto
      ));

      toast({
        title: isActive ? "Automazione Disattivata" : "Automazione Attivata",
        description: `L'automazione è stata ${isActive ? 'disattivata' : 'attivata'} con successo`
      });

    } catch (error) {
      console.error('Error toggling automation:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento dell'automazione",
        variant: "destructive"
      });
    }
  };

  const testAutomation = async (automationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: {
          automation_id: automationId,
          trigger_data: {
            cost: 6.50,
            caller_number: '+1234567890',
            timestamp: new Date().toISOString(),
            test_mode: true
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Test Completato",
        description: "L'automazione è stata testata con successo"
      });

      await loadExecutions();

    } catch (error) {
      console.error('Error testing automation:', error);
      toast({
        title: "Errore Test",
        description: "Errore durante il test dell'automazione",
        variant: "destructive"
      });
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_notification': return Bell;
      case 'send_email': return Mail;
      case 'webhook': return Webhook;
      case 'create_alert': return AlertTriangle;
      case 'update_record': return Database;
      default: return Zap;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'skipped': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'skipped': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!currentOrganization) {
    return (
      <ModernCard variant="bordered" className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Seleziona un'organizzazione per gestire le automazioni</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <ModernCard variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Automazioni Workflow</h3>
              <p className="text-muted-foreground">
                Automatizza alert, report e azioni basate sui dati delle chiamate
              </p>
            </div>
          </div>
          
          {automations.length === 0 && (
            <ModernButton
              variant="primary"
              onClick={createDefaultAutomations}
              loading={creatingNew}
              icon={Plus}
            >
              Crea Automazioni di Default
            </ModernButton>
          )}
        </div>
      </ModernCard>

      {/* Automations List */}
      <ModernCard variant="elevated" className="p-6">
        <h4 className="text-lg font-semibold mb-4">Automazioni Attive</h4>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Caricamento automazioni...</p>
          </div>
        ) : automations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nessuna automazione configurata</p>
            <p>Crea le tue prime automazioni per iniziare</p>
          </div>
        ) : (
          <div className="space-y-4">
            {automations.map((automation) => (
              <div key={automation.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-medium">{automation.name}</h5>
                      <Badge variant={automation.is_active ? "default" : "secondary"}>
                        {automation.is_active ? "Attiva" : "Inattiva"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {automation.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Trigger: {automation.trigger_type}</span>
                      <span>Azioni: {automation.actions?.length || 0}</span>
                      <span>Creata: {new Date(automation.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Actions Preview */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs font-medium">Azioni:</span>
                      {automation.actions?.map((action: any, index: number) => {
                        const ActionIcon = getActionIcon(action.action_type);
                        return (
                          <div key={index} className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
                            <ActionIcon className="h-3 w-3" />
                            <span className="text-xs">{action.action_type.replace('_', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={() => testAutomation(automation.id)}
                      icon={Play}
                    >
                      Test
                    </ModernButton>
                    
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAutomation(automation.id, automation.is_active)}
                      icon={automation.is_active ? Pause : Play}
                    >
                      {automation.is_active ? 'Disattiva' : 'Attiva'}
                    </ModernButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModernCard>

      {/* Recent Executions */}
      <ModernCard variant="elevated" className="p-6">
        <h4 className="text-lg font-semibold mb-4">Esecuzioni Recenti</h4>
        
        {executions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nessuna esecuzione recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => {
              const StatusIcon = getStatusIcon(execution.status);
              return (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${getStatusColor(execution.status)}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{execution.automation?.name || 'Automazione'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(execution.executed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </ModernCard>
    </div>
  );
};