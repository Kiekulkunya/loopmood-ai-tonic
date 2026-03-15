import { useMemo, useRef } from "react";
import { useValuation } from "@/contexts/ValuationContext";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, CartesianGrid, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, TrendingDown,
  UploadCloud, Download, RotateCcw,
  Sparkles, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { downloadAsImage } from "@/lib/downloadUtils";

const FIRM_COLORS = ["#3B82F6", "#06B6D4", "#A855F7"];
const SEC_COUNTS = [8, 7, 8];
const SEC_NAMES = ["Risk/Reward", "Team", "Market"];
const SEC_COLORS = ["#3B82F6", "#8B5CF6", "#10B981"];

const PARAM_NAMES = [
  "CAGR 3Y","ROI","Market Risk","Product Risk","Team Risk","Finance Risk","PWMOIC","Risk Adj",
  "Experience","Vision","Ethics","Transparency","PhDs","Skills","Tenure",
  "Patents","Disruption","Uniqueness","Mkt Size","TAM","Scalability","ESG","Urgency",
];

const SCORE_COLORS: Record<number, string> = { 1: "#EF4444", 2: "#F97316", 3: "#F59E0B", 4: "#10B981", 5: "#06B6D4" };
const GRADE_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  A: { emoji: "🏆", label: "Excellent", color: "#FFD700" }, B: { emoji: "🥈", label: "Good", color: "#C0C0C0" },
  C: { emoji: "🥉", label: "Fair", color: "#CD7F32" }, D: { emoji: "⚠️", label: "Needs Work", color: "#EF4444" },
};
const getGrade = (s: number) => (s >= 80 ? "A" : s >= 60 ? "B" : s >= 40 ? "C" : "D");

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (<Card className={`bg-[#111827] border-[#1E293B] ${className}`}><CardContent className="p-5"><div className="mb-4"><h4 className="text-sm font-bold text-white">{title}</h4>{subtitle && <p className="text-[9px] text-slate-500 mt-0.5">{subtitle}</p>}</div>{children}</CardContent></Card>);
}

const DarkTooltip = { contentStyle: { backgroundColor: "#0F172A", border: "1px solid #1E293B", borderRadius: 10, fontSize: 11, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }, labelStyle: { color: "#94A3B8", fontWeight: 600 } };

export default function NovaDashboard() {
  const { weights, firmScores, firmNames } = useValuation();
  const fileRef = useRef<HTMLInputElement>(null);

  const sectionData = useMemo(() => SEC_NAMES.map((name, si) => {
    const start = SEC_COUNTS.slice(0, si).reduce((a, b) => a + b, 0);
    const d: Record<string, any> = { section: name };
    firmNames.forEach((fn, fi) => { let t = 0; for (let i = start; i < start + SEC_COUNTS[si]; i++) t += (firmScores[fi][i] || 1) * (weights[i] / 100); d[fn] = +t.toFixed(3); });
    return d;
  }), [weights, firmScores, firmNames]);

  const results = useMemo(() => firmScores.map((sc) => { let t = 0; sc.forEach((s, i) => { t += (s || 1) * (weights[i] / 100); }); return { t, std: +(t / 5 * 100).toFixed(1) }; }), [firmScores, weights]);
  const ranked = firmNames.map((n, i) => ({ n, std: results[i].std, color: FIRM_COLORS[i], idx: i })).sort((a, b) => b.std - a.std);
  const hBarData = firmNames.map((n, i) => ({ name: n, score: results[i].std, fill: FIRM_COLORS[i] }));

  const pieData = useMemo(() => { let idx = 0; return SEC_COUNTS.map((cnt, si) => { let s = 0; for (let i = 0; i < cnt; i++) { s += weights[idx]; idx++; } return { name: SEC_NAMES[si], value: +s.toFixed(1) }; }); }, [weights]);

  const lineData = useMemo(() => weights.map((_, pi) => {
    const pt: Record<string, any> = { idx: pi + 1, param: PARAM_NAMES[pi] || `P${pi + 1}` };
    firmNames.forEach((n, fi) => { let cum = 0; for (let i = 0; i <= pi; i++) cum += (firmScores[fi][i] || 1) * (weights[i] / 100); pt[n] = +cum.toFixed(3); });
    return pt;
  }), [weights, firmScores, firmNames]);

  const paramCompareData = useMemo(() => PARAM_NAMES.map((name, pi) => {
    const d: Record<string, any> = { name: name.length > 10 ? name.slice(0, 10) + "…" : name, fullName: name };
    firmNames.forEach((fn, fi) => { d[fn] = firmScores[fi][pi] || 1; });
    return d;
  }), [firmScores, firmNames]);

  const gapData = useMemo(() => PARAM_NAMES.map((name, pi) => {
    const scores = firmScores.map((s) => s[pi] || 1); const max = Math.max(...scores); const min = Math.min(...scores);
    return { name, gap: max - min, max, min, maxFirm: firmNames[scores.indexOf(max)], minFirm: firmNames[scores.indexOf(min)] };
  }).sort((a, b) => b.gap - a.gap), [firmScores, firmNames]);

  const firmInsights = useMemo(() => firmNames.map((fn, fi) => {
    const scored = PARAM_NAMES.map((name, pi) => ({ name, score: firmScores[fi][pi] || 1, weight: weights[pi] }));
    return { fn, strengths: scored.filter((s) => s.score >= 4).sort((a, b) => b.weight - a.weight).slice(0, 3), weaknesses: scored.filter((s) => s.score <= 2).sort((a, b) => b.weight - a.weight).slice(0, 3), avg: +(scored.reduce((a, s) => a + s.score, 0) / scored.length).toFixed(2) };
  }), [firmScores, firmNames, weights]);

  const dashRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4" ref={dashRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" />Nova Dashboard</h1>
          <p className="text-[10px] text-slate-500">Comprehensive valuation analytics & firm comparison</p>
        </div>
        <div className="flex gap-1">
          <input ref={fileRef} type="file" hidden accept=".csv,.pdf,.png" onChange={(e) => { if (e.target.files?.[0]) toast.success(`Uploaded: ${e.target.files[0].name}`); e.target.value = ""; }} />
          <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><UploadCloud className="w-4 h-4" /></button>
          <button onClick={async () => { if (dashRef.current) { await downloadAsImage(dashRef.current, "nova-dashboard"); toast.success("Image downloaded"); } }} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
          <button onClick={() => toast.info("Refreshed")} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      <Card className="bg-[#111827] border-[#1E293B] overflow-hidden"><CardContent className="p-0">
        <div className="p-5 border-l-4 flex items-center gap-5" style={{ borderLeftColor: ranked[0].color }}>
          <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl shrink-0">🏆</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Valuation Battle Winner</div>
            <div className="text-xl font-black" style={{ color: ranked[0].color }}>{ranked[0].n}</div>
            <div className="flex items-center gap-2 mt-1 text-xs">{ranked.map((r, i) => (<span key={i} className="flex items-center gap-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}<span style={{ color: r.color }} className="font-semibold">{r.n}</span><span className="text-slate-500">({r.std})</span>{i < ranked.length - 1 && <span className="text-slate-600">&gt;</span>}</span>))}</div>
          </div>
          <div className="text-right shrink-0"><div className="text-3xl font-black" style={{ color: ranked[0].color }}>{ranked[0].std}</div><div className="text-[9px] text-slate-500">/ 100 points</div></div>
        </div>
      </CardContent></Card>

      <div className="grid grid-cols-3 gap-4">
        {results.map((r, fi) => { const color = FIRM_COLORS[fi]; const grade = getGrade(r.std); const gInfo = GRADE_INFO[grade]; const rank = ranked.findIndex((x) => x.idx === fi); return (
          <Card key={fi} className="bg-[#111827] border-[#1E293B]" style={{ borderTopWidth: 3, borderTopColor: color }}><CardContent className="p-4">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-sm">{rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"}</span><span className="text-xs font-bold" style={{ color }}>{firmNames[fi]}</span></div><Badge className="text-[8px]" style={{ backgroundColor: gInfo.color + "15", color: gInfo.color }}>{gInfo.emoji} {grade}</Badge></div>
            <div className="text-2xl font-black text-center my-1" style={{ color }}>{r.std}</div>
            <div className="text-[9px] text-slate-500 text-center mb-2">Avg Score: {firmInsights[fi].avg}/5</div>
            <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.std}%`, backgroundColor: color }} /></div>
          </CardContent></Card>
        ); })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Firm Comparison Radar" subtitle="Weighted scores across 3 categories">
          <ResponsiveContainer width="100%" height={280}><RadarChart data={sectionData}><PolarGrid stroke="#1E293B" /><PolarAngleAxis dataKey="section" tick={{ fill: "#94A3B8", fontSize: 11 }} /><PolarRadiusAxis tick={{ fill: "#475569", fontSize: 9 }} />{firmNames.map((n, i) => <Radar key={n} name={n} dataKey={n} stroke={FIRM_COLORS[i]} fill={FIRM_COLORS[i]} fillOpacity={0.12} strokeWidth={2.5} dot={{ r: 3, fill: FIRM_COLORS[i] }} />)}<Legend wrapperStyle={{ fontSize: 10, paddingTop: 12 }} /><Tooltip {...DarkTooltip} /></RadarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Category Breakdown" subtitle="Section subtotals per firm">
          <ResponsiveContainer width="100%" height={280}><BarChart data={sectionData} barCategoryGap="20%"><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" /><XAxis dataKey="section" tick={{ fill: "#94A3B8", fontSize: 10 }} /><YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} /><Tooltip {...DarkTooltip} />{firmNames.map((n, i) => <Bar key={n} dataKey={n} fill={FIRM_COLORS[i]} radius={[4, 4, 0, 0]} />)}<Legend wrapperStyle={{ fontSize: 10 }} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Standardized Scores" subtitle="Out of 100 points">
          <ResponsiveContainer width="100%" height={200}><BarChart data={hBarData} layout="vertical" barSize={28}><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} /><XAxis type="number" domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} /><YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} width={65} /><Tooltip {...DarkTooltip} formatter={(v: number) => [`${v} pts`, "Score"]} /><Bar dataKey="score" radius={[0, 6, 6, 0]}>{hBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Weight Distribution" subtitle="Section allocation (must = 100%)">
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3} label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: "#334155", strokeWidth: 1 }}>{pieData.map((_, i) => <Cell key={i} fill={SEC_COLORS[i]} stroke="#111827" strokeWidth={2} />)}</Pie><Tooltip {...DarkTooltip} /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Cumulative Weighted Score Build-up" subtitle="How each firm's score accumulates across 23 parameters">
        <ResponsiveContainer width="100%" height={280}><AreaChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" /><XAxis dataKey="idx" tick={{ fill: "#94A3B8", fontSize: 9 }} /><YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} /><Tooltip {...DarkTooltip} labelFormatter={(v) => `Param ${v}: ${PARAM_NAMES[Number(v) - 1] || ""}`} />{firmNames.map((n, i) => <Area key={n} type="monotone" dataKey={n} stroke={FIRM_COLORS[i]} fill={FIRM_COLORS[i]} fillOpacity={0.08} strokeWidth={2.5} dot={{ r: 2, fill: FIRM_COLORS[i] }} />)}<Legend wrapperStyle={{ fontSize: 10 }} /></AreaChart></ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Parameter-by-Parameter Score Comparison" subtitle="Raw scores (1–5) for all 23 parameters">
        <ResponsiveContainer width="100%" height={360}><BarChart data={paramCompareData} barCategoryGap="15%"><CartesianGrid strokeDasharray="3 3" stroke="#1E293B" /><XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 8 }} interval={0} angle={-35} textAnchor="end" height={60} /><YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#94A3B8", fontSize: 9 }} /><Tooltip {...DarkTooltip} labelFormatter={(_, payload: any) => payload?.[0]?.payload?.fullName || ""} />{firmNames.map((n, i) => <Bar key={n} dataKey={n} fill={FIRM_COLORS[i]} radius={[2, 2, 0, 0]} />)}<Legend wrapperStyle={{ fontSize: 10 }} /></BarChart></ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Score Heatmap" subtitle="Color intensity = score (1=red → 5=cyan)">
          <div className="max-h-[380px] overflow-y-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead className="sticky top-0 bg-[#111827] z-10"><tr className="border-b border-[#1E293B]"><th className="text-left py-2 px-2 text-slate-500 w-8">#</th><th className="text-left py-2 px-2 text-slate-500">Param</th>{firmNames.map((n, i) => <th key={i} className="text-center py-2 px-2 font-bold" style={{ color: FIRM_COLORS[i] }}>{n}</th>)}</tr></thead>
              <tbody>{PARAM_NAMES.map((name, pi) => (<tr key={pi} className="border-b border-[#1E293B]/15 hover:bg-white/[0.01]"><td className="py-1.5 px-2 text-slate-600 font-mono">{pi + 1}</td><td className="py-1.5 px-2 text-slate-300">{name}</td>{firmScores.map((sc, fi) => { const v = sc[pi] || 1; return <td key={fi} className="py-1.5 px-2 text-center"><span className="inline-flex items-center justify-center w-7 h-6 rounded text-[9px] font-bold" style={{ backgroundColor: (SCORE_COLORS[v] || "#64748B") + "33", color: SCORE_COLORS[v] || "#64748B" }}>{v}</span></td>; })}</tr>))}</tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-[#1E293B]">{[1,2,3,4,5].map((v) => <div key={v} className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: SCORE_COLORS[v] + "44" }} /><span className="text-[8px] text-slate-500">{v}={["Poor","Low","Fair","Good","Excellent"][v-1]}</span></div>)}</div>
        </ChartCard>

        <ChartCard title="Gap Analysis" subtitle="Largest score differences between firms">
          <div className="space-y-2 max-h-[380px] overflow-y-auto">{gapData.slice(0, 12).map((g, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#0B0F19] border border-[#1E293B]/50">
              <div className="w-7 text-center"><span className={`text-xs font-black ${g.gap >= 3 ? "text-red-400" : g.gap >= 2 ? "text-amber-400" : "text-slate-400"}`}>{g.gap}</span></div>
              <div className="flex-1 min-w-0"><div className="text-[10px] text-white font-medium truncate">{g.name}</div><div className="flex items-center gap-2 mt-0.5"><span className="text-[8px] text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2" />{g.maxFirm}: {g.max}</span><span className="text-[8px] text-red-400 flex items-center gap-0.5"><ArrowDownRight className="w-2 h-2" />{g.minFirm}: {g.min}</span></div></div>
              <div className="w-20 h-1.5 bg-[#1E293B] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(g.gap / 4) * 100}%`, backgroundColor: g.gap >= 3 ? "#EF4444" : g.gap >= 2 ? "#F59E0B" : "#64748B" }} /></div>
            </div>
          ))}</div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-4">{firmInsights.map((fi, idx) => { const color = FIRM_COLORS[idx]; return (
        <Card key={idx} className="bg-[#111827] border-[#1E293B]"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} /><h4 className="text-xs font-bold" style={{ color }}>{fi.fn} — Insights</h4></div>
          <div className="mb-3"><div className="text-[9px] text-emerald-400 font-semibold mb-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Strengths</div>{fi.strengths.length === 0 ? <p className="text-[9px] text-slate-600">No strong params</p> : fi.strengths.map((s, i) => <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[9px] text-slate-300">{s.name}</span><span className="text-[8px] font-bold text-emerald-400">{s.score}/5</span></div>)}</div>
          <div><div className="text-[9px] text-red-400 font-semibold mb-1.5 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Weaknesses</div>{fi.weaknesses.length === 0 ? <p className="text-[9px] text-slate-600">No weak params</p> : fi.weaknesses.map((s, i) => <div key={i} className="flex items-center justify-between py-0.5"><span className="text-[9px] text-slate-300">{s.name}</span><span className="text-[8px] font-bold text-red-400">{s.score}/5</span></div>)}</div>
        </CardContent></Card>
      ); })}</div>

      <Card className="bg-[#111827] border-[#1E293B]"><CardContent className="p-5">
        <h4 className="text-xs font-bold text-slate-400 mb-2">📖 Methodology</h4>
        <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-500 leading-relaxed">
          <p><strong className="text-slate-300">Scoring:</strong> Each parameter rated 1–5. Weighted (total=100%). Standardized to 100-point scale. <strong className="text-slate-300">Grading:</strong> A(≥80), B(60–79), C(40–59), D(&lt;40).</p>
          <p><strong className="text-slate-300">Categories:</strong> A. Risk/Reward (50%), B. Team (25%), C. Market (25%). <strong className="text-slate-300">Gap Analysis:</strong> Largest score differences reveal competitive advantages.</p>
        </div>
      </CardContent></Card>
    </div>
  );
}
