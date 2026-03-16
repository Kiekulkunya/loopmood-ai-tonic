import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

interface ReportPayload {
  recipient: string;
  sections: string[];
  data?: Record<string, any>;
}

function generateHTMLReport(sections: string[], data: Record<string, any>): string {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const sectionHTML: Record<string, string> = {
    overview: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 16px;font-size:14px;color:#3B82F6;text-transform:uppercase;letter-spacing:1px;">📊 Overview</h2>
        <table width="100%" cellpadding="0" cellspacing="8">
          <tr>
            <td width="25%" style="background:#1E293B;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#3B82F6;">1,950</div>
              <div style="font-size:9px;color:#64748B;margin-top:4px;">B2C Users</div>
            </td>
            <td width="25%" style="background:#1E293B;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#8B5CF6;">5</div>
              <div style="font-size:9px;color:#64748B;margin-top:4px;">B2B Clients</div>
            </td>
            <td width="25%" style="background:#1E293B;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#06B6D4;">12,000</div>
              <div style="font-size:9px;color:#64748B;margin-top:4px;">Reports</div>
            </td>
            <td width="25%" style="background:#1E293B;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:20px;font-weight:800;color:#10B981;">$624K</div>
              <div style="font-size:9px;color:#64748B;margin-top:4px;">ARR</div>
            </td>
          </tr>
        </table>
      </td></tr>`,
    feedback: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 12px;font-size:14px;color:#F59E0B;text-transform:uppercase;letter-spacing:1px;">💬 Feedback & Insights</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
          <tr><td style="padding:6px 0;color:#94A3B8;">Total Responses</td><td align="right" style="font-weight:700;color:#fff;">12</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Avg Satisfaction</td><td align="right" style="font-weight:700;color:#F59E0B;">4.2/5 ⭐</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">NPS Score</td><td align="right" style="font-weight:700;color:#10B981;">42</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Top Feature</td><td align="right" style="font-weight:700;color:#3B82F6;">Startup Classifier</td></tr>
        </table>
      </td></tr>`,
    growth: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 12px;font-size:14px;color:#10B981;text-transform:uppercase;letter-spacing:1px;">📈 Growth & Revenue</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
          <tr><td style="padding:6px 0;color:#94A3B8;">MRR Growth (MoM)</td><td align="right" style="font-weight:700;color:#10B981;">+37%</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Churn Rate</td><td align="right" style="font-weight:700;color:#10B981;">4.2%</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">NPS Change</td><td align="right" style="font-weight:700;color:#10B981;">+1</td></tr>
        </table>
      </td></tr>`,
    funnel: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 12px;font-size:14px;color:#06B6D4;text-transform:uppercase;letter-spacing:1px;">🎯 User Funnel</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
          <tr><td style="padding:6px 0;color:#94A3B8;">Visit → Signup Rate</td><td align="right" style="font-weight:700;color:#fff;">20%</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Report Completion</td><td align="right" style="font-weight:700;color:#10B981;">62%</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Paid Conversion</td><td align="right" style="font-weight:700;color:#fff;">45%</td></tr>
        </table>
      </td></tr>`,
    b2b: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 12px;font-size:14px;color:#8B5CF6;text-transform:uppercase;letter-spacing:1px;">🏢 B2B Pipeline</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
          <tr><td style="padding:6px 0;color:#94A3B8;">Pipeline Value</td><td align="right" style="font-weight:700;color:#8B5CF6;">$156,000</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Weighted Pipeline</td><td align="right" style="font-weight:700;color:#10B981;">$61,800</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Active Deals</td><td align="right" style="font-weight:700;color:#fff;">5</td></tr>
        </table>
      </td></tr>`,
    roadmap: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 12px;font-size:14px;color:#EC4899;text-transform:uppercase;letter-spacing:1px;">🚀 Roadmap</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
          <tr><td style="padding:6px 0;color:#94A3B8;">Current Phase</td><td align="right" style="font-weight:700;color:#3B82F6;">Phase 3: B2B + API</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Progress</td><td align="right" style="font-weight:700;color:#10B981;">10/16 items</td></tr>
        </table>
      </td></tr>`,
    competitive: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 12px;font-size:14px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">👑 Competitive</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
          <tr><td style="padding:6px 0;color:#94A3B8;">LoopAI Score</td><td align="right" style="font-weight:700;color:#3B82F6;">4/5</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Biggest Gap</td><td align="right" style="font-weight:700;color:#F97316;">B2B features vs PitchBook</td></tr>
        </table>
      </td></tr>`,
    system: `
      <tr><td style="padding:24px 32px;">
        <h2 style="margin:0 0 12px;font-size:14px;color:#14B8A6;text-transform:uppercase;letter-spacing:1px;">🖥️ System Health</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
          <tr><td style="padding:6px 0;color:#94A3B8;">Platform Uptime</td><td align="right" style="font-weight:700;color:#10B981;">99.93%</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Avg Latency</td><td align="right" style="font-weight:700;color:#06B6D4;">487ms</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">AI Provider Status</td><td align="right" style="font-weight:700;color:#10B981;">All Healthy</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">Edge Function Status</td><td align="right" style="font-weight:700;color:#10B981;">Operational</td></tr>
          <tr><td style="padding:6px 0;color:#94A3B8;">PDF Export</td><td align="right" style="font-weight:700;color:#F59E0B;">Warning (2.4s latency)</td></tr>
        </table>
      </td></tr>`,
  };

  const divider = `<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #1E293B;margin:0;"></td></tr>`;

  const body = sections
    .filter(s => sectionHTML[s])
    .map((s, i, arr) => sectionHTML[s] + (i < arr.length - 1 ? divider : ''))
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>LoopAI PM Report</title></head>
<body style="margin:0;padding:0;background-color:#0B0F19;font-family:'Segoe UI',Arial,sans-serif;color:#E2E8F0;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:20px auto;background-color:#111827;border-radius:12px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#1E293B,#0F172A);padding:24px 32px;border-bottom:1px solid #1E293B;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><h1 style="margin:0;font-size:22px;font-weight:800;color:#3B82F6;">LoopAI</h1>
        <p style="margin:4px 0 0;font-size:12px;color:#64748B;">PM Daily Report · ${date}</p></td>
      <td align="right"><span style="background:#3B82F6;color:#fff;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600;">AUTOMATED</span></td>
    </tr></table>
  </td></tr>
  ${body}
  <tr><td style="background:#0F172A;padding:20px 32px;border-top:1px solid #1E293B;">
    <p style="margin:0;font-size:9px;color:#475569;text-align:center;letter-spacing:1px;">
      LoopAI for TECH 41 Stanford · Automated PM Report · ${date}<br>
      <span style="color:#334155;">This is an automated email. Do not reply.</span>
    </p>
  </td></tr>
</table></body></html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ReportPayload = await req.json().catch(() => ({
      recipient: 'kullalin88@gmail.com',
      sections: ['overview', 'feedback', 'growth', 'funnel', 'b2b', 'roadmap', 'competitive'],
    }));

    const recipient = body.recipient || 'kullalin88@gmail.com';
    const sections = body.sections || ['overview', 'feedback', 'growth', 'funnel', 'b2b', 'roadmap', 'competitive'];
    const html = generateHTMLReport(sections, body.data || {});

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LoopAI PM <onboarding@resend.dev>',
        to: [recipient],
        subject: `📊 LoopAI PM Report — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('[send-pm-report] Resend error:', emailResult);
      return new Response(
        JSON.stringify({ success: false, error: emailResult.message || JSON.stringify(emailResult) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[send-pm-report] Email sent:', emailResult.id);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult.id,
        recipient,
        sentAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[send-pm-report] Error:', err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
