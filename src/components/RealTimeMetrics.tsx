import React, { useEffect, useState } from 'react';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { Badge } from '@/components/ui/badge';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  Activity, Clock, Users, Eye, TrendingUp, 
  Wifi, WifiOff, Circle 
} from 'lucide-react';

interface RealTimeMetricsProps {
  className?: string;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ className }) => {
  const [activeUsers, setActiveUsers] = useState(12);
  const [currentSessions, setCurrentSessions] = useState(3);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  const { 
    isConnected, 
    analyticsEvents, 
    trackEvent, 
    connect, 
    disconnect 
  } = useRealtime();
  
  const { currentOrganization } = useOrganization();

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
      setCurrentSessions(prev => Math.max(1, prev + Math.floor(Math.random() * 2) - 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update recent activity from real-time events
  useEffect(() => {
    if (analyticsEvents.length > 0) {
      setRecentActivity(prev => [
        ...analyticsEvents.slice(0, 5),
        ...prev
      ].slice(0, 10));
    }
  }, [analyticsEvents]);

  const simulateActivity = () => {
    const activities = [
      'file_upload', 'analysis_complete', 'export_pdf', 
      'cost_alert', 'user_login', 'data_sync'
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    trackEvent(activity, {
      timestamp: new Date().toISOString(),
      user_action: true,
      simulated: true
    });
  };

  const getActivityIcon = (eventType: string) => {
    switch (eventType) {
      case 'file_upload': return '📁';
      case 'analysis_complete': return '📊';
      case 'export_pdf': return '📄';
      case 'cost_alert': return '⚠️';
      case 'user_login': return '👤';
      case 'data_sync': return '🔄';
      default: return '📋';
    }
  };

  const getActivityColor = (eventType: string) => {
    switch (eventType) {
      case 'cost_alert': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'analysis_complete': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'file_upload': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  if (!currentOrganization) {
    return (
      <ModernCard variant="bordered" className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Seleziona un'organizzazione per vedere le metriche real-time</p>
        </div>
      </ModernCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <ModernCard variant="glass" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                {isConnected ? 'Connesso' : 'Disconnesso'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'Real-time attivo' : 'Tentativo di riconnessione...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Circle className={`h-2 w-2 ${isConnected ? 'text-green-500 animate-pulse' : 'text-red-500'}`} fill="currentColor" />
            {!isConnected && (
              <ModernButton 
                variant="outline" 
                size="sm" 
                onClick={connect}
              >
                Riconnetti
              </ModernButton>
            )}
          </div>
        </div>
      </ModernCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Utenti Attivi</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
              <p className="text-xs text-green-600">+2 ultima ora</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sessioni Attive</p>
              <p className="text-2xl font-bold">{currentSessions}</p>
              <p className="text-xs text-blue-600">In tempo reale</p>
            </div>
          </div>
        </ModernCard>

        <ModernCard variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Eventi/min</p>
              <p className="text-2xl font-bold">{analyticsEvents.length}</p>
              <p className="text-xs text-purple-600">Ultimo minuto</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Recent Activity */}
      <ModernCard variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Attività Real-time</h3>
          </div>
          
          <ModernButton
            variant="outline"
            size="sm"
            onClick={simulateActivity}
            disabled={!isConnected}
          >
            Simula Attività
          </ModernButton>
        </div>

        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nessuna attività recente</p>
              <p className="text-sm">L'attività apparirà qui in tempo reale</p>
            </div>
          ) : (
            recentActivity.map((event, index) => (
              <div 
                key={`${event.id || index}-${event.timestamp}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getActivityIcon(event.event_type)}
                  </span>
                  <div>
                    <p className="font-medium">
                      {event.event_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.event_data?.description || 'Attività dell\'utente'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={getActivityColor(event.event_type)}
                  >
                    {event.event_data?.simulated ? 'Simulato' : 'Live'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCard>
    </div>
  );
};