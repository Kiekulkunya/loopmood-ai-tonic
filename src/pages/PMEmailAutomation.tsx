import { useState, useEffect } from "react";
import {
  Mail, Clock, CheckCircle2, XCircle, Send, RotateCcw,
  Calendar, Settings, Play, Pause, AlertTriangle,
  FileText, Users, TrendingUp, Target, Building2, Rocket, Crown,
  Sparkles, Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";

interface EmailLog {
  id: string;
  recipient: string;
  status: "success" | "failed" | "pending";
  sentAt: string;
  emailId?: string;
  error?: string;
  reportSections: string[];
  trigger: "scheduled" | "manual";
}

interface ScheduleConfig {
  enabled: boolean;
  time: string;
  recipient: string;
  timezone: string;
  sections: string[];
}

const REPORT_SECTIONS = [
  { id: "overview", label: "Overview", icon: FileText, color: "#3B82F6", desc: "B2C users, B2B clients, reports, ARR" },
  { id: "feedback", label: "Feedback & Insights", icon: Users, color: "#F59E0B", desc: "Satisfaction, NPS, feature rankings, suggestions" },
  { id: "growth", label: "Growth & Revenue", icon: TrendingUp, color: "#10B981", desc: "MRR growth, churn rate, NPS trend" },
  { id: "funnel", label: "User Funnel", icon: Target, color: "#06B6D4", desc: "Conversion rates across 6 stages" },
  { id: "b2b", label: "B2B Pipeline", icon: Building2, color: "#8B5CF6", desc: "Pipeline value, weighted deals, active prospects" },
  { id: "roadmap", label: "Roadmap", icon: Rocket, color: "#EC4899", desc: "Current phase, completed items, progress" },
  { id: "competitive", label: "Competitive", icon: Crown, color: "#F97316", desc: "LoopAI score vs competitors, gap analysis" },
];

const INITIAL_LOGS: EmailLog[] = [
  { id: "e1", recipient: "kullalin88@gmail.com", status: "success", sentAt: "2025-03-14T00:00:12Z", emailId: "re_abc123", reportSections: ["overview","feedback","growth","funnel","b2b","roadmap","competitive"], trigger: "scheduled" },
  { id: "e2", recipient: "kullalin88@gmail.com", status: "success", sentAt: "2025-03-13T00:00:08Z", emailId: "re_def456", reportSections: ["overview","feedback","growth","funnel","b2b","roadmap","competitive"], trigger: "scheduled" },
  { id: "e3", recipient: "kullalin88@gmail.com", status: "success", sentAt: "2025-03-12T00:00:15Z", emailId: "re_ghi789", reportSections: ["overview","feedback","growth","funnel","b2b","roadmap","competitive"], trigger: "scheduled" },
  { id: "e4", recipient: "kullalin88@gmail.com", status: "failed", sentAt: "2025-03-11T00:00:22Z", error: "Resend API rate limit exceeded", reportSections: ["overview","feedback","growth"], trigger: "scheduled" },
  { id: "e5", recipient: "kullalin88@gmail.com", status: "success", sentAt: "2025-03-10T15:32:00Z", emailId: "re_jkl012", reportSections: ["overview","feedback"], trigger: "manual" },
  { id: "e6", recipient: "kullalin88@gmail.com", status: "success", sentAt: "2025-03-10T00:00:11Z", emailId: "re_mno345", reportSections: ["overview","feedback","growth","funnel","b2b","roadmap","competitive"], trigger: "scheduled" },
  { id: "e7", recipient: "kullalin88@gmail.com", status: "success", sentAt: "2025-03-09T00:00:09Z", emailId: "re_pqr678", reportSections: ["overview","feedback","growth","funnel","b2b","roadmap","competitive"], trigger: "scheduled" },
];

export default function PMEmailAutomation() {
  const { logAct } = useApp();

  const [config, setConfig] = useState<ScheduleConfig>({
    enabled: true,
    time: "00:00",
    recipient: "kullalin88@gmail.com",
    timezone: "Asia/Bangkok",
    sections: REPORT_SECTIONS.map((s) => s.id),
  });

  const [logs, setLogs] = useState<EmailLog[]>(INITIAL_LOGS);
  const [isSending, setIsSending] = useState(false);

  const totalSent = logs.filter((l) => l.status === "success").length;
  const totalFailed = logs.filter((l) => l.status === "failed").length;
  const successRate = logs.length > 0 ? Math.round((totalSent / logs.length) * 100) : 0;

  const getNextScheduled = () => {
    const now = new Date();
    const [h, m] = config.time.split(":").map(Number);
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  };

  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!config.enabled) { setCountdown("Paused"); return; }
    const interval = setInterval(() => {
      const next = getNextScheduled();
      const diff = next.getTime() - Date.now();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${hrs}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [config.enabled, config.time]);

  const toggleSection = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.includes(id)
        ? prev.sections.filter((s) => s !== id)
        : [...prev.sections, id],
    }));
  };

  const handleManualSend = async () => {
    if (config.sections.length === 0) {
      toast.error("Select at least one report section");
      return;
    }

    setIsSending(true);
    logAct("email_report_manual", "pm/email");

    // Simulate sending (no edge function required for demo)
    await new Promise((r) => setTimeout(r, 2000));

    const success = Math.random() > 0.15;
    const newLog: EmailLog = {
      id: `e-${Date.now()}`,
      recipient: config.recipient,
      status: success ? "success" : "failed",
      sentAt: new Date().toISOString(),
      emailId: success ? `re_${Math.random().toString(36).slice(2, 8)}` : undefined,
      error: success ? undefined : "Simulated: Edge function not deployed yet",
      reportSections: config.sections,
      trigger: "manual",
    };

    setLogs((prev) => [newLog, ...prev]);
    if (success) {
      toast.success(`Report sent to ${config.recipient}`);
    } else {
      toast.error("Failed to send report (demo mode)");
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Email Report Automation
        </h1>
        <p className="text-[10px] text-muted-foreground">
          Automated nightly PM dashboard reports to {config.recipient}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Send, color: "text-primary", bg: "bg-primary/15", value: totalSent, label: "Emails Sent" },
          { icon: CheckCircle2, color: "text-accent", bg: "bg-accent/15", value: `${successRate}%`, label: "Success Rate" },
          { icon: config.enabled ? Play : Pause, color: config.enabled ? "text-accent" : "text-warning", bg: config.enabled ? "bg-accent/15" : "bg-warning/15", value: config.enabled ? "Active" : "Paused", label: "Schedule Status" },
          { icon: Clock, color: "text-primary", bg: "bg-primary/15", value: countdown, label: "Next Send", mono: true },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className={`text-xl font-black text-foreground ${kpi.mono ? "font-mono text-lg" : ""}`}>{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Schedule Config */}
        <div className="col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Schedule Settings</h3>
              </div>

              <div className="flex items-center justify-between mb-4 py-2 px-3 rounded-lg bg-background border border-border">
                <span className="text-xs text-foreground">Auto-send enabled</span>
                <button
                  onClick={() => setConfig((p) => ({ ...p, enabled: !p.enabled }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${config.enabled ? "bg-accent" : "bg-muted"}`}
                >
                  <div className="w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all" style={{ left: config.enabled ? 22 : 2 }} />
                </button>
              </div>

              <div className="mb-3">
                <label className="text-[10px] text-muted-foreground block mb-1">Send Time</label>
                <input
                  type="time"
                  value={config.time}
                  onChange={(e) => setConfig((p) => ({ ...p, time: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
                />
              </div>

              <div className="mb-3">
                <label className="text-[10px] text-muted-foreground block mb-1">Timezone</label>
                <select
                  value={config.timezone}
                  onChange={(e) => setConfig((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none"
                >
                  <option value="Asia/Bangkok">Asia/Bangkok (ICT)</option>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="text-[10px] text-muted-foreground block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={config.recipient}
                  onChange={(e) => setConfig((p) => ({ ...p, recipient: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground block mb-2">Report Sections</label>
                <div className="space-y-1.5">
                  {REPORT_SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const included = config.sections.includes(sec.id);
                    return (
                      <button
                        key={sec.id}
                        onClick={() => toggleSection(sec.id)}
                        className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg border text-left transition-all ${
                          included
                            ? "border-opacity-30 bg-opacity-5"
                            : "border-border bg-transparent opacity-40"
                        }`}
                        style={{
                          borderColor: included ? sec.color + "44" : undefined,
                          backgroundColor: included ? sec.color + "08" : undefined,
                        }}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            included ? "border-primary bg-primary" : "border-muted"
                          }`}
                        >
                          {included && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <Icon className="w-3.5 h-3.5" style={{ color: sec.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-semibold" style={{ color: included ? sec.color : undefined }}>
                            {sec.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleManualSend}
                disabled={isSending || config.sections.length === 0}
                className="w-full mt-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs disabled:opacity-50"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    Send Report Now
                  </span>
                )}
              </Button>
              <p className="text-[8px] text-muted-foreground text-center mt-2">
                {config.sections.length} sections selected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email History Log */}
        <div className="col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Send History
                </h3>
                <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20">
                  {logs.length} records
                </Badge>
              </div>

              <div className="space-y-2 max-h-[560px] overflow-y-auto">
                {logs.map((log) => {
                  const isSuccess = log.status === "success";
                  const date = new Date(log.sentAt);

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 py-3 px-4 rounded-lg border transition-colors ${
                        isSuccess ? "bg-background border-border/50" : "bg-destructive/5 border-destructive/15"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-foreground">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <Badge
                            className={`text-[7px] px-1.5 ${
                              log.trigger === "scheduled"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }`}
                          >
                            {log.trigger === "scheduled" ? "⏰ Scheduled" : "✋ Manual"}
                          </Badge>
                        </div>

                        <div className="text-[9px] text-muted-foreground mb-1.5">
                          To: {log.recipient}
                          {log.emailId && <span className="ml-2">ID: {log.emailId}</span>}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {log.reportSections.map((secId) => {
                            const sec = REPORT_SECTIONS.find((s) => s.id === secId);
                            return sec ? (
                              <span
                                key={secId}
                                className="px-1.5 py-0.5 rounded text-[7px] font-medium"
                                style={{ backgroundColor: sec.color + "12", color: sec.color }}
                              >
                                {sec.label}
                              </span>
                            ) : null;
                          })}
                        </div>

                        {log.error && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-destructive">
                            <AlertTriangle className="w-3 h-3" />
                            {log.error}
                          </div>
                        )}
                      </div>

                      <Badge
                        className={`text-[8px] shrink-0 ${
                          isSuccess
                            ? "bg-accent/10 text-accent border-accent/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        {isSuccess ? "✓ Delivered" : "✗ Failed"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Setup Instructions */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Setup Guide</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-[9px] text-muted-foreground leading-relaxed">
            <div>
              <div className="text-[10px] font-bold text-primary mb-1">1. Email Provider</div>
              <p>Sign up at <span className="text-primary">resend.com</span> (free tier: 100 emails/day). Get your API key and set it as a secret.</p>
              <code className="block mt-1 bg-background p-2 rounded text-[8px] text-accent">RESEND_API_KEY=re_xxxxx</code>
            </div>
            <div>
              <div className="text-[10px] font-bold text-warning mb-1">2. Cron Schedule</div>
              <p>Set up a cron job to call the Edge Function at midnight daily.</p>
              <code className="block mt-1 bg-background p-2 rounded text-[8px] text-accent">cron.schedule('pm-report', '0 0 * * *')</code>
            </div>
            <div>
              <div className="text-[10px] font-bold text-accent mb-1">3. Verify</div>
              <p>Use "Send Report Now" button to test. Check the send history for delivery confirmation. All sends are logged with email ID for tracking.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
