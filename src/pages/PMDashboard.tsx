import React, { useState, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart,
} from "recharts";
import {
  Users, TrendingUp, DollarSign, Target, Shield, Zap,
  Clock, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Building2, UserCheck, FileText, Activity, Globe, Server,
  Layers, Rocket, Crown, BarChart3,
  MessageSquare, Star, ThumbsUp, ThumbsDown, Lightbulb,
  Sparkles, Heart, TrendingDown, Filter,
  Brain, ShieldAlert,
  ShieldCheck, Eye, Leaf, ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp, type CustomerReview } from "@/contexts/AppContext";
import { toast } from "sonner";
import { RotateCcw, Download } from "lucide-react";
import { downloadAsImage } from "@/lib/downloadUtils";

const MONTHLY_DATA = [
  { month: "Jul", b2cUsers: 120, b2bClients: 0, reports: 340, mrr: 2400, nps: 38, churn: 8 },
  { month: "Aug", b2cUsers: 280, b2bClients: 0, reports: 890, mrr: 5600, nps: 41, churn: 7 },
  { month: "Sep", b2cUsers: 510, b2bClients: 1, reports: 1650, mrr: 10200, nps: 43, churn: 6.5 },
  { month: "Oct", b2cUsers: 780, b2bClients: 1, reports: 2800, mrr: 15600, nps: 44, churn: 5.8 },
  { month: "Nov", b2cUsers: 1100, b2bClients: 2, reports: 4500, mrr: 22000, nps: 46, churn: 5.2 },
  { month: "Dec", b2cUsers: 1450, b2bClients: 3, reports: 6800, mrr: 29000, nps: 47, churn: 4.8 },
  { month: "Jan", b2cUsers: 1720, b2bClients: 4, reports: 9200, mrr: 38000, nps: 48, churn: 4.5 },
  { month: "Feb", b2cUsers: 1950, b2bClients: 5, reports: 12000, mrr: 52000, nps: 49, churn: 4.2 },
];
const FEATURE_USAGE = [{ name: "Classifier", uses: 4200, pct: 35 },{ name: "Decoded X", uses: 2400, pct: 20 },{ name: "Risk & PWMOIC", uses: 2160, pct: 18 },{ name: "Valuation Sim", uses: 1800, pct: 15 },{ name: "Nova Dashboard", uses: 1440, pct: 12 }];
const FUNNEL_DATA = [{ stage: "Landing Visit", count: 25000, pct: 100 },{ stage: "Sign Up", count: 5000, pct: 20 },{ stage: "Form Started", count: 3500, pct: 14 },{ stage: "Report Generated", count: 2100, pct: 8.4 },{ stage: "Paid Subscriber", count: 950, pct: 3.8 },{ stage: "Repeat User", count: 380, pct: 1.5 }];
const ROADMAP_PHASES = [{ phase: "Phase 1", title: "Core + PWMOIC Engine", weeks: "1–2", status: "done", items: ["User registration","Data entry forms","PWMOIC scoring logic","Expert validation"] },{ phase: "Phase 2", title: "Reports + B2C Payment", weeks: "3–4", status: "done", items: ["Reporting UI","PDF export","Dashboard","Stripe integration"] },{ phase: "Phase 3", title: "B2B Multi-Startup + API", weeks: "5–6", status: "current", items: ["Multi-user teams","Bulk upload","REST API endpoints","Pilot B2B clients"] },{ phase: "Phase 4", title: "QA + Launch", weeks: "7–8", status: "upcoming", items: ["Performance tuning","Bug fixes","Documentation","Marketing assets"] }];
const B2B_PIPELINE = [{ name: "TechStars", type: "Accelerator", stage: "Negotiation", value: 24000, prob: 80 },{ name: "Sequoia Scout", type: "VC", stage: "Demo", value: 48000, prob: 40 },{ name: "BNP Paribas (Opera Tech)", type: "Bank", stage: "Pilot", value: 36000, prob: 60 },{ name: "500 Global", type: "Accelerator", stage: "Proposal", value: 18000, prob: 30 },{ name: "Barclay (Eagle Labs)", type: "Bank/VC", stage: "Contact", value: 18000, prob: 15 }];
const COMPETITOR_LANDSCAPE = [{ name: "LoopAI", ai: 5, ux: 4, price: 5, b2b: 3, api: 3 },{ name: "PitchBook", ai: 3, ux: 3, price: 1, b2b: 5, api: 5 },{ name: "Equidam", ai: 2, ux: 4, price: 4, b2b: 3, api: 2 },{ name: "BizEquity", ai: 2, ux: 3, price: 3, b2b: 4, api: 3 },{ name: "CB Insights", ai: 4, ux: 3, price: 1, b2b: 5, api: 4 }];
const SYSTEM_HEALTH = [{ name: "Auth Service", status: "healthy", uptime: 99.98, latency: 45 },{ name: "PWMOIC Engine", status: "healthy", uptime: 99.95, latency: 280 },{ name: "Report Generator", status: "healthy", uptime: 99.92, latency: 1200 },{ name: "Database", status: "healthy", uptime: 99.99, latency: 12 },{ name: "AI Provider (Gemini)", status: "healthy", uptime: 99.80, latency: 890 },{ name: "PDF Export", status: "warning", uptime: 99.50, latency: 2400 }];
const FEEDBACK_RESPONSES = [
  { id: 1, user: "sarah@startup.io", date: "2025-02-12", satisfaction: 5, nps: 9, mostValuable: "classifier", ranking: ["classifier","risk","valuation","decoded","nova","chatbot"], suggestion: "Add PDF export for classifier results" },
  { id: 2, user: "mike@vcfund.com", date: "2025-02-11", satisfaction: 4, nps: 8, mostValuable: "valuation", ranking: ["valuation","nova","risk","classifier","decoded","chatbot"], suggestion: "Need bulk upload for multiple startups" },
  { id: 3, user: "anna@techstars.com", date: "2025-02-10", satisfaction: 5, nps: 10, mostValuable: "risk", ranking: ["risk","valuation","nova","classifier","chatbot","decoded"], suggestion: "" },
  { id: 4, user: "james@founder.co", date: "2025-02-10", satisfaction: 3, nps: 6, mostValuable: "classifier", ranking: ["classifier","chatbot","decoded","risk","valuation","nova"], suggestion: "The chatbot needs better AI responses" },
  { id: 5, user: "lisa@angel.net", date: "2025-02-09", satisfaction: 4, nps: 8, mostValuable: "nova", ranking: ["nova","valuation","risk","classifier","decoded","chatbot"], suggestion: "Would love to compare more than 3 firms" },
  { id: 6, user: "tom@accelerate.io", date: "2025-02-09", satisfaction: 5, nps: 9, mostValuable: "valuation", ranking: ["valuation","risk","nova","decoded","classifier","chatbot"], suggestion: "" },
  { id: 7, user: "chen@fintech.cn", date: "2025-02-08", satisfaction: 4, nps: 7, mostValuable: "risk", ranking: ["risk","decoded","valuation","nova","classifier","chatbot"], suggestion: "API access for our internal tools" },
  { id: 8, user: "priya@seed.in", date: "2025-02-08", satisfaction: 5, nps: 10, mostValuable: "classifier", ranking: ["classifier","risk","chatbot","valuation","decoded","nova"], suggestion: "Love the AI classifier! Make it faster" },
  { id: 9, user: "david@bank.sg", date: "2025-02-07", satisfaction: 3, nps: 5, mostValuable: "valuation", ranking: ["valuation","nova","risk","decoded","classifier","chatbot"], suggestion: "Need enterprise SSO and audit logs" },
  { id: 10, user: "maria@startup.br", date: "2025-02-07", satisfaction: 4, nps: 8, mostValuable: "decoded", ranking: ["decoded","risk","classifier","valuation","nova","chatbot"], suggestion: "" },
  { id: 11, user: "alex@vc.uk", date: "2025-02-06", satisfaction: 5, nps: 9, mostValuable: "nova", ranking: ["nova","valuation","risk","classifier","decoded","chatbot"], suggestion: "The dashboard visualizations are excellent" },
  { id: 12, user: "yuki@tech.jp", date: "2025-02-06", satisfaction: 4, nps: 7, mostValuable: "risk", ranking: ["risk","valuation","decoded","nova","chatbot","classifier"], suggestion: "Support Japanese language" },
];
const FEATURE_MAP: Record<string, { label: string; emoji: string; color: string }> = { classifier: { label: "Startup Classifier", emoji: "🔬", color: "#3B82F6" }, decoded: { label: "Decoded X Return", emoji: "📈", color: "#06B6D4" }, risk: { label: "Risk & PWMOIC", emoji: "⚡", color: "#10B981" }, valuation: { label: "Valuation Simulator", emoji: "🎯", color: "#F59E0B" }, nova: { label: "Nova Dashboard", emoji: "📊", color: "#A855F7" }, chatbot: { label: "Ask LoopAI", emoji: "💬", color: "#EC4899" } };
const SATISFACTION_TREND = [{ month: "Sep", avg: 3.2, responses: 8 },{ month: "Oct", avg: 3.6, responses: 15 },{ month: "Nov", avg: 3.9, responses: 28 },{ month: "Dec", avg: 4.1, responses: 42 },{ month: "Jan", avg: 4.3, responses: 65 },{ month: "Feb", avg: 4.2, responses: 12 }];

const TT = { contentStyle: { backgroundColor: "#0F172A", border: "1px solid #1E293B", borderRadius: 10, fontSize: 11, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" } };

function KPI({ icon: Icon, label, value, sub, color, trend, target }: { icon: any; label: string; value: string | number; sub?: string; color: string; trend?: number; target?: string }) {
  return (<Card className="bg-[#111827] border-[#1E293B]"><CardContent className="p-4">
    <div className="flex items-start justify-between mb-2"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}><Icon className="w-4 h-4" style={{ color }} /></div>
      {trend !== undefined && <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(trend)}%</div>}
    </div><div className="text-xl font-black text-white">{value}</div><div className="text-[10px] text-slate-500 mt-0.5">{label}</div>{target && <div className="text-[8px] text-slate-600 mt-1">Target: {target}</div>}{sub && <div className="text-[9px] text-slate-400 mt-1">{sub}</div>}
  </CardContent></Card>);
}

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (<Card className={`bg-[#111827] border-[#1E293B] ${className}`}><CardContent className="p-5"><div className="mb-4"><h4 className="text-sm font-bold text-white">{title}</h4>{subtitle && <p className="text-[9px] text-slate-500 mt-0.5">{subtitle}</p>}</div>{children}</CardContent></Card>);
}

export default function PMDashboard() {
  const { logs, customerReviews } = useApp();
  const [activeSection, setActiveSection] = useState("overview");
  const latest = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const prev = MONTHLY_DATA[MONTHLY_DATA.length - 2];

  const feedbackStats = useMemo(() => {
    const total = FEEDBACK_RESPONSES.length;
    const avgSat = +(FEEDBACK_RESPONSES.reduce((a, b) => a + b.satisfaction, 0) / total).toFixed(1);
    const avgNps = +(FEEDBACK_RESPONSES.reduce((a, b) => a + b.nps, 0) / total).toFixed(1);
    const promoters = FEEDBACK_RESPONSES.filter((f) => f.nps >= 9).length;
    const passives = FEEDBACK_RESPONSES.filter((f) => f.nps >= 7 && f.nps <= 8).length;
    const detractors = FEEDBACK_RESPONSES.filter((f) => f.nps <= 6).length;
    const npsScore = Math.round(((promoters - detractors) / total) * 100);
    const featurePositions: Record<string, number[]> = {};
    Object.keys(FEATURE_MAP).forEach((k) => { featurePositions[k] = []; });
    FEEDBACK_RESPONSES.forEach((f) => { f.ranking.forEach((fid, pos) => { featurePositions[fid]?.push(pos + 1); }); });
    const avgRanking = Object.entries(featurePositions).map(([id, positions]) => ({ id, ...FEATURE_MAP[id], avgRank: +(positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1), firstCount: positions.filter((p) => p === 1).length, top3Count: positions.filter((p) => p <= 3).length })).sort((a, b) => a.avgRank - b.avgRank);
    const mvCounts: Record<string, number> = {};
    FEEDBACK_RESPONSES.forEach((f) => { mvCounts[f.mostValuable] = (mvCounts[f.mostValuable] || 0) + 1; });
    const mvData = Object.entries(mvCounts).map(([id, count]) => ({ id, ...FEATURE_MAP[id], count, pct: +((count / total) * 100).toFixed(0) })).sort((a, b) => b.count - a.count);
    const suggestions = FEEDBACK_RESPONSES.filter((f) => f.suggestion.trim()).map((f) => ({ user: f.user, date: f.date, text: f.suggestion, nps: f.nps, satisfaction: f.satisfaction }));
    const satDist = [1,2,3,4,5].map((v) => ({ score: v, count: FEEDBACK_RESPONSES.filter((f) => f.satisfaction === v).length, label: ["Poor","Fair","Good","Great","Love it"][v-1], color: ["#EF4444","#F97316","#F59E0B","#10B981","#06B6D4"][v-1] }));
    return { total, avgSat, avgNps, npsScore, promoters, passives, detractors, avgRanking, mvData, suggestions, satDist };
  }, []);

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "feedback", label: "Feedback & Insights", icon: MessageSquare },
    { id: "growth", label: "Growth & Revenue", icon: TrendingUp },
    { id: "funnel", label: "User Funnel", icon: Target },
    { id: "b2b", label: "B2B Pipeline", icon: Building2 },
    { id: "roadmap", label: "Roadmap", icon: Rocket },
    { id: "competitive", label: "Competitive", icon: Crown },
    { id: "system", label: "System Health", icon: Server },
  ];

  const dashRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4 p-4" ref={dashRef}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-blue-400" />PM Command Center</h1><p className="text-[10px] text-slate-500">Strategic dashboard for B2C→B2B scaling · PRD-aligned · Feedback-driven</p></div>
        <div className="flex gap-1">
          <button onClick={async () => { if (dashRef.current) { await downloadAsImage(dashRef.current, "pm-dashboard"); toast.success("Image downloaded"); } }} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {sections.map((s) => { const Icon = s.icon; const active = activeSection === s.id; return (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all ${active ? "bg-blue-600/15 border-blue-600/30 text-blue-400" : "bg-transparent border-[#1E293B] text-slate-500 hover:text-slate-300 hover:border-[#334155]"}`}>
            <Icon className="w-3.5 h-3.5" />{s.label}{s.id === "feedback" && <span className="ml-1 w-4 h-4 rounded-full bg-blue-600 text-[8px] text-white flex items-center justify-center font-bold">{feedbackStats.total}</span>}
          </button>
        ); })}
      </div>

      {activeSection === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <KPI icon={Users} label="B2C Subscribers" value={latest.b2cUsers.toLocaleString()} color="#3B82F6" trend={+(((latest.b2cUsers - prev.b2cUsers) / prev.b2cUsers) * 100).toFixed(0)} target="2,000 (Y1)" />
            <KPI icon={Building2} label="B2B Clients" value={latest.b2bClients} color="#8B5CF6" trend={latest.b2bClients > prev.b2bClients ? 25 : 0} target="5 (Y1)" />
            <KPI icon={FileText} label="Reports Generated" value={latest.reports.toLocaleString()} color="#06B6D4" trend={+(((latest.reports - prev.reports) / prev.reports) * 100).toFixed(0)} target="15,000 (Y1)" />
            <KPI icon={DollarSign} label="ARR" value={`$${(latest.mrr * 12 / 1000).toFixed(0)}K`} color="#10B981" trend={+(((latest.mrr - prev.mrr) / prev.mrr) * 100).toFixed(0)} target="$200K (Y1)" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <KPI icon={Star} label="Avg Satisfaction" value={`${feedbackStats.avgSat}/5`} color="#F59E0B" sub={`${feedbackStats.total} responses`} />
            <KPI icon={ThumbsUp} label="NPS Score" value={feedbackStats.npsScore} color={feedbackStats.npsScore >= 45 ? "#10B981" : "#F59E0B"} target="≥ 45" sub={`Promoters: ${feedbackStats.promoters}`} />
            <KPI icon={Heart} label="Top Feature" value={feedbackStats.mvData[0]?.label || "—"} color={feedbackStats.mvData[0]?.color || "#3B82F6"} sub={`${feedbackStats.mvData[0]?.pct}% of votes`} />
            <KPI icon={MessageSquare} label="Suggestions" value={feedbackStats.suggestions.length} color="#EC4899" sub="Actionable items" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Monthly User Growth" subtitle="B2C subscribers + B2B clients"><ResponsiveContainer width="100%" height={220}><ComposedChart data={MONTHLY_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" /><XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} /><YAxis yAxisId="left" tick={{ fill: "#94A3B8", fontSize: 9 }} /><YAxis yAxisId="right" orientation="right" tick={{ fill: "#94A3B8", fontSize: 9 }} /><Tooltip {...TT} /><Area yAxisId="left" type="monotone" dataKey="b2cUsers" fill="#3B82F6" fillOpacity={0.1} stroke="#3B82F6" strokeWidth={2} name="B2C" /><Bar yAxisId="right" dataKey="b2bClients" fill="#8B5CF6" radius={[4,4,0,0]} name="B2B" barSize={20} /><Legend wrapperStyle={{ fontSize: 10 }} /></ComposedChart></ResponsiveContainer></ChartCard>
            <ChartCard title="Feature Adoption" subtitle="Usage by feature"><ResponsiveContainer width="100%" height={220}><BarChart data={FEATURE_USAGE} layout="vertical" barSize={16}><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} /><XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 9 }} /><YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} width={80} /><Tooltip {...TT} /><Bar dataKey="uses" radius={[0,4,4,0]}>{FEATURE_USAGE.map((_,i) => <Cell key={i} fill={["#3B82F6","#06B6D4","#10B981","#F59E0B","#A855F7"][i]} />)}</Bar></BarChart></ResponsiveContainer></ChartCard>
          </div>
        </div>
      )}

      {activeSection === "feedback" && (() => {
        const FEATURE_ID_TO_NAME: Record<string, string> = { classifier: "Startup Classifier", decoded: "Decoded X Return", risk: "Risk & PWMOIC", valuation: "Valuation Simulator" };
        const SEED_PM_REVIEWS = [
          { id: "r1", feature: "Startup Classifier", user: "Sarah Chen", role: "Founder", rating: 5, title: "Game changer for pitch prep", comment: "The AI classifier accurately identified our startup stage from a TechCrunch article.", sentiment: "positive" as const, date: "2025-03-10T14:30:00Z" },
          { id: "r2", feature: "Startup Classifier", user: "Mike Rodriguez", role: "Investor", rating: 4, title: "Solid tool, needs PDF improvement", comment: "Works well with URLs. PDF parsing needs improvement for pitch decks.", sentiment: "neutral" as const, date: "2025-03-09T09:15:00Z" },
          { id: "r3", feature: "Decoded X Return", user: "Anna Park", role: "Accelerator PM", rating: 5, title: "Best risk framework", comment: "M×P×T×F multiplicative framework is more realistic than additive models.", sentiment: "positive" as const, date: "2025-03-08T16:45:00Z" },
          { id: "r4", feature: "Risk & PWMOIC", user: "James Liu", role: "Founder", rating: 3, title: "TAM needs more data", comment: "TAM computation feels limited. Need integration with market research databases.", sentiment: "negative" as const, date: "2025-03-07T11:20:00Z" },
          { id: "r5", feature: "Risk & PWMOIC", user: "Lisa Wang", role: "Angel Investor", rating: 5, title: "Essential for portfolio", comment: "I use this to score every deal. Industry market caps save research time.", sentiment: "positive" as const, date: "2025-03-06T13:00:00Z" },
          { id: "r6", feature: "Valuation Simulator", user: "Tom Baker", role: "Accelerator PM", rating: 4, title: "Great for cohort comparison", comment: "Side-by-side comparison with weighted parameters is exactly what we need.", sentiment: "positive" as const, date: "2025-03-05T10:30:00Z" },
          { id: "r7", feature: "Valuation Simulator", user: "David Lim", role: "Banking Analyst", rating: 2, title: "Needs enterprise features", comment: "Lacks audit trails, role-based access, export to internal format, and API.", sentiment: "negative" as const, date: "2025-03-04T08:45:00Z" },
          { id: "r8", feature: "Decoded X Return", user: "Priya Sharma", role: "Founder", rating: 4, title: "Intuitive visualization", comment: "Stage flow makes complex calculations intuitive for non-finance co-founders.", sentiment: "positive" as const, date: "2025-03-03T15:20:00Z" },
        ];
        const liveReviews = customerReviews.map((r) => ({
          id: r.id, feature: FEATURE_ID_TO_NAME[r.featureId] || r.featureId, user: r.userName, role: r.userRole,
          rating: r.rating, title: r.title, comment: r.comment, sentiment: r.sentiment, date: r.createdAt,
        }));
        const CUSTOMER_REVIEWS_DATA = [...liveReviews, ...SEED_PM_REVIEWS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const SENTIMENT_CONFIG = {
          positive: { color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "👍", label: "Positive" },
          neutral: { color: "#F59E0B", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "😐", label: "Neutral" },
          negative: { color: "#EF4444", bg: "bg-red-500/10", border: "border-red-500/20", icon: "👎", label: "Negative" },
        };
        const AI_RECOMMENDATIONS = [
          { id: "ai1", severity: "high" as const, feature: "Valuation Simulator", issue: "Enterprise features gap — audit trails, RBAC, API access", source: "Banking analyst (2★) + 3 B2B pipeline prospects", recommendation: "Implement audit logging, add RBAC with viewer/editor/admin roles, and expose a REST API for batch processing. Unblocks 2 B2B deals worth $84K ARR.", impact: "High — Enables B2B enterprise adoption", effort: "Medium — 3-4 sprint cycles", priority: 1 },
          { id: "ai2", severity: "medium" as const, feature: "Startup Classifier", issue: "PDF parsing incomplete — only extracts partial text", source: "Investor review (4★) + multiple user reports", recommendation: "Integrate dedicated PDF extraction with OCR fallback. This is the #1 feature — improving reliability increases NPS significantly.", impact: "High — Affects top-used feature", effort: "Low — 1-2 sprint cycles", priority: 2 },
          { id: "ai3", severity: "medium" as const, feature: "Risk & PWMOIC", issue: "TAM computation limited — lacks market research integration", source: "Founder review (3★)", recommendation: "Build curated TAM benchmarks by industry/geography. Add 'Market Data Lookup' to auto-populate TAM fields.", impact: "Medium — Improves data quality", effort: "Medium — Requires data sourcing", priority: 3 },
          { id: "ai4", severity: "low" as const, feature: "Startup Classifier", issue: "Classification accuracy varies for niche industries", source: "VC analyst review (3★)", recommendation: "Fine-tune AI prompt with industry-specific criteria. Add user feedback loop to build training data over time.", impact: "Medium — Improves trust", effort: "Low — Prompt engineering", priority: 4 },
        ];
        return (
        <div className="space-y-4">
          <div className="flex justify-end mb-2"><button onClick={() => toast.info("Feedback data refreshed")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#1E293B] bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-3 h-3" />Refresh</button></div>
          <div className="grid grid-cols-4 gap-3">
            <KPI icon={MessageSquare} label="Total Responses" value={feedbackStats.total} color="#3B82F6" />
            <KPI icon={Star} label="Avg Satisfaction" value={`${feedbackStats.avgSat} / 5`} color="#F59E0B" target="≥ 4.0" />
            <KPI icon={ThumbsUp} label="NPS Score" value={feedbackStats.npsScore} color={feedbackStats.npsScore >= 45 ? "#10B981" : "#F97316"} target="≥ 45" sub={`${feedbackStats.promoters}P / ${feedbackStats.passives}N / ${feedbackStats.detractors}D`} />
            <KPI icon={Heart} label="Response Rate" value="68%" color="#EC4899" target="≥ 60%" />
          </div>

          <ChartCard title="🧠 AI Sentiment Analysis" subtitle="Automated classification of all customer reviews — negative to positive">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(["negative", "neutral", "positive"] as const).map((s) => {
                const cfg = SENTIMENT_CONFIG[s];
                const count = CUSTOMER_REVIEWS_DATA.filter((r) => r.sentiment === s).length;
                const pct = Math.round((count / CUSTOMER_REVIEWS_DATA.length) * 100);
                return (
                  <div key={s} className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} text-center`}>
                    <div className="text-2xl mb-1">{cfg.icon}</div>
                    <div className="text-xl font-black text-white">{count}</div>
                    <div className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.label} ({pct}%)</div>
                  </div>
                );
              })}
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden flex">
              {(["positive", "neutral", "negative"] as const).map((s) => {
                const count = CUSTOMER_REVIEWS_DATA.filter((r) => r.sentiment === s).length;
                return <div key={s} style={{ width: `${(count / CUSTOMER_REVIEWS_DATA.length) * 100}%`, backgroundColor: SENTIMENT_CONFIG[s].color }} />;
              })}
            </div>
            <div className="flex justify-between mt-2 text-[8px] text-slate-500"><span>← Positive</span><span>Negative →</span></div>
          </ChartCard>

          <ChartCard title="Feature Sentiment Breakdown" subtitle="Per-feature rating distribution and sentiment">
            <div className="space-y-3">
              {["Startup Classifier", "Decoded X Return", "Risk & PWMOIC", "Valuation Simulator"].map((feature) => {
                const featureReviews = CUSTOMER_REVIEWS_DATA.filter((r) => r.feature === feature);
                const avg = featureReviews.length > 0 ? +(featureReviews.reduce((a, b) => a + b.rating, 0) / featureReviews.length).toFixed(1) : 0;
                const pos = featureReviews.filter((r) => r.sentiment === "positive").length;
                const neg = featureReviews.filter((r) => r.sentiment === "negative").length;
                const neu = featureReviews.filter((r) => r.sentiment === "neutral").length;
                const total = featureReviews.length;
                return (
                  <div key={feature} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-[#0B0F19] border border-[#1E293B]/50">
                    <div className="w-[140px] shrink-0">
                      <div className="text-[10px] font-bold text-white">{feature}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-amber-400 text-xs font-black">{avg}</span>
                        <span className="text-[8px] text-slate-500">({total} reviews)</span>
                      </div>
                    </div>
                    <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-[#1E293B]">
                      {pos > 0 && <div style={{ width: `${(pos / total) * 100}%`, backgroundColor: "#10B981" }} />}
                      {neu > 0 && <div style={{ width: `${(neu / total) * 100}%`, backgroundColor: "#F59E0B" }} />}
                      {neg > 0 && <div style={{ width: `${(neg / total) * 100}%`, backgroundColor: "#EF4444" }} />}
                    </div>
                    <div className="flex gap-2 shrink-0 text-[8px]">
                      <span className="text-emerald-400">{pos}👍</span>
                      <span className="text-amber-400">{neu}😐</span>
                      <span className="text-red-400">{neg}👎</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="💬 Customer Reviews Feed" subtitle="All reviews from Customer Feedback page — linked in real-time">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {CUSTOMER_REVIEWS_DATA.map((rev) => {
                const cfg = SENTIMENT_CONFIG[rev.sentiment];
                return (
                  <div key={rev.id} className="flex items-start gap-3 py-3 px-4 rounded-lg bg-[#0B0F19] border border-[#1E293B]/40">
                    <div className="mt-0.5 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-[#1E293B] flex items-center justify-center text-[9px] font-bold text-blue-400">
                        {rev.user.split(" ").map((n) => n[0]).join("")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-white">{rev.user}</span>
                        <Badge className="text-[7px] px-1 bg-[#1E293B] text-slate-400">{rev.role}</Badge>
                        <div className="flex gap-0.5 ml-auto">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <Star key={v} className={`w-2.5 h-2.5 ${v <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                          ))}
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-300 mb-0.5">{rev.title}</div>
                      <p className="text-[9px] text-slate-500 leading-relaxed">{rev.comment}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className="text-[7px] px-1.5" style={{ backgroundColor: cfg.color + "15", color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </Badge>
                        <span className="text-[8px] text-slate-600">{rev.feature}</span>
                        <span className="text-[8px] text-slate-700 ml-auto">{new Date(rev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="🤖 AI Product Improvement Engine" subtitle="Smart recommendations from negative feedback — prioritized by impact">
            <div className="space-y-3">
              {AI_RECOMMENDATIONS.map((rec) => {
                const severityConfig = {
                  high: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", label: "🔴 Critical" },
                  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "🟡 Important" },
                  low: { color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", label: "🔵 Nice to Have" },
                }[rec.severity];
                return (
                  <div key={rec.id} className="rounded-xl border p-4" style={{ backgroundColor: severityConfig.bg, borderColor: severityConfig.border }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: severityConfig.color }}>#{rec.priority} {severityConfig.label}</span>
                        <Badge className="text-[8px] bg-[#1E293B] text-slate-300 border-[#334155]">{rec.feature}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="text-[7px] bg-blue-500/10 text-blue-400 border-blue-500/20">Impact: {rec.impact.split(" — ")[0]}</Badge>
                        <Badge className="text-[7px] bg-amber-500/10 text-amber-400 border-amber-500/20">Effort: {rec.effort.split(" — ")[0]}</Badge>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: severityConfig.color }} />
                      <div>
                        <div className="text-xs font-bold text-white">{rec.issue}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">Source: {rec.source}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-3 pt-3 border-t" style={{ borderColor: severityConfig.border }}>
                      <Brain className="w-3.5 h-3.5 mt-0.5 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[9px] font-bold text-blue-400 mb-0.5">AI Recommendation</div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">{rec.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <p className="text-[9px] text-slate-500">
                <strong className="text-slate-300">AI Summary:</strong> {AI_RECOMMENDATIONS.filter((r) => r.severity === "high").length} critical issue blocking B2B adoption. Addressing top 2 recommendations unblocks ~$84K pipeline and improves NPS by 5–8 points.
              </p>
            </div>
          </ChartCard>

          <ChartCard title="🏆 Feature Ranking by User Importance" subtitle="Aggregated from user drag-and-drop ranking surveys">
            <div className="space-y-2">{feedbackStats.avgRanking.map((f, idx) => {
              const medalColors = ["#FFD700","#C0C0C0","#CD7F32"]; const isMedal = idx < 3;
              return (<div key={f.id} className="flex items-center gap-3 py-3 px-4 rounded-lg border transition-all" style={{ borderColor: isMedal ? (medalColors[idx]) + "33" : "#1E293B", backgroundColor: isMedal ? (f.color) + "05" : "#0B0F19" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{ backgroundColor: isMedal ? (medalColors[idx]) + "20" : "#1E293B", color: isMedal ? medalColors[idx] : "#64748B" }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}</div>
                <span className="text-base">{f.emoji}</span>
                <div className="flex-1 min-w-0"><div className="text-xs font-bold" style={{ color: f.color }}>{f.label}</div><div className="text-[9px] text-slate-500">Avg rank: {f.avgRank} · Voted #1: {f.firstCount}× · In top 3: {f.top3Count}×</div></div>
                <div className="w-24 h-2 bg-[#1E293B] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${((7 - f.avgRank) / 6) * 100}%`, backgroundColor: f.color }} /></div>
                <div className="w-10 text-right text-xs font-bold" style={{ color: f.color }}>{f.avgRank}</div>
              </div>);
            })}</div>
          </ChartCard>
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Most Valuable Feature Votes"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={feedbackStats.mvData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="count" paddingAngle={3} label={({ label, pct }: any) => `${label}: ${pct}%`} labelLine={{ stroke: "#334155" }}>{feedbackStats.mvData.map((f) => <Cell key={f.id} fill={f.color} stroke="#111827" strokeWidth={2} />)}</Pie><Tooltip {...TT} /></PieChart></ResponsiveContainer></ChartCard>
            <ChartCard title="Satisfaction Distribution"><ResponsiveContainer width="100%" height={220}><BarChart data={feedbackStats.satDist}><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" /><XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} /><YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} allowDecimals={false} /><Tooltip {...TT} formatter={(v: number) => [`${v} responses`, "Count"]} /><Bar dataKey="count" radius={[4,4,0,0]} barSize={32}>{feedbackStats.satDist.map((d,i) => <Cell key={i} fill={d.color} />)}</Bar></BarChart></ResponsiveContainer></ChartCard>
          </div>
          <ChartCard title="💡 User Suggestions" subtitle={`${feedbackStats.suggestions.length} actionable suggestions`}>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">{feedbackStats.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 py-3 px-4 rounded-lg bg-[#0B0F19] border border-[#1E293B]/50">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0"><p className="text-xs text-white leading-relaxed">"{s.text}"</p><div className="flex items-center gap-3 mt-1.5"><span className="text-[9px] text-slate-500">{s.user}</span><span className="text-[9px] text-slate-600">{s.date}</span><Badge className={`text-[7px] px-1 ${s.nps >= 9 ? "bg-emerald-500/10 text-emerald-400" : s.nps >= 7 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>NPS: {s.nps}</Badge></div></div>
              </div>
            ))}</div>
          </ChartCard>
        </div>
        );
      })()}

      {activeSection === "growth" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="MRR Growth"><ResponsiveContainer width="100%" height={250}><AreaChart data={MONTHLY_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" /><XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} /><YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} /><Tooltip {...TT} formatter={(v: number) => [`$${v.toLocaleString()}`, "MRR"]} /><Area type="monotone" dataKey="mrr" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2.5} dot={{ r: 3 }} /></AreaChart></ResponsiveContainer></ChartCard>
            <ChartCard title="NPS Trend"><ResponsiveContainer width="100%" height={250}><LineChart data={MONTHLY_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" /><XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} /><YAxis domain={[30, 55]} tick={{ fill: "#94A3B8", fontSize: 9 }} /><Tooltip {...TT} /><Line type="monotone" dataKey="nps" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} name="NPS" /><Legend wrapperStyle={{ fontSize: 10 }} /></LineChart></ResponsiveContainer></ChartCard>
          </div>
        </div>
      )}

      {activeSection === "funnel" && (
        <ChartCard title="User Conversion Funnel"><div className="space-y-2">{FUNNEL_DATA.map((f, i) => {
          const color = ["#3B82F6","#06B6D4","#10B981","#F59E0B","#EC4899","#A855F7"][i];
          const dropoff = i > 0 ? (((FUNNEL_DATA[i-1].count - f.count) / FUNNEL_DATA[i-1].count) * 100).toFixed(0) : null;
          return (<div key={f.stage}><div className="flex items-center justify-between mb-1"><span className="text-xs text-slate-300">{f.stage}</span><div className="flex items-center gap-2"><span className="text-xs font-bold text-white">{f.count.toLocaleString()}</span>{dropoff && <span className="text-[9px] text-red-400">↓{dropoff}%</span>}</div></div><div className="w-full h-6 bg-[#1E293B] rounded overflow-hidden"><div className="h-full rounded flex items-center justify-end pr-2 transition-all" style={{ width: `${Math.max(f.pct, 3)}%`, backgroundColor: color }}><span className="text-[8px] font-bold text-white">{f.pct}%</span></div></div></div>);
        })}</div></ChartCard>
      )}

      {activeSection === "b2b" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <KPI icon={Building2} label="Pipeline Value" value={`$${B2B_PIPELINE.reduce((a, b) => a + b.value, 0).toLocaleString()}`} color="#8B5CF6" />
            <KPI icon={Target} label="Weighted" value={`$${B2B_PIPELINE.reduce((a, b) => a + b.value * b.prob / 100, 0).toLocaleString()}`} color="#10B981" />
            <KPI icon={UserCheck} label="Deals" value={B2B_PIPELINE.length} color="#F59E0B" />
          </div>
          <ChartCard title="B2B Pipeline"><div className="space-y-2">{B2B_PIPELINE.map((d, i) => {
            const sc = d.stage === "Negotiation" ? "#10B981" : d.stage === "Pilot" ? "#06B6D4" : d.stage === "Demo" ? "#F59E0B" : d.stage === "Proposal" ? "#8B5CF6" : "#64748B";
            return (<div key={i} className="flex items-center gap-3 py-3 px-4 rounded-lg bg-[#0B0F19] border border-[#1E293B]/50"><div className="flex-1"><div className="text-xs font-bold text-white">{d.name}</div><div className="text-[9px] text-slate-500">{d.type}</div></div><Badge className="text-[8px]" style={{ backgroundColor: sc + "15", color: sc }}>{d.stage}</Badge><div className="text-right w-16"><div className="text-xs font-bold text-white">${(d.value/1000).toFixed(0)}K</div><div className="text-[8px] text-slate-500">{d.prob}%</div></div></div>);
          })}</div></ChartCard>
        </div>
      )}

      {activeSection === "roadmap" && (
        <ChartCard title="Development Roadmap"><div className="space-y-3">{ROADMAP_PHASES.map((p) => {
          const sc = p.status === "done" ? "#10B981" : p.status === "current" ? "#3B82F6" : "#64748B";
          return (<div key={p.phase} className="flex gap-4 p-4 rounded-lg border" style={{ borderColor: sc + "33", backgroundColor: p.status === "current" ? sc + "08" : "transparent" }}><div className="text-center shrink-0 w-16"><div className="text-xs font-black" style={{ color: sc }}>{p.phase}</div><div className="text-[9px] text-slate-500">Wk {p.weeks}</div></div><div className="flex-1"><div className="text-xs font-bold text-white mb-1">{p.title}</div><div className="grid grid-cols-2 gap-1">{p.items.map((item, i) => <div key={i} className="flex items-center gap-1.5 text-[9px] text-slate-400">{p.status === "done" ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}{item}</div>)}</div></div></div>);
        })}</div></ChartCard>
      )}

      {activeSection === "competitive" && (
        <ChartCard title="Competitive Radar"><ResponsiveContainer width="100%" height={300}><RadarChart data={[
          { dim: "AI/ML", ...Object.fromEntries(COMPETITOR_LANDSCAPE.map((c) => [c.name, c.ai])) },
          { dim: "UX", ...Object.fromEntries(COMPETITOR_LANDSCAPE.map((c) => [c.name, c.ux])) },
          { dim: "Pricing", ...Object.fromEntries(COMPETITOR_LANDSCAPE.map((c) => [c.name, c.price])) },
          { dim: "B2B", ...Object.fromEntries(COMPETITOR_LANDSCAPE.map((c) => [c.name, c.b2b])) },
          { dim: "API", ...Object.fromEntries(COMPETITOR_LANDSCAPE.map((c) => [c.name, c.api])) },
        ]}><PolarGrid stroke="#1E293B" /><PolarAngleAxis dataKey="dim" tick={{ fill: "#94A3B8", fontSize: 10 }} />{COMPETITOR_LANDSCAPE.map((c, i) => <Radar key={c.name} name={c.name} dataKey={c.name} stroke={["#3B82F6","#EF4444","#F59E0B","#10B981","#8B5CF6"][i]} fill={["#3B82F6","#EF4444","#F59E0B","#10B981","#8B5CF6"][i]} fillOpacity={i === 0 ? 0.15 : 0.05} strokeWidth={i === 0 ? 2.5 : 1.5} />)}<Legend wrapperStyle={{ fontSize: 9 }} /><Tooltip {...TT} /></RadarChart></ResponsiveContainer></ChartCard>
      )}

      {activeSection === "system" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <KPI icon={Server} label="Uptime" value="99.93%" color="#10B981" target="≥ 99.9%" />
            <KPI icon={Clock} label="Avg Latency" value="487ms" color="#06B6D4" target="< 500ms" />
            <KPI icon={Activity} label="Sessions" value={logs.length > 0 ? "Live" : "Idle"} color="#F59E0B" />
          </div>
          <ChartCard title="Service Health"><div className="space-y-2">{SYSTEM_HEALTH.map((s) => {
            const color = s.status === "healthy" ? "#10B981" : "#F59E0B";
            return (<div key={s.name} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-[#0B0F19] border border-[#1E293B]/50"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} /><div className="flex-1 text-xs text-white">{s.name}</div><Badge className="text-[8px]" style={{ backgroundColor: color + "15", color }}>{s.status === "healthy" ? "OK" : "Warn"}</Badge><span className="text-[10px] text-slate-400 w-14 text-right">{s.uptime}%</span><span className="text-[10px] text-slate-500 w-14 text-right">{s.latency}ms</span></div>);
          })}</div></ChartCard>
          <ChartCard title="PRD Technical Checklist"><div className="grid grid-cols-2 gap-2">{[
            { item: "PWMOIC scoring engine", done: true },{ item: "Secure frontend (SPA)", done: true },{ item: "PDF report generation", done: true },{ item: "Auth (individual + team)", done: true },{ item: "Payment gateway (Stripe)", done: true },{ item: "CRM / API integration", done: false },{ item: "GDPR/PDPA storage", done: true },{ item: "Bulk processing (100+)", done: false },{ item: "Encryption at rest + transit", done: true },{ item: "B2B queue strategies", done: false },{ item: "Feedback survey system", done: true },{ item: "NPS tracking pipeline", done: true },
          ].map((c, i) => <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded text-[10px]">{c.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}<span className={c.done ? "text-slate-300" : "text-amber-300"}>{c.item}</span></div>)}</div></ChartCard>
        </div>
      )}
    </div>
  );
}
