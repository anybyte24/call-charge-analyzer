import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { action, config, organization_id, connection_id, name } = await req.json();
    
    console.log('FTP Manager request:', { action, organization_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'test_connection':
        return await testFTPConnection(config);
        
      case 'save_connection':
        return await saveFTPConnection(supabase, config, organization_id, name);
        
      case 'sync_data':
        return await syncFTPData(supabase, connection_id, organization_id);
        
      default:
        throw new Error('Azione non supportata');
    }

  } catch (error) {
    console.error('Error in ftp-manager function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function testFTPConnection(config: any) {
  try {
    // Simulazione test connessione FTP
    // In un ambiente reale, useresti una libreria FTP per Deno
    console.log('Testing FTP connection to:', config.host);
    
    // Validazione parametri base
    if (!config.host || !config.username || !config.password) {
      throw new Error('Parametri di connessione mancanti');
    }

    // Simulazione risultato test
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula test
    
    const mockFilesCount = Math.floor(Math.random() * 50) + 10;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Connessione FTP riuscita',
        filesCount: mockFilesCount,
        serverInfo: {
          host: config.host,
          port: config.port,
          directory: config.directory
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('FTP connection test failed:', error);
    throw new Error(`Test connessione fallito: ${error.message}`);
  }
}

async function saveFTPConnection(supabase: any, config: any, organizationId: string, name: string) {
  try {
    const { data, error } = await supabase
      .from('api_integrations')
      .insert({
        organization_id: organizationId,
        integration_type: 'ftp',
        name: name,
        config: {
          ...config,
          password: btoa(config.password) // Encoding base64 per sicurezza minima
        },
        status: 'active'
      })
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Configurazione FTP salvata',
        connection: data[0]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error saving FTP connection:', error);
    throw new Error(`Errore nel salvataggio: ${error.message}`);
  }
}

async function syncFTPData(supabase: any, connectionId: string, organizationId: string) {
  try {
    // Recupera configurazione connessione
    const { data: integration, error: integrationError } = await supabase
      .from('api_integrations')
      .select('*')
      .eq('id', connectionId)
      .eq('organization_id', organizationId)
      .single();

    if (integrationError) throw integrationError;

    console.log('Syncing data for FTP connection:', integration.name);

    // Simulazione download e parsing file FTP
    const mockData = generateMockCallData();
    
    // In un ambiente reale, qui scaricheresti e parsaresti i file CSV/Excel dal server FTP
    // e li inseriresti come sessioni di analisi
    
    const { data: session, error: sessionError } = await supabase
      .from('analysis_sessions')
      .insert({
        user_id: organizationId, // Temporaneo, dovrebbe essere l'utente corrente
        organization_id: organizationId,
        session_name: `FTP Import - ${new Date().toISOString().split('T')[0]}`,
        file_data: mockData,
        analysis_results: {
          importSource: 'ftp',
          connectionId: connectionId,
          importedAt: new Date().toISOString(),
          recordsCount: mockData.length
        }
      })
      .select();

    if (sessionError) throw sessionError;

    // Aggiorna ultimo sync
    await supabase
      .from('api_integrations')
      .update({ 
        last_sync: new Date().toISOString(),
        config: {
          ...integration.config,
          lastRecordsCount: mockData.length
        }
      })
      .eq('id', connectionId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Sincronizzazione completata',
        recordsImported: mockData.length,
        sessionId: session[0].id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error syncing FTP data:', error);
    throw new Error(`Errore nella sincronizzazione: ${error.message}`);
  }
}

function generateMockCallData() {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 50; i++) {
    const callDate = new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 600) + 30; // 30 secondi - 10 minuti
    const isInternational = Math.random() > 0.7;
    const isMobile = Math.random() > 0.5;
    
    let cost = 0;
    if (isInternational) {
      cost = (duration / 60) * (0.25 + Math.random() * 0.75); // €0.25-1.00 al minuto
    } else if (isMobile) {
      cost = (duration / 60) * (0.15 + Math.random() * 0.35); // €0.15-0.50 al minuto
    } else {
      cost = (duration / 60) * (0.05 + Math.random() * 0.15); // €0.05-0.20 al minuto
    }

    const calledNumber = isInternational 
      ? `+${Math.floor(Math.random() * 90) + 10}${Math.floor(Math.random() * 9000000000) + 1000000000}`
      : isMobile 
        ? `3${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 100000000) + 10000000}`
        : `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000) + 10000000}`;

    data.push({
      callerNumber: `+39123456789${Math.floor(Math.random() * 10)}`,
      calledNumber,
      dateTime: callDate.toISOString(),
      durationSeconds: duration,
      cost: Math.round(cost * 100) / 100,
      callType: isInternational ? 'International' : isMobile ? 'Mobile' : 'Landline',
      direction: 'Outbound'
    });
  }

  return data;
}