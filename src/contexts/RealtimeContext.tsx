import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './OrganizationContext';

interface RealtimeContextType {
  isConnected: boolean;
  analyticsEvents: any[];
  aiInsights: any[];
  connect: () => void;
  disconnect: () => void;
  trackEvent: (eventType: string, eventData: any, sessionId?: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  const { currentOrganization } = useOrganization();

  const connect = useCallback(() => {
    if (!currentOrganization || socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://hwazxzzuizyvbxgmuuwi.supabase.co/functions/v1/realtime-updates`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Subscribe to analytics for current organization
      newSocket.send(JSON.stringify({
        type: 'subscribe_analytics',
        organization_id: currentOrganization.id
      }));
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Real-time message:', data);

        switch (data.type) {
          case 'analytics_event':
            setAnalyticsEvents(prev => [data.data, ...prev].slice(0, 100));
            break;
          case 'ai_insight':
            setAiInsights(prev => [data.data, ...prev].slice(0, 50));
            break;
          case 'connection_established':
          case 'subscription_active':
            console.log('Real-time subscription active');
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (currentOrganization) {
          connect();
        }
      }, 3000);
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setSocket(newSocket);
  }, [currentOrganization, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const trackEvent = useCallback((eventType: string, eventData: any, sessionId?: string) => {
    if (!socket || !currentOrganization || socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot track event: WebSocket not connected');
      return;
    }

    socket.send(JSON.stringify({
      type: 'track_event',
      organization_id: currentOrganization.id,
      event_type: eventType,
      event_data: eventData,
      session_id: sessionId,
      user_id: null // Will be set by auth context if needed
    }));
  }, [socket, currentOrganization]);

  useEffect(() => {
    if (currentOrganization) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [currentOrganization, connect, disconnect]);

  // Set up Supabase real-time subscriptions as fallback
  useEffect(() => {
    if (!currentOrganization) return;

    const analyticsChannel = supabase
      .channel(`analytics-${currentOrganization.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        (payload) => {
          console.log('Analytics event from Supabase:', payload);
          setAnalyticsEvents(prev => [payload.new, ...prev].slice(0, 100));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_insights',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        (payload) => {
          console.log('AI insight from Supabase:', payload);
          setAiInsights(prev => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(analyticsChannel);
    };
  }, [currentOrganization]);

  const value: RealtimeContextType = {
    isConnected,
    analyticsEvents,
    aiInsights,
    connect,
    disconnect,
    trackEvent,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};