import React, { useState, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from "recharts";
import {
  UploadCloud, Download, RotateCcw, Zap, Trophy, Medal, Award,
  Crown, Star, Info, Pencil, ChevronDown, AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useValuation } from "@/contexts/ValuationContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/downloadUtils";
import FeedbackSurvey from "@/components/FeedbackSurvey";

const FIRM_COLORS = ["#3B82F6", "#06B6D4", "#A855F7"];

const GRADE_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  A: { emoji: "🏆", label: "Excellent", color: "#FFD700" }, B: { emoji: "🥈", label: "Good", color: "#C0C0C0" },
  C: { emoji: "🥉", label: "Fair", color: "#CD7F32" }, D: { emoji: "⚠️", label: "Needs Work", color: "#EF4444" },
};

const CATS = [
  { s: "A", t: "Risk/Reward Strategy", icon: "📊", items: [
    { sub: "A1", l: "Return", p: [{ n: "CAGR (3 Year)", full: "Compound Annual Growth Rate over past 3 years" }, { n: "ROI", full: "Return on Investment" }] },
    { sub: "A2", l: "Risk Assessment", p: [{ n: "Market Risk", full: "Market Risk Assessment" }, { n: "Product Risk", full: "Product Risk Assessment" }, { n: "Team Risk", full: "Team Risk Assessment" }, { n: "Finance Risk", full: "Financial Risk Assessment" }] },
    { sub: "A3", l: "PWMOIC", p: [{ n: "PWMOIC", full: "Probability-Weighted MOIC" }, { n: "Risk Adj", full: "Risk Adjustment Factor" }] },
  ]},
  { s: "B", t: "Visionary Team", icon: "👥", items: [
    { sub: "B1", l: "Founder", p: [{ n: "Experience", full: "Industry Experience" }, { n: "Vision", full: "Leadership and Vision" }] },
    { sub: "B2", l: "Integrity", p: [{ n: "Ethics", full: "Ethical Track Record" }, { n: "Transparency", full: "Transparency in Operations" }] },
    { sub: "B3", l: "Expert Team", p: [{ n: "PhDs", full: "Domain Experts" }, { n: "Skills", full: "Complementary Skills" }, { n: "Tenure", full: "Team Tenure" }] },
  ]},
  { s: "C", t: "Market Opportunity", icon: "🌍", items: [
    { sub: "C1", l: "Technology", p: [{ n: "Patents", full: "IP / Patents" }, { n: "Disruption", full: "Industry Disruptiveness" }, { n: "Uniqueness", full: "Product Uniqueness" }] },
    { sub: "C2", l: "Market", p: [{ n: "Mkt Size", full: "Market Size" }, { n: "TAM", full: "Total Addressable Market" }, { n: "Scalability", full: "Scalability Potential" }] },
    { sub: "C3", l: "Impact", p: [{ n: "ESG", full: "ESG Impact Score" }, { n: "Urgency", full: "Solution Urgency" }] },
  ]},
];

const SCORE_COLORS: Record<number, string> = { 1: "#EF4444", 2: "#F97316", 3: "#F59E0B", 4: "#10B981", 5: "#06B6D4" };

export default function ValuationSimulator() {
  const { weights, setWeights, firmScores, setFirmScores, firmNames, setFirmNames } = useValuation();
  const { addFeedback, addCustomerReview } = useApp();
  const [calculated, setCalculated] = useState(true);
  const [isCalc, setIsCalc] = useState(false);
  const [mode, setMode] = useState<"synthetic" | "custom">("synthetic");
  const [hoveredParam, setHoveredParam] = useState<number | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readonly = mode === "synthetic";
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightOk = Math.abs(totalWeight - 100) < 0.1;

  const updateScore = (fi: number, pi: number, v: number) => {
    if (readonly) return;
    const n = firmScores.map((f, i) => i === fi ? f.map((s, j) => (j === pi ? Math.max(1, Math.min(5, v)) : s)) : f);
    setFirmScores(n);
  };

  const results = useMemo(() => firmScores.map((scores) => {
    let idx = 0; const totals: Record<string, number> = {}; let total = 0;
    CATS.forEach((c) => { let ct = 0; c.items.forEach((it) => it.p.forEach(() => { ct += (scores[idx] || 1) * (weights[idx] / 100); idx++; })); totals[c.s] = ct; total += ct; });
    return { totals, total, std: (total / 5) * 100 };
  }), [firmScores, weights]);

  const sWeights = useMemo(() => { let idx = 0; const sw: Record<string, number> = {}; CATS.forEach((c) => { let s = 0; c.items.forEach((it) => it.p.forEach(() => { s += weights[idx]; idx++; })); sw[c.s] = s; }); return sw; }, [weights]);

  const ranked = results.map((r, i) => ({ idx: i, name: firmNames[i], std: r.std, color: FIRM_COLORS[i] })).sort((a, b) => b.std - a.std);
  const barData = firmNames.map((n, i) => ({ name: n, score: +results[i].std.toFixed(1), fill: FIRM_COLORS[i] }));

  const handleCalc = () => { setIsCalc(true); setCalculated(false); setTimeout(() => { setCalculated(true); setIsCalc(false); toast.success("Valuation computed"); }, 800); };

  const handleComputeClick = () => { if (!surveyCompleted) { setShowSurvey(true); } else { handleCalc(); } };

  const handleSurveyComplete = (result: import("@/components/FeedbackSurvey").SurveyResult) => {
    addFeedback(result);
    // Also create a CustomerReview so it appears in Customer Feedback page
    const { addCustomerReview } = useAppRef.current;
    const review: import("@/contexts/AppContext").CustomerReview = {
      id: crypto.randomUUID(),
      featureId: "valuation",
      userName: "Session User",
      userEmail: "user@session.local",
      rating: Math.round(result.wouldRecommend / 2),
      title: result.mostValuable ? `Most valuable: ${result.mostValuable}` : "Valuation Simulator Feedback",
      comment: result.suggestion || `Satisfaction: ${result.satisfaction}/5. Would recommend: ${result.wouldRecommend}/10.`,
      aiEnhanced: false,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      sentiment: result.wouldRecommend >= 7 ? "positive" : result.wouldRecommend >= 4 ? "neutral" : "negative",
      userRole: "User",
    };
    addCustomerReview(review);
    setSurveyCompleted(true);
    setShowSurvey(false);
    toast.success("Thank you for your feedback!");
    handleCalc();
  };

  const handleMode = (m: "synthetic" | "custom") => {
    setMode(m);
    if (m === "synthetic") {
      setWeights([10,10,5,5,5,5,7,3,5,5,5,2.5,2.5,2.5,2.5,5,5,2.5,2.5,2.5,2.5,2.5,2.5]);
      setFirmScores([[3,3,2,2,3,4,5,2,1,2,1,1,2,5,2,1,3,2,2,2,2,2,2],[2,2,2,2,2,2,2,2,5,5,5,5,5,5,4,3,2,3,2,4,4,4,4],[1,2,2,1,3,2,1,1,3,2,4,1,2,5,2,2,3,4,3,5,3,3,3]]);
      setFirmNames(["Firm A", "Firm B", "Firm C"]);
    }
  };

  const handleRefresh = () => { handleMode("synthetic"); toast.info("Reset to defaults"); };
  const getGrade = (std: number) => std >= 80 ? "A" : std >= 60 ? "B" : std >= 40 ? "C" : "D";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold text-white">Valuation Simulator</h1><p className="text-[10px] text-slate-500">Compare up to 3 firms across 23 weighted parameters</p></div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0B0F19] border border-[#1E293B] rounded-full p-0.5">
            {(["synthetic", "custom"] as const).map((m) => <button key={m} onClick={() => handleMode(m)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${mode === m ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-slate-300"}`}>{m}</button>)}
          </div>
          <div className="flex gap-1">
            <input ref={fileRef} type="file" hidden accept=".csv,.pdf,.jpg,.png,.xlsx" onChange={(e) => { if (e.target.files?.[0]) toast.success(`Uploaded: ${e.target.files[0].name}`); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><UploadCloud className="w-4 h-4" /></button>
            <button onClick={() => {
              const allParams: string[] = [];
              CATS.forEach((c) => c.items.forEach((it) => it.p.forEach((p) => allParams.push(p.n))));
              const headers = ["#", "Parameter", "Weight (%)", ...firmNames.flatMap((n) => [`${n} Score`, `${n} Weighted`])];
              const rows = allParams.map((name, pi) => {
                const row: (string | number)[] = [pi + 1, name, weights[pi]];
                firmScores.forEach((scores) => { const sc = scores[pi] || 1; row.push(sc, (sc * (weights[pi] / 100)).toFixed(3)); });
                return row;
              });
              rows.push(["", "TOTAL", weights.reduce((a, b) => a + b, 0).toFixed(1), ...results.flatMap((r) => ["", r.total.toFixed(3)])]);
              rows.push(["", "Standardized (100 pts)", "", ...results.flatMap((r) => ["", r.std.toFixed(1)])]);
              downloadCSV("valuation-simulator", headers, rows);
              toast.success("CSV downloaded");
            }} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
            <button onClick={handleRefresh} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {mode === "synthetic" ? (
        <div className="flex items-center gap-2.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-lg px-4 py-2.5"><Info className="w-4 h-4 text-blue-400 shrink-0" /><p className="text-xs text-blue-300"><strong>Synthetic Mode:</strong> Pre-filled demo data. Switch to Custom to edit.</p></div>
      ) : (
        <div className="flex items-center gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-lg px-4 py-2.5"><Pencil className="w-4 h-4 text-amber-400 shrink-0" /><p className="text-xs text-amber-300"><strong>Custom Mode:</strong> Edit all scores, weights, and firm names.</p></div>
      )}

      {!weightOk && <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"><AlertTriangle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-xs text-red-400 font-semibold">Total weight = {totalWeight.toFixed(1)}% — must equal 100%.</p></div>}

      {!readonly && (
        <Card className="bg-[#111827] border-[#1E293B]"><CardContent className="p-4">
          <h3 className="text-xs font-bold text-slate-300 mb-3">Firm Names (editable)</h3>
          <div className="grid grid-cols-3 gap-3">{firmNames.map((name, fi) => (
            <div key={fi} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: FIRM_COLORS[fi] }} /><input value={name} onChange={(e) => { const n = [...firmNames]; n[fi] = e.target.value; setFirmNames(n); }} className="flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500/50" style={{ color: FIRM_COLORS[fi] }} /></div>
          ))}</div>
        </CardContent></Card>
      )}

      <Card className="bg-[#111827] border-[#1E293B]"><CardContent className="p-5 overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead><tr className="border-b-2 border-[#1E293B]">
            <th className="text-left py-3 px-2 text-slate-500 w-8">#</th><th className="text-left py-3 px-2 text-slate-500 min-w-[140px]">Parameter</th><th className="text-center py-3 px-2 text-slate-500 w-14">Wt%</th>
            {firmNames.map((n, fi) => <th key={fi} className="text-center py-3 px-2 min-w-[100px]" colSpan={2}><div className="flex items-center justify-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: FIRM_COLORS[fi] }} /><span className="font-bold" style={{ color: FIRM_COLORS[fi] }}>{n}</span></div><div className="flex justify-center gap-4 mt-1 text-[8px] text-slate-600"><span>Score</span><span>Weighted</span></div></th>)}
          </tr></thead>
          <tbody>{(() => {
            let pi = 0; const rows: JSX.Element[] = [];
            CATS.forEach((cat) => {
              rows.push(<tr key={`cat-${cat.s}`} className="bg-blue-500/5"><td colSpan={3 + firmNames.length * 2} className="py-2.5 px-2"><div className="flex items-center gap-2"><span className="text-sm">{cat.icon}</span><span className="text-xs font-bold text-blue-400">{cat.s}. {cat.t}</span><Badge className="text-[8px] px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/20">{sWeights[cat.s]?.toFixed(1)}%</Badge></div></td></tr>);
              cat.items.forEach((item) => {
                rows.push(<tr key={`sub-${item.sub}`}><td colSpan={3 + firmNames.length * 2} className="py-1 px-2 pl-6"><span className="text-[9px] text-slate-600 italic">{item.sub}. {item.l}</span></td></tr>);
                item.p.forEach((param) => {
                  const idx = pi; const isHovered = hoveredParam === idx;
                  rows.push(
                    <tr key={`p-${idx}`} className={`border-b border-[#1E293B]/20 transition-colors ${isHovered ? "bg-blue-500/5" : "hover:bg-white/[0.01]"}`} onMouseEnter={() => setHoveredParam(idx)} onMouseLeave={() => setHoveredParam(null)}>
                      <td className="py-2 px-2 text-slate-600 font-mono">{idx + 1}</td>
                      <td className="py-2 px-2"><div className="text-slate-300 font-medium">{param.n}</div>{isHovered && <div className="text-[8px] text-slate-500 mt-0.5">{param.full}</div>}</td>
                      <td className="py-2 px-2 text-center">{readonly ? <span className="text-[10px] font-semibold text-blue-400">{weights[idx]}</span> : <input type="number" value={weights[idx]} min={0} max={100} step={0.5} onChange={(e) => { const n = [...weights]; n[idx] = Number(e.target.value) || 0; setWeights(n); }} className="w-12 bg-[#0B0F19] border border-blue-500/20 rounded px-1.5 py-1 text-[10px] text-blue-400 text-center outline-none" />}</td>
                      {firmScores.map((scores, fi) => { const sc = scores[idx] || 1; const w = sc * (weights[idx] / 100); return (
                        <React.Fragment key={fi}>
                          <td className="py-2 px-1 text-center">{readonly ? <span className="inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-bold" style={{ backgroundColor: (SCORE_COLORS[sc] || "#64748B") + "15", color: SCORE_COLORS[sc] || "#64748B" }}>{sc}</span> : <select value={sc} onChange={(e) => updateScore(fi, idx, Number(e.target.value))} className="w-11 bg-[#0B0F19] border border-[#1E293B] rounded px-1 py-1 text-[10px] text-center outline-none" style={{ color: FIRM_COLORS[fi] }}>{[1,2,3,4,5].map((v) => <option key={v} value={v}>{v}</option>)}</select>}</td>
                          <td className="py-2 px-1 text-center"><span className="text-[10px] font-semibold font-mono" style={{ color: FIRM_COLORS[fi] }}>{w.toFixed(3)}</span></td>
                        </React.Fragment>
                      ); })}
                    </tr>
                  );
                  pi++;
                });
              });
              rows.push(<tr key={`st-${cat.s}`} className="bg-blue-500/5 border-t border-blue-500/20"><td colSpan={2} className="py-2.5 px-2 text-right"><span className="text-xs font-bold text-blue-400">Subtotal {cat.s}</span></td><td className="text-center text-[10px] font-semibold text-blue-400">{sWeights[cat.s]?.toFixed(1)}%</td>{results.map((r, fi) => <td key={fi} colSpan={2} className="text-center py-2.5"><span className="text-sm font-black" style={{ color: FIRM_COLORS[fi] }}>{r.totals[cat.s]?.toFixed(3)}</span></td>)}</tr>);
            });
            return rows;
          })()}</tbody>
          <tfoot>
            <tr className="bg-blue-500/10 border-t-2 border-blue-500/30"><td colSpan={2} className="py-3 px-2 text-right"><span className="text-sm font-black text-blue-400">TOTAL</span></td><td className="text-center py-3"><span className="text-xs font-bold" style={{ color: weightOk ? "#3B82F6" : "#EF4444" }}>{totalWeight.toFixed(1)}%</span></td>{results.map((r, fi) => <td key={fi} colSpan={2} className="text-center py-3"><span className="text-base font-black" style={{ color: FIRM_COLORS[fi] }}>{r.total.toFixed(3)}</span></td>)}</tr>
            <tr className="bg-blue-500/5"><td colSpan={2} className="py-2.5 px-2 text-right"><span className="text-xs font-bold text-slate-400">Standardized (100 pts)</span></td><td />{results.map((r, fi) => <td key={fi} colSpan={2} className="text-center py-2.5"><span className="text-lg font-black" style={{ color: FIRM_COLORS[fi] }}>{r.std.toFixed(1)}</span></td>)}</tr>
          </tfoot>
        </table>
      </CardContent></Card>

      <Button onClick={handleComputeClick} disabled={isCalc || !weightOk} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50">
        {isCalc ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Computing...</span> : <span className="flex items-center gap-2"><Zap className="w-4 h-4" />Compute Valuation</span>}
      </Button>

      <FeedbackSurvey open={showSurvey} onClose={() => setShowSurvey(false)} onComplete={(result) => { addFeedback(result); setSurveyCompleted(true); setShowSurvey(false); toast.success("Thank you for your feedback!"); handleCalc(); }} onSkip={() => { setSurveyCompleted(true); setShowSurvey(false); handleCalc(); }} />

      {calculated && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-[#111827] border-[#1E293B] overflow-hidden"><CardContent className="p-0"><div className="p-5 border-l-4" style={{ borderLeftColor: ranked[0].color }}><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">🏆</div><div className="flex-1"><div className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Valuation Winner</div><div className="text-xl font-black" style={{ color: ranked[0].color }}>{ranked[0].name}</div><div className="flex items-center gap-2 mt-1 text-xs text-slate-400">{ranked.map((r, i) => <span key={i} className="flex items-center gap-1">{i === 0 && "🥇"}{i === 1 && "🥈"}{i === 2 && "🥉"}<span style={{ color: r.color }} className="font-semibold">{r.name}</span><span className="text-slate-500">({r.std.toFixed(1)})</span>{i < ranked.length - 1 && <span className="text-slate-600 mx-0.5">&gt;</span>}</span>)}</div></div><div className="text-right"><div className="text-3xl font-black" style={{ color: ranked[0].color }}>{ranked[0].std.toFixed(1)}</div><div className="text-[10px] text-slate-500">points</div></div></div></div></CardContent></Card>

          <div className="grid grid-cols-3 gap-4">{results.map((r, fi) => { const color = FIRM_COLORS[fi]; const grade = getGrade(r.std); const gInfo = GRADE_INFO[grade]; const rank = ranked.findIndex((x) => x.idx === fi); const isWinner = rank === 0; return (
            <Card key={fi} className={`bg-[#111827] border-[#1E293B] overflow-hidden ${isWinner ? "ring-1 ring-amber-500/30" : ""}`} style={{ borderTopWidth: 3, borderTopColor: color }}><CardContent className="p-5">
              <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><span className="text-lg">{rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"}</span><span className="text-xs font-bold" style={{ color }}>{firmNames[fi]}</span></div>{isWinner && <Badge className="text-[8px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20"><Crown className="w-2 h-2 mr-0.5" /> WINNER</Badge>}</div>
              <div className="text-center mb-3"><div className="text-4xl font-black" style={{ color }}>{r.std.toFixed(1)}</div><div className="text-[10px] text-slate-500 mt-0.5">out of 100</div></div>
              <div className="flex items-center justify-center gap-2 mb-4"><span className="text-xl">{gInfo.emoji}</span><Badge className="text-xs font-bold px-3 py-0.5" style={{ backgroundColor: gInfo.color + "15", color: gInfo.color }}>Grade {grade} — {gInfo.label}</Badge></div>
              <div className="space-y-2">{CATS.map((cat) => <div key={cat.s} className="flex items-center justify-between"><span className="text-[10px] text-slate-400 flex items-center gap-1"><span>{cat.icon}</span> {cat.s}. {cat.t}</span><span className="text-[10px] font-bold font-mono" style={{ color }}>{r.totals[cat.s]?.toFixed(3)}</span></div>)}</div>
              <div className="mt-3 w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.std}%`, backgroundColor: color }} /></div>
            </CardContent></Card>
          ); })}</div>

          <Card className="bg-[#111827] border-[#1E293B]"><CardContent className="p-5">
            <h3 className="text-sm font-bold text-white mb-4">Score Comparison</h3>
            <ResponsiveContainer width="100%" height={180}><BarChart data={barData} layout="vertical"><XAxis type="number" domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} /><YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} width={60} /><Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v} pts`, "Score"]} /><Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>{barData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer>
          </CardContent></Card>

          <Card className="bg-[#111827] border-[#1E293B]"><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-slate-400" /><h3 className="text-sm font-bold text-white">Grading Scale</h3></div>
            <div className="grid grid-cols-4 gap-2">{(["A","B","C","D"] as const).map((g) => { const info = GRADE_INFO[g]; return (
              <div key={g} className="text-center py-3 px-2 rounded-lg border border-[#1E293B]" style={{ backgroundColor: results.some((r) => getGrade(r.std) === g) ? info.color + "08" : "transparent", borderColor: results.some((r) => getGrade(r.std) === g) ? info.color + "33" : "#1E293B" }}>
                <div className="text-2xl mb-1">{info.emoji}</div><div className="text-sm font-black" style={{ color: info.color }}>Grade {g}</div><div className="text-[9px] text-slate-500 mt-0.5">{g === "A" ? "≥ 80 pts" : g === "B" ? "60–79 pts" : g === "C" ? "40–59 pts" : "< 40 pts"}</div><div className="text-[9px] font-medium mt-0.5" style={{ color: info.color }}>{info.label}</div>
              </div>
            ); })}</div>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}
