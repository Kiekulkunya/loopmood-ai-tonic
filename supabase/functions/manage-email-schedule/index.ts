import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const JOB_NAME = 'pm-report-scheduled';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // Use the actual JWT anon key for cron HTTP calls
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || '';

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Log keys for debugging (first 20 chars only)
    console.log(`[manage-email-schedule] Using URL: ${supabaseUrl}`);
    console.log(`[manage-email-schedule] Anon key starts with: ${anonKey.substring(0, 20)}...`);

    const body = await req.json();
    const { action } = body;

    if (action === 'set') {
      const { cronExpression, recipient, sections } = body;

      if (!cronExpression || !recipient) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing cronExpression or recipient' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const payloadJson = JSON.stringify({
        recipient,
        sections: sections || ['overview','feedback','growth','funnel','b2b','roadmap','competitive']
      }).replace(/'/g, "''");

      const functionUrl = `${supabaseUrl}/functions/v1/send-pm-report`;

      // Unschedule existing job first (ignore error if not exists)
      try {
        await supabase.rpc('exec_sql', {
          sql: `SELECT cron.unschedule('${JOB_NAME}')`
        });
      } catch (_e) {
        // Job might not exist yet, that's fine
      }

      // Schedule new cron job
      const scheduleSQL = `
        SELECT cron.schedule(
          '${JOB_NAME}',
          '${cronExpression}',
          $CRON$
          SELECT net.http_post(
            url := '${functionUrl}',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
            body := '${payloadJson}'::jsonb
          ) AS request_id;
          $CRON$
        )
      `;

      const { data, error } = await supabase.rpc('exec_sql', { sql: scheduleSQL });

      if (error) {
        console.error('[manage-email-schedule] Error scheduling:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[manage-email-schedule] Scheduled: ${cronExpression} for ${recipient}`, data);
      return new Response(
        JSON.stringify({ success: true, cronExpression, recipient }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'remove') {
      try {
        await supabase.rpc('exec_sql', {
          sql: `SELECT cron.unschedule('${JOB_NAME}')`
        });
      } catch (_e) {
        // Ignore
      }

      console.log(`[manage-email-schedule] Unscheduled`);
      return new Response(
        JSON.stringify({ success: true, removed: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'status') {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Use: set, remove, status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (err) {
    console.error('[manage-email-schedule] Error:', err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
