import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('WebSocket connection established');

    socket.onopen = () => {
      console.log('WebSocket opened');
      socket.send(JSON.stringify({
        type: 'connection_established',
        message: 'Real-time updates active'
      }));
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        switch (data.type) {
          case 'subscribe_analytics':
            // Subscribe to analytics events for organization
            const { organization_id } = data;
            
            if (organization_id) {
              // Set up real-time subscription
              const channel = supabase
                .channel(`analytics-${organization_id}`)
                .on(
                  'postgres_changes',
                  {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'analytics_events',
                    filter: `organization_id=eq.${organization_id}`
                  },
                  (payload) => {
                    console.log('Analytics event:', payload);
                    socket.send(JSON.stringify({
                      type: 'analytics_event',
                      data: payload.new
                    }));
                  }
                )
                .on(
                  'postgres_changes',
                  {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ai_insights',
                    filter: `organization_id=eq.${organization_id}`
                  },
                  (payload) => {
                    console.log('New AI insight:', payload);
                    socket.send(JSON.stringify({
                      type: 'ai_insight',
                      data: payload.new
                    }));
                  }
                )
                .subscribe();

              socket.send(JSON.stringify({
                type: 'subscription_active',
                organization_id
              }));
            }
            break;

          case 'track_event':
            // Track analytics event
            const { event_type, event_data, session_id, user_id, organization_id: org_id } = data;
            
            if (org_id) {
              await supabase
                .from('analytics_events')
                .insert({
                  organization_id: org_id,
                  event_type,
                  event_data,
                  session_id,
                  user_id,
                  timestamp: new Date().toISOString()
                });

              socket.send(JSON.stringify({
                type: 'event_tracked',
                success: true
              }));
            }
            break;

          case 'ping':
            socket.send(JSON.stringify({ type: 'pong' }));
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return response;

  } catch (error) {
    console.error('Error in realtime-updates function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});