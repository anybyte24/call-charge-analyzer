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
    const { data, analysis_type = 'pattern_analysis' } = await req.json();
    
    console.log('AI Insights request:', { data, analysis_type });
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let prompt = '';
    let insights = [];

    switch (analysis_type) {
      case 'pattern_analysis':
        prompt = `Analizza i seguenti dati delle chiamate e identifica pattern significativi:
        ${JSON.stringify(data, null, 2)}
        
        Fornisci insights su:
        1. Pattern temporali (ore di picco, giorni preferiti)
        2. Anomalie nei costi
        3. Numeri chiamati frequentemente
        4. Suggerimenti per ottimizzazione costi
        
        Rispondi in formato JSON con: {insights: [{title, description, confidence_score, type, recommendation}]}`;
        break;

      case 'cost_prediction':
        prompt = `Basandoti sui dati storici delle chiamate, predici i costi futuri:
        ${JSON.stringify(data, null, 2)}
        
        Analizza:
        1. Trend dei costi mensili
        2. Previsioni per i prossimi 3 mesi
        3. Fattori che influenzano i costi
        4. Raccomandazioni per riduzione costi
        
        Rispondi in formato JSON con previsioni dettagliate.`;
        break;

      case 'anomaly_detection':
        prompt = `Identifica anomalie nei seguenti dati delle chiamate:
        ${JSON.stringify(data, null, 2)}
        
        Cerca:
        1. Picchi inusuali nei costi
        2. Numeri chiamati con frequenza anomala
        3. Pattern di chiamate sospetti
        4. Variazioni inaspettate nelle durate
        
        Rispondi in formato JSON con anomalie trovate.`;
        break;

      default:
        throw new Error('Tipo di analisi non supportato');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto analista di dati telefonici. Fornisci sempre risposte in italiano e in formato JSON valido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse AI response
    try {
      const parsedContent = JSON.parse(content);
      insights = parsedContent.insights || parsedContent;
    } catch (e) {
      console.warn('Failed to parse AI response as JSON, using raw content');
      insights = [{
        title: 'Analisi AI',
        description: content,
        confidence_score: 0.8,
        type: analysis_type,
        recommendation: 'Revisiona manualmente i risultati'
      }];
    }

    // Store insights in database if organization_id provided
    const { organization_id } = await req.json();
    if (organization_id && Array.isArray(insights)) {
      for (const insight of insights) {
        await supabase
          .from('ai_insights')
          .insert({
            organization_id,
            insight_type: analysis_type,
            title: insight.title || 'AI Insight',
            description: insight.description || insight.recommendation || 'Nessuna descrizione',
            confidence_score: insight.confidence_score || 0.8,
            data: insight,
            status: 'active'
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        analysis_type 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-insights function:', error);
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