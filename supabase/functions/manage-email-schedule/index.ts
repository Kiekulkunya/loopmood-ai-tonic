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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action } = body;

    if (action === 'set') {
      // Set or update the cron schedule
      const { cronExpression, recipient, sections } = body;

      if (!cronExpression || !recipient) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing cronExpression or recipient' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Remove existing job if any
      await supabase.rpc('', {}).catch(() => {});
      const { error: unscheduleError } = await supabase.from('_unused').select().limit(0).catch(() => ({ error: null }));

      // Use raw SQL via pg to unschedule existing and create new
      const payloadJson = JSON.stringify({ recipient, sections: sections || ['overview','feedback','growth','funnel','b2b','roadmap','competitive'] });

      const functionUrl = `${supabaseUrl}/functions/v1/send-pm-report`;

      // Unschedule existing job
      const { error: err1 } = await supabase.rpc('exec_sql', {
        sql: `SELECT cron.unschedule('${JOB_NAME}') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = '${JOB_NAME}')`
      }).catch(() => ({ error: 'no exec_sql' }));

      // We'll use direct SQL via the management API instead
      // First try to unschedule
      try {
        await supabase.from('cron.job').delete().eq('jobname', JOB_NAME);
      } catch (e) {
        // Job might not exist yet
      }

      // Schedule new cron job using pg_net to call the edge function
      const scheduleSQL = `
        SELECT cron.schedule(
          '${JOB_NAME}',
          '${cronExpression}',
          $$
          SELECT net.http_post(
            url := '${functionUrl}',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
            body := '${payloadJson}'::jsonb
          ) AS request_id;
          $$
        );
      `;

      // Execute via supabase management - use the postgres connection
      const { data, error } = await supabase.rpc('exec_sql', { sql: scheduleSQL });

      if (error) {
        // Fallback: try direct query
        console.log('exec_sql not available, trying alternative approach');

        // Use fetch to the database REST endpoint
        const pgResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
          body: JSON.stringify({ sql: scheduleSQL }),
        });

        if (!pgResponse.ok) {
          const pgError = await pgResponse.text();
          console.error('Failed to schedule via REST:', pgError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create cron schedule. exec_sql function may need to be created.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.log(`[manage-email-schedule] Scheduled: ${cronExpression} for ${recipient}`);

      return new Response(
        JSON.stringify({ success: true, cronExpression, recipient }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'remove') {
      // Remove the scheduled job
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `SELECT cron.unschedule('${JOB_NAME}')`
      });

      if (error) {
        const pgResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
          body: JSON.stringify({ sql: `SELECT cron.unschedule('${JOB_NAME}')` }),
        });
      }

      console.log(`[manage-email-schedule] Unscheduled job`);

      return new Response(
        JSON.stringify({ success: true, removed: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'status') {
      // Check current schedule status
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname = '${JOB_NAME}'`
      });

      return new Response(
        JSON.stringify({ success: true, jobs: data || [] }),
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
