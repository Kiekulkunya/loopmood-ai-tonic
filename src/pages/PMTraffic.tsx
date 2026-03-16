import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, AreaChart, Area,
} from "recharts";
import {
  Activity, Users, Clock, Eye, MousePointer, TrendingUp,
  ArrowUpRight, ArrowDownRight, Monitor, Smartphone, Globe,
  Download, RefreshCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

const TT = { contentStyle: { backgroundColor: "hsl(222, 47%, 6%)", border: "1px solid hsl(217, 33%, 17%)", borderRadius: 10, fontSize: 11, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" } };

// Simulated traffic data
const HOURLY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  views: Math.floor(Math.random() * 40 + (i >= 9 && i <= 17 ? 30 : 5)),
  actions: Math.floor(Math.random() * 20 + (i >= 10 && i <= 16 ? 15 : 2)),
}));

const DAILY_DATA = [
  { day: "Mon", views: 180, actions: 95, users: 42 },
  { day: "Tue", views: 220, actions: 110, users: 55 },
  { day: "Wed", views: 195, actions: 88, users: 48 },
  { day: "Thu", views: 240, actions: 130, users: 62 },
  { day: "Fri", views: 210, actions: 105, users: 52 },
  { day: "Sat", views: 90, actions: 40, users: 22 },
  { day: "Sun", views: 75, actions: 32, users: 18 },
];

const PAGE_VIEWS = [
  { page: "/app/classifier", name: "Startup Classifier", views: 342, avgTime: "2m 45s", bounce: 12, color: "#10B981" },
  { page: "/app/risk-pwmoic", name: "Risk & PWMOIC", views: 285, avgTime: "4m 12s", bounce: 8, color: "#F97316" },
  { page: "/app/valuation", name: "Valuation Simulator", views: 268, avgTime: "5m 30s", bounce: 6, color: "#A855F7" },
  { page: "/app/nova-dashboard", name: "Nova Dashboard", views: 220, avgTime: "3m 15s", bounce: 10, color: "#3B82F6" },
  { page: "/app/decoded-x-return", name: "Decoded X Return", views: 195, avgTime: "3m 48s", bounce: 14, color: "#06B6D4" },
  { page: "/app/feedback", name: "Customer Feedback", views: 155, avgTime: "2m 20s", bounce: 18, color: "#F59E0B" },
  { page: "/app/pm/dashboard", name: "PM Dashboard", views: 130, avgTime: "6m 05s", bounce: 4, color: "#8B5CF6" },
  { page: "/app/pm/architecture", name: "Architecture", views: 110, avgTime: "4m 50s", bounce: 5, color: "#EC4899" },
  { page: "/app/pm/email", name: "Email Reports", views: 65, avgTime: "1m 40s", bounce: 22, color: "#EF4444" },
];

const DEVICE_DATA = [
  { name: "Desktop", value: 68, color: "#3B82F6" },
  { name: "Tablet", value: 20, color: "#06B6D4" },
  { name: "Mobile", value: 12, color: "#A855F7" },
];

const USER_FLOW = [
  { step: "Landing / Login", count: 500, pct: 100, color: "#3B82F6" },
  { step: "Classifier", count: 342, pct: 68.4, color: "#10B981" },
  { step: "Risk & PWMOIC", count: 285, pct: 57, color: "#F97316" },
  { step: "Valuation Sim", count: 268, pct: 53.6, color: "#A855F7" },
  { step: "Nova Dashboard", count: 220, pct: 44, color: "#3B82F6" },
  { step: "Feedback", count: 155, pct: 31, color: "#F59E0B" },
];

const SESSION_DATA = [
  { range: "< 1 min", count: 45, pct: 9 },
  { range: "1–3 min", count: 120, pct: 24 },
  { range: "3–5 min", count: 165, pct: 33 },
  { range: "5–10 min", count: 110, pct: 22 },
  { range: "10+ min", count: 60, pct: 12 },
];

function KPI({ icon: Icon, label, value, sub, color, trend }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; trend?: number;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-xl font-black text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className="text-[9px] text-muted-foreground/70 mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function PMTraffic() {
  const { logs } = useApp();
  const [timeRange, setTimeRange] = useState<"today" | "week">("week");

  const totalViews = PAGE_VIEWS.reduce((a, b) => a + b.views, 0);
  const totalActions = logs?.length || DAILY_DATA.reduce((a, b) => a + b.actions, 0);
  const avgSessionTime = "3m 42s";
  const activeUsers = 48;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Traffic Analytics</h1>
          <p className="text-[10px] text-muted-foreground">Real-time user behavior, page performance, and engagement metrics</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-background border border-border rounded-full p-0.5">
            {(["today", "week"] as const).map((t) => (
              <button key={t} onClick={() => setTimeRange(t)} className={`px-3 py-1 rounded-full text-[10px] font-semibold capitalize transition-all ${timeRange === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
          <button onClick={() => toast.success("Exported CSV")} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-3">
        <KPI icon={Eye} label="Total Page Views" value={totalViews.toLocaleString()} color="#3B82F6" trend={12} />
        <KPI icon={MousePointer} label="Total Actions" value={totalActions} color="#10B981" trend={8} />
        <KPI icon={Users} label="Active Users" value={activeUsers} color="#8B5CF6" trend={15} />
        <KPI icon={Clock} label="Avg Session Time" value={avgSessionTime} color="#F59E0B" trend={5} />
        <KPI icon={Activity} label="Status" value="Live" color="#06B6D4" sub="Real-time tracking" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Daily Traffic Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={DAILY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} />
                <Tooltip {...TT} />
                <Area type="monotone" dataKey="views" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} name="Views" />
                <Area type="monotone" dataKey="actions" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} name="Actions" />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Hourly Activity Pattern</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={HOURLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 8 }} interval={2} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} />
                <Tooltip {...TT} />
                <Bar dataKey="views" fill="#3B82F6" radius={[2, 2, 0, 0]} name="Views" barSize={10} />
                <Bar dataKey="actions" fill="#06B6D4" radius={[2, 2, 0, 0]} name="Actions" barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Page Performance Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Page Performance</h3>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                {["Page", "Views", "Avg Time", "Bounce %", "Traffic Share"].map(h => (
                  <th key={h} className="py-2.5 px-2 text-muted-foreground font-medium text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAGE_VIEWS.map((p) => {
                const share = ((p.views / totalViews) * 100).toFixed(1);
                return (
                  <tr key={p.page} className="border-b border-border/20 hover:bg-secondary/30">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <div>
                          <div className="text-foreground font-medium">{p.name}</div>
                          <div className="text-[8px] text-muted-foreground/50">{p.page}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 font-bold text-foreground">{p.views}</td>
                    <td className="py-2.5 px-2 text-muted-foreground">{p.avgTime}</td>
                    <td className="py-2.5 px-2">
                      <span className={`font-semibold ${p.bounce <= 10 ? "text-emerald-400" : p.bounce <= 15 ? "text-amber-400" : "text-red-400"}`}>{p.bounce}%</span>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: p.color }} />
                        </div>
                        <span className="text-muted-foreground w-10 text-right">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Device Distribution */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Device Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={DEVICE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: "#334155" }}>
                  {DEVICE_DATA.map((d, i) => <Cell key={i} fill={d.color} stroke="hsl(222, 47%, 6%)" strokeWidth={2} />)}
                </Pie>
                <Tooltip {...TT} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Flow */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">User Navigation Flow</h3>
            <div className="space-y-2">
              {USER_FLOW.map((f, i) => (
                <div key={f.step}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{f.step}</span>
                    <span className="text-[10px] font-bold text-foreground">{f.count}</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded overflow-hidden">
                    <div className="h-full rounded flex items-center justify-end pr-1.5" style={{ width: `${f.pct}%`, backgroundColor: f.color }}>
                      <span className="text-[7px] font-bold text-white">{f.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Duration */}
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Session Duration</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={SESSION_DATA} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 9 }} />
                <YAxis type="category" dataKey="range" tick={{ fill: "#94A3B8", fontSize: 9 }} width={55} />
                <Tooltip {...TT} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {SESSION_DATA.map((_, i) => <Cell key={i} fill={["#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
