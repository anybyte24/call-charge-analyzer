import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Server, 
  Download, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Folder,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface FTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  directory: string;
  autoSync: boolean;
  syncInterval: number; // minutes
}

interface FTPConnection {
  id: string;
  name: string;
  config: FTPConfig;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string | null;
  filesCount: number;
}

export const FTPImporter: React.FC = () => {
  const [connections, setConnections] = useState<FTPConnection[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<FTPConfig>>({
    host: '',
    port: 21,
    username: '',
    password: '',
    directory: '/',
    autoSync: false,
    syncInterval: 60
  });

  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  const testConnection = async () => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ftp-manager', {
        body: {
          action: 'test_connection',
          config: formData,
          organization_id: currentOrganization.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Connessione riuscita",
          description: `Trovati ${data.filesCount || 0} file nel server FTP`,
        });
      } else {
        throw new Error(data.error || 'Test connessione fallito');
      }
    } catch (error) {
      console.error('Error testing FTP connection:', error);
      toast({
        title: "Errore di connessione",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConnection = async () => {
    if (!currentOrganization || !formData.host || !formData.username) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ftp-manager', {
        body: {
          action: 'save_connection',
          config: formData,
          organization_id: currentOrganization.id,
          name: `${formData.host}:${formData.port}`
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Configurazione salvata",
          description: "La connessione FTP è stata configurata con successo",
        });
        setShowAddForm(false);
        setFormData({
          host: '',
          port: 21,
          username: '',
          password: '',
          directory: '/',
          autoSync: false,
          syncInterval: 60
        });
        loadConnections();
      }
    } catch (error) {
      console.error('Error saving FTP connection:', error);
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (connectionId: string) => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ftp-manager', {
        body: {
          action: 'sync_data',
          connection_id: connectionId,
          organization_id: currentOrganization.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Sincronizzazione completata",
          description: `Importati ${data.recordsImported || 0} nuovi record`,
        });
        loadConnections();
      }
    } catch (error) {
      console.error('Error syncing FTP data:', error);
      toast({
        title: "Errore sincronizzazione",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    if (!currentOrganization) return;

    try {
      const { data: integrations, error } = await supabase
        .from('api_integrations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('integration_type', 'ftp');

      if (!error && integrations) {
        const ftpConnections: FTPConnection[] = integrations.map(integration => ({
          id: integration.id,
          name: integration.name,
          config: integration.config as FTPConfig,
          status: integration.status === 'active' ? 'connected' : 'disconnected',
          lastSync: integration.last_sync,
          filesCount: integration.config?.filesCount || 0
        }));
        setConnections(ftpConnections);
      }
    } catch (error) {
      console.error('Error loading FTP connections:', error);
    }
  };

  React.useEffect(() => {
    loadConnections();
  }, [currentOrganization]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Importazione FTP</h2>
        </div>
        
        <ModernButton
          onClick={() => setShowAddForm(!showAddForm)}
          icon={showAddForm ? undefined : Settings}
          variant={showAddForm ? "outline" : "primary"}
        >
          {showAddForm ? 'Annulla' : 'Aggiungi Connessione'}
        </ModernButton>
      </div>

      {/* Add Connection Form */}
      {showAddForm && (
        <ModernCard variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nuova Connessione FTP</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="host">Server Host *</Label>
              <Input
                id="host"
                value={formData.host}
                onChange={(e) => setFormData({...formData, host: e.target.value})}
                placeholder="ftp.example.com"
              />
            </div>

            <div>
              <Label htmlFor="port">Porta</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                placeholder="21"
              />
            </div>

            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="username"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="password"
              />
            </div>

            <div>
              <Label htmlFor="directory">Directory</Label>
              <Input
                id="directory"
                value={formData.directory}
                onChange={(e) => setFormData({...formData, directory: e.target.value})}
                placeholder="/data/"
              />
            </div>

            <div>
              <Label htmlFor="syncInterval">Intervallo Sync (minuti)</Label>
              <Input
                id="syncInterval"
                type="number"
                value={formData.syncInterval}
                onChange={(e) => setFormData({...formData, syncInterval: parseInt(e.target.value)})}
                placeholder="60"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <ModernButton
                variant="outline"
                onClick={testConnection}
                loading={loading}
                icon={CheckCircle}
              >
                Testa Connessione
              </ModernButton>
            </div>
            
            <ModernButton
              onClick={saveConnection}
              loading={loading}
              icon={Download}
            >
              Salva Configurazione
            </ModernButton>
          </div>
        </ModernCard>
      )}

      {/* Connections List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {connections.map((connection) => (
          <ModernCard key={connection.id} variant="bordered" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{connection.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {connection.config.host}:{connection.config.port}
                  </p>
                </div>
              </div>
              
              <Badge 
                variant={connection.status === 'connected' ? 'default' : 'secondary'}
                className={connection.status === 'connected' ? 'bg-green-500' : ''}
              >
                {connection.status === 'connected' ? 'Connesso' : 'Disconnesso'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Folder className="h-4 w-4" />
                <span>Directory: {connection.config.directory}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>Sync: ogni {connection.config.syncInterval} minuti</span>
              </div>

              {connection.lastSync && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ultimo sync: {new Date(connection.lastSync).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => syncData(connection.id)}
                loading={loading}
                icon={Download}
              >
                Sincronizza Ora
              </ModernButton>
            </div>
          </ModernCard>
        ))}
      </div>

      {connections.length === 0 && !showAddForm && (
        <ModernCard variant="glass" className="p-12 text-center">
          <Server className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nessuna connessione FTP</h3>
          <p className="text-muted-foreground mb-4">
            Configura una connessione FTP per importare automaticamente i dati dal tuo provider
          </p>
          <ModernButton onClick={() => setShowAddForm(true)} icon={Settings}>
            Aggiungi Prima Connessione
          </ModernButton>
        </ModernCard>
      )}
    </div>
  );
};