import { useState, useEffect, useRef, useMemo } from "react";
import {
  Mail, Clock, CheckCircle2, XCircle, Send,
  Calendar, Settings, Play, Pause, AlertTriangle,
  FileText, Users, TrendingUp, Target, Building2, Rocket, Crown,
  Sparkles, Shield, Download, ChevronLeft, ChevronRight, Repeat, CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { downloadAsImage } from "@/lib/downloadUtils";

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

type RepeatMode = "none" | "daily" | "weekly" | "monthly";

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

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

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

  // Calendar state
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [scheduleHour, setScheduleHour] = useState(12);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [schedulePeriod, setSchedulePeriod] = useState<"AM" | "PM">("AM");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("daily");
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);
    const cells: { day: number; inMonth: boolean; date: Date }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cells.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth - 1, d) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: new Date(viewYear, viewMonth, d) });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth + 1, d) });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isToday = (d: Date) => isSameDay(d, today);

  // Check if a date is a scheduled send date
  const isScheduledDate = (d: Date) => {
    if (!scheduleConfirmed) return false;
    if (d < startDate && !isSameDay(d, startDate)) return false;
    if (hasEndDate && endDate && d > endDate && !isSameDay(d, endDate)) return false;

    if (repeatMode === "none") return isSameDay(d, selectedDate);
    if (repeatMode === "daily") return true;
    if (repeatMode === "weekly") return d.getDay() === selectedDate.getDay();
    if (repeatMode === "monthly") return d.getDate() === selectedDate.getDate();
    return false;
  };

  const navMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  const handleDateClick = (d: Date) => {
    setSelectedDate(d);
    setScheduleConfirmed(false);
  };

  const confirmSchedule = () => {
    const h24 = schedulePeriod === "AM" ? (scheduleHour === 12 ? 0 : scheduleHour) : (scheduleHour === 12 ? 12 : scheduleHour + 12);
    const timeStr = `${String(h24).padStart(2, "0")}:${String(scheduleMinute).padStart(2, "0")}`;
    setConfig((p) => ({ ...p, time: timeStr }));
    setScheduleConfirmed(true);
    const repeatLabel = repeatMode === "none" ? "once" : repeatMode;
    toast.success(`Schedule confirmed: ${scheduleHour}:${String(scheduleMinute).padStart(2, "0")} ${schedulePeriod}, repeats ${repeatLabel}`);
  };

  const totalSent = logs.filter((l) => l.status === "success").length;
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

    try {
      const supabaseUrl = `https://ssffuvezgexthcppxfhn.supabase.co/functions/v1/send-pm-report`;
      const response = await fetch(supabaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: config.recipient,
          sections: config.sections,
        }),
      });

      const result = await response.json();

      const newLog: EmailLog = {
        id: `e-${Date.now()}`,
        recipient: config.recipient,
        status: result.success ? "success" : "failed",
        sentAt: new Date().toISOString(),
        emailId: result.emailId || undefined,
        error: result.success ? undefined : (result.error || "Unknown error"),
        reportSections: config.sections,
        trigger: "manual",
      };

      setLogs((prev) => [newLog, ...prev]);
      if (result.success) {
        toast.success(`Report sent to ${config.recipient}`);
      } else {
        toast.error(`Failed: ${result.error || "Unknown error"}`);
      }
    } catch (err: any) {
      const newLog: EmailLog = {
        id: `e-${Date.now()}`,
        recipient: config.recipient,
        status: "failed",
        sentAt: new Date().toISOString(),
        error: err.message || "Network error",
        reportSections: config.sections,
        trigger: "manual",
      };
      setLogs((prev) => [newLog, ...prev]);
      toast.error(`Failed: ${err.message || "Network error"}`);
    }

    setIsSending(false);
  };

  const emailRef = useRef<HTMLDivElement>(null);

  const formatDateShort = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;

  return (
    <div className="space-y-4 p-6" ref={emailRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Report Automation
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Automated PM dashboard reports to {config.recipient}
          </p>
        </div>
        <button onClick={async () => { if (emailRef.current) { await downloadAsImage(emailRef.current, "email-report"); toast.success("Image downloaded"); } }} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Download className="w-4 h-4" /></button>
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

      {/* Main content: Calendar Scheduler + Settings + History */}
      <div className="grid grid-cols-12 gap-4">

        {/* Calendar Scheduler — Google Calendar style */}
        <div className="col-span-5">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{MONTHS[viewMonth]} {viewYear}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} className="px-2 py-0.5 rounded border border-border text-[9px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">Today</button>
                  <button onClick={() => navMonth(-1)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <button onClick={() => navMonth(1)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[8px] font-bold text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((cell, i) => {
                  const selected = isSameDay(cell.date, selectedDate);
                  const todayCell = isToday(cell.date);
                  const scheduled = isScheduledDate(cell.date);
                  return (
                    <button
                      key={i}
                      onClick={() => cell.inMonth && handleDateClick(cell.date)}
                      className={`relative h-8 flex items-center justify-center text-[10px] rounded-full transition-all
                        ${!cell.inMonth ? "text-muted-foreground/30 cursor-default" : "cursor-pointer hover:bg-secondary"}
                        ${selected ? "bg-primary text-primary-foreground font-bold" : ""}
                        ${todayCell && !selected ? "ring-1 ring-primary text-primary font-bold" : ""}
                        ${scheduled && !selected ? "bg-primary/15 text-primary font-semibold" : ""}
                        ${cell.inMonth && !selected && !todayCell && !scheduled ? "text-foreground" : ""}
                      `}
                    >
                      {cell.day}
                      {scheduled && !selected && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected date info */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[9px] text-muted-foreground mb-1">Selected</div>
                <div className="text-xs font-semibold text-foreground">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>

              {/* Time Picker */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[9px] text-muted-foreground mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Send Time</div>
                <div className="flex items-center gap-2">
                  {/* Hour */}
                  <div className="flex-1">
                    <select
                      value={scheduleHour}
                      onChange={(e) => { setScheduleHour(Number(e.target.value)); setScheduleConfirmed(false); }}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground outline-none text-center font-mono font-bold"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-foreground font-bold text-sm">:</span>
                  {/* Minute */}
                  <div className="flex-1">
                    <select
                      value={scheduleMinute}
                      onChange={(e) => { setScheduleMinute(Number(e.target.value)); setScheduleConfirmed(false); }}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground outline-none text-center font-mono font-bold"
                    >
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                  {/* AM/PM */}
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    <button
                      onClick={() => { setSchedulePeriod("AM"); setScheduleConfirmed(false); }}
                      className={`px-2.5 py-1.5 text-[10px] font-bold transition-colors ${schedulePeriod === "AM" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
                    >AM</button>
                    <button
                      onClick={() => { setSchedulePeriod("PM"); setScheduleConfirmed(false); }}
                      className={`px-2.5 py-1.5 text-[10px] font-bold transition-colors ${schedulePeriod === "PM" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
                    >PM</button>
                  </div>
                </div>
              </div>

              {/* Repeat */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[9px] text-muted-foreground mb-2 flex items-center gap-1"><Repeat className="w-3 h-3" /> Repeat</div>
                <div className="flex gap-1.5">
                  {(["none", "daily", "weekly", "monthly"] as RepeatMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setRepeatMode(mode); setScheduleConfirmed(false); }}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-semibold capitalize transition-colors border ${
                        repeatMode === mode
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {mode === "none" ? "Once" : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start / End dates */}
              {repeatMode !== "none" && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-[8px] text-muted-foreground mb-0.5">Start Date</div>
                      <input
                        type="date"
                        value={startDate.toISOString().split("T")[0]}
                        onChange={(e) => { setStartDate(new Date(e.target.value)); setScheduleConfirmed(false); }}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="text-[8px] text-muted-foreground">End Date</div>
                        <button
                          onClick={() => { setHasEndDate(!hasEndDate); setScheduleConfirmed(false); }}
                          className={`w-6 h-3 rounded-full transition-colors relative ${hasEndDate ? "bg-primary" : "bg-muted"}`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-foreground absolute top-[1px] transition-all" style={{ left: hasEndDate ? 12 : 1 }} />
                        </button>
                      </div>
                      {hasEndDate ? (
                        <input
                          type="date"
                          value={endDate ? endDate.toISOString().split("T")[0] : ""}
                          onChange={(e) => { setEndDate(new Date(e.target.value)); setScheduleConfirmed(false); }}
                          className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-foreground outline-none"
                        />
                      ) : (
                        <div className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] text-muted-foreground">No end</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Summary + Confirm */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="bg-background rounded-lg p-3 border border-border mb-3">
                  <div className="text-[9px] text-muted-foreground mb-1">Schedule Summary</div>
                  <div className="text-[11px] font-semibold text-foreground">
                    📧 Send at <span className="text-primary font-mono">{scheduleHour}:{String(scheduleMinute).padStart(2, "0")} {schedulePeriod}</span>
                    {repeatMode === "none" && <span> on {formatDateShort(selectedDate)}</span>}
                    {repeatMode === "daily" && <span>, repeats <span className="text-primary">daily</span></span>}
                    {repeatMode === "weekly" && <span>, repeats every <span className="text-primary">{selectedDate.toLocaleDateString("en-US", { weekday: "long" })}</span></span>}
                    {repeatMode === "monthly" && <span>, repeats monthly on <span className="text-primary">day {selectedDate.getDate()}</span></span>}
                  </div>
                  {repeatMode !== "none" && (
                    <div className="text-[9px] text-muted-foreground mt-1">
                      From {formatDateShort(startDate)}{hasEndDate && endDate ? ` to ${formatDateShort(endDate)}` : " — no end date"}
                    </div>
                  )}
                </div>
                <Button
                  onClick={confirmSchedule}
                  disabled={scheduleConfirmed}
                  className={`w-full text-xs font-bold ${scheduleConfirmed ? "bg-accent/20 text-accent border border-accent/30 hover:bg-accent/20" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                >
                  {scheduleConfirmed ? (
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Schedule Confirmed</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Confirm Schedule</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Settings + Send */}
        <div className="col-span-3 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Settings</h3>
              </div>

              <div className="flex items-center justify-between mb-3 py-2 px-3 rounded-lg bg-background border border-border">
                <span className="text-xs text-foreground">Auto-send</span>
                <button
                  onClick={() => setConfig((p) => ({ ...p, enabled: !p.enabled }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${config.enabled ? "bg-accent" : "bg-muted"}`}
                >
                  <div className="w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-all" style={{ left: config.enabled ? 22 : 2 }} />
                </button>
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

              <div className="mb-3">
                <label className="text-[10px] text-muted-foreground block mb-1">Recipient</label>
                <input
                  type="email"
                  value={config.recipient}
                  onChange={(e) => setConfig((p) => ({ ...p, recipient: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground block mb-2">Report Sections</label>
                <div className="space-y-1">
                  {REPORT_SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const included = config.sections.includes(sec.id);
                    return (
                      <button
                        key={sec.id}
                        onClick={() => toggleSection(sec.id)}
                        className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg border text-left transition-all ${
                          included ? "border-opacity-30 bg-opacity-5" : "border-border bg-transparent opacity-40"
                        }`}
                        style={{
                          borderColor: included ? sec.color + "44" : undefined,
                          backgroundColor: included ? sec.color + "08" : undefined,
                        }}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${included ? "border-primary bg-primary" : "border-muted"}`}>
                          {included && <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        <Icon className="w-3 h-3" style={{ color: sec.color }} />
                        <span className="text-[9px] font-semibold" style={{ color: included ? sec.color : undefined }}>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleManualSend}
                disabled={isSending || config.sections.length === 0}
                className="w-full mt-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs disabled:opacity-50"
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
              <p className="text-[8px] text-muted-foreground text-center mt-1">
                {config.sections.length} sections selected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email History Log */}
        <div className="col-span-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Send History
                </h3>
                <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20">
                  {logs.length} records
                </Badge>
              </div>

              <div className="space-y-2 max-h-[520px] overflow-y-auto">
                {logs.map((log) => {
                  const isSuccess = log.status === "success";
                  const date = new Date(log.sentAt);

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 py-2.5 px-3 rounded-lg border transition-colors ${
                        isSuccess ? "bg-background border-border/50" : "bg-destructive/5 border-destructive/15"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-semibold text-foreground">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <Badge className={`text-[6px] px-1 ${log.trigger === "scheduled" ? "bg-primary/10 text-primary border-primary/20" : "bg-warning/10 text-warning border-warning/20"}`}>
                            {log.trigger === "scheduled" ? "⏰" : "✋"}
                          </Badge>
                        </div>

                        <div className="text-[8px] text-muted-foreground mb-1 truncate">
                          {log.recipient}
                        </div>

                        <div className="flex flex-wrap gap-0.5">
                          {log.reportSections.slice(0, 3).map((secId) => {
                            const sec = REPORT_SECTIONS.find((s) => s.id === secId);
                            return sec ? (
                              <span key={secId} className="px-1 py-0.5 rounded text-[6px] font-medium" style={{ backgroundColor: sec.color + "12", color: sec.color }}>
                                {sec.label}
                              </span>
                            ) : null;
                          })}
                          {log.reportSections.length > 3 && (
                            <span className="px-1 py-0.5 rounded text-[6px] text-muted-foreground">+{log.reportSections.length - 3}</span>
                          )}
                        </div>

                        {log.error && (
                          <div className="flex items-center gap-1 mt-1 text-[8px] text-destructive">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {log.error}
                          </div>
                        )}
                      </div>

                      <Badge className={`text-[7px] shrink-0 ${isSuccess ? "bg-accent/10 text-accent border-accent/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                        {isSuccess ? "✓" : "✗"}
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
