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
    const { automation_id, trigger_data } = await req.json();
    
    console.log('Executing automation:', { automation_id, trigger_data });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get automation details
    const { data: automation, error: automationError } = await supabase
      .from('automations')
      .select('*')
      .eq('id', automation_id)
      .eq('is_active', true)
      .single();

    if (automationError || !automation) {
      throw new Error('Automation not found or inactive');
    }

    console.log('Automation found:', automation);

    // Check trigger conditions
    const { trigger_conditions, actions } = automation;
    let conditionsMet = true;

    if (trigger_conditions && trigger_data) {
      // Evaluate trigger conditions
      for (const condition of trigger_conditions) {
        const { field, operator, value } = condition;
        const fieldValue = trigger_data[field];
        
        switch (operator) {
          case 'greater_than':
            conditionsMet = conditionsMet && (fieldValue > value);
            break;
          case 'less_than':
            conditionsMet = conditionsMet && (fieldValue < value);
            break;
          case 'equals':
            conditionsMet = conditionsMet && (fieldValue == value);
            break;
          case 'contains':
            conditionsMet = conditionsMet && fieldValue.includes(value);
            break;
          default:
            console.warn('Unknown operator:', operator);
        }
      }
    }

    console.log('Conditions met:', conditionsMet);

    if (!conditionsMet) {
      await supabase
        .from('automation_executions')
        .insert({
          automation_id,
          status: 'skipped',
          result: { reason: 'Conditions not met', trigger_data }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'skipped',
          message: 'Conditions not met' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execute actions
    const results = [];
    
    for (const action of actions) {
      try {
        const { action_type, config } = action;
        let result;

        switch (action_type) {
          case 'send_notification':
            result = await sendNotification(supabase, config, automation.organization_id);
            break;
          case 'send_email':
            result = await sendEmail(config, trigger_data);
            break;
          case 'create_alert':
            result = await createAlert(supabase, config, automation.organization_id, trigger_data);
            break;
          case 'webhook':
            result = await callWebhook(config, trigger_data);
            break;
          case 'update_record':
            result = await updateRecord(supabase, config, trigger_data);
            break;
          default:
            result = { success: false, error: `Unknown action type: ${action_type}` };
        }

        results.push({ action_type, result });
        console.log(`Action ${action_type} result:`, result);

      } catch (actionError) {
        console.error(`Error executing action ${action.action_type}:`, actionError);
        results.push({ 
          action_type: action.action_type, 
          result: { success: false, error: actionError.message } 
        });
      }
    }

    // Log execution
    await supabase
      .from('automation_executions')
      .insert({
        automation_id,
        status: 'completed',
        result: { 
          trigger_data, 
          actions_executed: results.length,
          results
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'completed',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in automation-executor function:', error);
    
    // Log failed execution
    if (req.automation_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('automation_executions')
        .insert({
          automation_id: req.automation_id,
          status: 'failed',
          result: { error: error.message }
        });
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Helper functions
async function sendNotification(supabase: any, config: any, organizationId: string) {
  const { title, message, user_ids } = config;
  
  // Get push subscriptions for users
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .in('user_id', user_ids || []);

  if (error) {
    throw new Error(`Failed to get subscriptions: ${error.message}`);
  }

  // Send push notifications
  const results = [];
  for (const subscription of subscriptions) {
    try {
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TTL': '86400'
        },
        body: JSON.stringify({
          title,
          body: message,
          icon: '/icon-192.png',
          badge: '/badge-72.png'
        })
      });
      
      results.push({ 
        user_id: subscription.user_id, 
        success: response.ok,
        status: response.status 
      });
    } catch (error) {
      results.push({ 
        user_id: subscription.user_id, 
        success: false, 
        error: error.message 
      });
    }
  }

  return { success: true, notifications_sent: results.length, results };
}

async function sendEmail(config: any, triggerData: any) {
  // Placeholder for email sending
  // You would integrate with your email service here (SendGrid, etc.)
  console.log('Email would be sent:', config, triggerData);
  return { success: true, message: 'Email sending not implemented yet' };
}

async function createAlert(supabase: any, config: any, organizationId: string, triggerData: any) {
  const { alert_type, title, description } = config;
  
  const { error } = await supabase
    .from('ai_insights')
    .insert({
      organization_id: organizationId,
      insight_type: 'automation_alert',
      title: title || 'Automation Alert',
      description: description || 'Alert triggered by automation',
      confidence_score: 1.0,
      data: { alert_type, trigger_data: triggerData },
      status: 'active'
    });

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`);
  }

  return { success: true, message: 'Alert created successfully' };
}

async function callWebhook(config: any, triggerData: any) {
  const { url, method = 'POST', headers = {}, body_template } = config;
  
  let body = body_template || triggerData;
  if (typeof body === 'string') {
    // Replace placeholders in body template
    for (const [key, value] of Object.entries(triggerData)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: method !== 'GET' ? JSON.stringify(body) : undefined
  });

  return { 
    success: response.ok, 
    status: response.status,
    response: await response.text()
  };
}

async function updateRecord(supabase: any, config: any, triggerData: any) {
  const { table, filter, updates } = config;
  
  // Apply updates with trigger data
  const processedUpdates: any = {};
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const field = value.slice(2, -2);
      processedUpdates[key] = triggerData[field];
    } else {
      processedUpdates[key] = value;
    }
  }

  const { error } = await supabase
    .from(table)
    .update(processedUpdates)
    .match(filter);

  if (error) {
    throw new Error(`Failed to update record: ${error.message}`);
  }

  return { success: true, message: 'Record updated successfully' };
}