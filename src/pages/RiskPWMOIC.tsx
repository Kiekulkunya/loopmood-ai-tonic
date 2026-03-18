import { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from "recharts";
import {
  UploadCloud, Download, RotateCcw, Zap, Info, Pencil,
  ChevronDown, AlertTriangle, BookOpen, Calculator,
  TrendingUp, Building2, Globe, Users, DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/downloadUtils";

const SCENARIOS = [
  { id: "S7", name: "MKT Leader Disruption", color: "#EC4899" },
  { id: "S6", name: "Challenger", color: "#8B5CF6" },
  { id: "S5", name: "Laggard", color: "#06B6D4" },
  { id: "S4", name: "Early Adoption", color: "#10B981" },
  { id: "S3", name: "Innovator", color: "#F59E0B" },
  { id: "S2", name: "White Paper Only", color: "#F97316" },
  { id: "S1", name: "Initial Idea Only", color: "#EF4444" },
];

const INDUSTRIES = [
  { name: "Artificial Intelligence", cap: 2000 },
  { name: "Machine Learning", cap: 2000 },
  { name: "AI Agents / Autonomous Systems", cap: 2000 },
  { name: "FinTech", cap: 880 },
  { name: "Blockchain / Web3", cap: 160 },
  { name: "InsurTech", cap: 150 },
  { name: "RegTech", cap: 55 },
  { name: "HealthTech / Digital Health", cap: 1000 },
  { name: "BioTech", cap: 4000 },
  { name: "ClimateTech", cap: 5000 },
  { name: "Clean Energy", cap: 4000 },
  { name: "Robotics", cap: 210 },
  { name: "Automation / Industrial Automation", cap: 320 },
  { name: "Cybersecurity", cap: 500 },
  { name: "SpaceTech", cap: 1000 },
  { name: "EdTech", cap: 404 },
  { name: "Quantum Computing", cap: 20 },
  { name: "Synthetic Biology", cap: 100 },
  { name: "Neurotechnology", cap: 60 },
  { name: "Water Technology", cap: 1000 },
  { name: "Defense Technology", cap: 1000 },
  { name: "Digital Twin Infrastructure", cap: 150 },
  { name: "Custom", cap: 0 },
];

const SYNTH_RISKS = {
  creation: { market: 40, product: 70, team: 90, finance: 40 },
  early: { market: 100, product: 90, team: 85, finance: 80 },
  mass: { market: 60, product: 90, team: 80, finance: 80 },
};

const SYNTH_SHARES = [15, 15, 15, 15, 13.33, 13.33, 13.33];
const SYNTH_MULTIPLIERS = [40, 20, 8, 1, 0.2, 0, 0];
const SYNTH_INVEST = [35, 20, 15, 10, 10, 5, 5];

type Risk = { market: number; product: number; team: number; finance: number };
const RISK_KEYS: (keyof Risk)[] = ["market", "product", "team", "finance"];
const OPTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const fmt = (v: number, d = 2) => v.toFixed(d);

const SCORE_SCALE = [
  { min: 4, score: 5, label: "Excellent", color: "#06B6D4", desc: "PWMOIC ≥ 4x — Outstanding return potential. Strong buy signal." },
  { min: 3, score: 4, label: "Good", color: "#10B981", desc: "PWMOIC 3x–3.9x — Solid risk-adjusted return. Favorable investment." },
  { min: 2, score: 3, label: "Fair", color: "#F59E0B", desc: "PWMOIC 2x–2.9x — Moderate return. Proceed with due diligence." },
  { min: 1, score: 2, label: "Low", color: "#F97316", desc: "PWMOIC 1x–1.9x — Below average. High risk relative to return." },
  { min: -Infinity, score: 1, label: "Poor", color: "#EF4444", desc: "PWMOIC < 1x — Negative expected return. Capital destruction risk." },
];

function getScore(pw: number) {
  return SCORE_SCALE.find((x) => pw >= x.min)!;
}

function NI({ value, onChange, className = "", disabled = false }: {
  value: number; onChange: (v: number) => void; className?: string; disabled?: boolean;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      disabled={disabled}
      className={`bg-[#0B0F19] border border-[#1E293B] rounded-md px-2 py-1.5 text-xs text-white text-center outline-none focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    />
  );
}

function RiskRow({ label, accent, risk, setRisk, readonly }: {
  label: string; accent: string; risk: Risk; setRisk: (r: Risk) => void; readonly: boolean;
}) {
  const [modes, setModes] = useState<Record<string, "dd" | "in">>({ market: "dd", product: "dd", team: "dd", finance: "dd" });
  const success = RISK_KEYS.reduce((a, k) => a * (risk[k] / 100), 1);

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-[72px] shrink-0 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <span className="text-[10px] text-slate-400 truncate">{label}</span>
      </div>
      {RISK_KEYS.map((k) => (
        <div key={k} className="flex items-center gap-0.5 w-[72px] shrink-0">
          {readonly ? (
            <div className="w-full bg-[#0B0F19] border border-[#1E293B] rounded px-2 py-1.5 text-[10px] text-slate-400 text-center">{risk[k]}%</div>
          ) : modes[k] === "dd" ? (
            <select value={risk[k]} onChange={(e) => setRisk({ ...risk, [k]: Number(e.target.value) })} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded px-1 py-1.5 text-[10px] text-white outline-none">
              {OPTS.map((v) => <option key={v} value={v}>{v}%</option>)}
            </select>
          ) : (
            <input type="number" value={risk[k]} min={0} max={100} onChange={(e) => setRisk({ ...risk, [k]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded px-1 py-1.5 text-[10px] text-white outline-none" />
          )}
          {!readonly && (
            <button onClick={() => setModes((p) => ({ ...p, [k]: p[k] === "dd" ? "in" : "dd" }))} className="w-4 h-4 flex items-center justify-center text-slate-600 hover:text-blue-400 shrink-0">
              {modes[k] === "dd" ? <Pencil className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />}
            </button>
          )}
        </div>
      ))}
      <div className="w-[64px] shrink-0 text-right">
        <span className="text-[10px] font-bold" style={{ color: accent }}>{(success * 100).toFixed(2)}%</span>
      </div>
    </div>
  );
}

export default function RiskPWMOIC() {
  const [mode, setMode] = useState<"synthetic" | "custom">("synthetic");
  const [calculated, setCalculated] = useState(true);
  const [isCalc, setIsCalc] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [industry, setIndustry] = useState("ClimateTech");
  const [customName, setCustomName] = useState("");
  const [customCap, setCustomCap] = useState(2000);
  const totalCap = useMemo(() => {
    if (industry === "Custom") return customCap;
    return INDUSTRIES.find((i) => i.name === industry)?.cap || 2000;
  }, [industry, customCap]);

  const [rC, setRC] = useState<Risk>({ ...SYNTH_RISKS.creation });
  const [rE, setRE] = useState<Risk>({ ...SYNTH_RISKS.early });
  const [rM, setRM] = useState<Risk>({ ...SYNTH_RISKS.mass });

  const [shareMode, setShareMode] = useState<"synthetic" | "custom">("synthetic");
  const [customShares, setCustomShares] = useState([41.5, 34, 16, 6, 2.5, 0, 0]);
  const shares = shareMode === "synthetic" ? SYNTH_SHARES : customShares;

  const [tamApproach, setTamApproach] = useState("Top-Down");
  const [tdMkt, setTdMkt] = useState(600);
  const [tdSeg, setTdSeg] = useState(60);
  const [tdGeo, setTdGeo] = useState(80);

  // Sync Total Market Size with Industry Selection
  useEffect(() => {
    setTdMkt(totalCap);
  }, [totalCap]);
  const [buCust, setBuCust] = useState(100);
  const [buArpu, setBuArpu] = useState(100000);
  const [vtCust, setVtCust] = useState(100);
  const [vtCost, setVtCost] = useState(50000);
  const [vtSave, setVtSave] = useState(20);

  const baseTAM = useMemo(() => {
    if (tamApproach === "Top-Down") return tdMkt * (tdSeg / 100) * (tdGeo / 100);
    if (tamApproach === "Bottom-Up") return (buCust * buArpu) / 1000;
    return (vtCust * vtCost * (vtSave / 100)) / 1000;
  }, [tamApproach, tdMkt, tdSeg, tdGeo, buCust, buArpu, vtCust, vtCost, vtSave]);

  const [multipliers, setMultipliers] = useState([...SYNTH_MULTIPLIERS]);
  const [investPcts, setInvestPcts] = useState([...SYNTH_INVEST]);

  const readonly = mode === "synthetic";
  const cS = RISK_KEYS.reduce((a, k) => a * (rC[k] / 100), 1);
  const eS = RISK_KEYS.reduce((a, k) => a * (rE[k] / 100), 1);
  const mS = RISK_KEYS.reduce((a, k) => a * (rM[k] / 100), 1);

  const investTotal = investPcts.reduce((a, b) => a + b, 0);
  const investOk = Math.abs(investTotal - 100) < 0.1;

  const shareTotal = shares.reduce((a, b) => a + b, 0);
  const shareOk = Math.abs(shareTotal - 100) < 0.1;
  const allInputsOk = investOk && shareOk;

  const probs = useMemo(() => {
    const es = cS * eS, ef = cS * (1 - eS), ms = es * mS, mf = es * (1 - mS);
    return [ms * 0.2, ms * 0.3, ms * 0.5, mf * 0.3, mf * 0.7, ef, 1 - cS];
  }, [cS, eS, mS]);

  const tamVals = shares.map((s) => totalCap * s / 100);
  const revVals = tamVals.map((t, i) => t * shares[i] / 100);
  const exitVals = revVals.map((r, i) => r * multipliers[i]);
  const invCaps = investPcts.map((s) => totalCap * s / 100);
  const moics = exitVals.map((e, i) => invCaps[i] > 0 ? e / invCaps[i] : 0);
  const pwmoics = probs.map((p, i) => p * moics[i]);
  const totalPW = pwmoics.reduce((a, b) => a + b, 0);
  const scoreInfo = getScore(totalPW);

  const pwChartData = SCENARIOS.map((s, i) => ({ name: s.id, fullName: s.name, value: +(pwmoics[i]).toFixed(6), color: s.color }));

  const handleMode = (m: "synthetic" | "custom") => {
    setMode(m);
    if (m === "synthetic") {
      setRC({ ...SYNTH_RISKS.creation }); setRE({ ...SYNTH_RISKS.early }); setRM({ ...SYNTH_RISKS.mass });
      setMultipliers([...SYNTH_MULTIPLIERS]); setInvestPcts([...SYNTH_INVEST]);
      setShareMode("synthetic");
    }
  };

  const handleCalc = () => {
    if (!shareOk) {
      toast.error(`Market Share total = ${shareTotal.toFixed(1)}% — must equal 100% before computing PWMOIC.`);
      return;
    }
    if (!investOk) {
      toast.error(`Investment CAP total = ${investTotal.toFixed(1)}% — must equal 100% before computing PWMOIC.`);
      return;
    }
    setIsCalc(true); setCalculated(false);
    setTimeout(() => { setCalculated(true); setIsCalc(false); toast.success("PWMOIC calculated"); }, 800);
  };

  const handleRefresh = () => {
    handleMode("synthetic"); setIndustry("ClimateTech");
    setTamApproach("Top-Down"); setTdSeg(60); setTdGeo(80);
    toast.info("Reset to defaults");
  };

  const TAM_TABS = [
    { id: "Top-Down", icon: TrendingUp, label: "Top-Down" },
    { id: "Bottom-Up", icon: Users, label: "Bottom-Up" },
    { id: "Value Theory", icon: DollarSign, label: "Value Theory" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Unleashing Risk & PWMOIC</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0B0F19] border border-[#1E293B] rounded-full p-0.5">
            {(["synthetic", "custom"] as const).map((m) => (
              <button key={m} onClick={() => handleMode(m)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${mode === m ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-slate-300"}`}>{m}</button>
            ))}
          </div>
          <div className="flex gap-1">
            <input ref={fileRef} type="file" hidden accept=".csv,.pdf,.jpg,.png,.xlsx" onChange={(e) => { if (e.target.files?.[0]) toast.success(`Uploaded: ${e.target.files[0].name}`); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><UploadCloud className="w-4 h-4" /></button>
            <button onClick={() => {
              const headers = ["Scenario ID", "Name", "Probability (%)", "TAM ($B)", "Revenue ($B)", "Exit Value ($B)", "Invest CAP ($B)", "MOIC", "PWMOIC"];
              const rows = SCENARIOS.map((s, i) => [s.id, s.name, (probs[i] * 100).toFixed(2), tamVals[i].toFixed(2), revVals[i].toFixed(4), exitVals[i].toFixed(4), invCaps[i].toFixed(2), moics[i].toFixed(4), pwmoics[i].toFixed(6)]);
              rows.push(["TOTAL", "", "100.00", "", "", "", "", "", totalPW.toFixed(4)]);
              downloadCSV("risk-pwmoic", headers, rows);
              toast.success("CSV downloaded");
            }} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
            <button onClick={handleRefresh} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {mode === "synthetic" ? (
        <div className="flex items-center gap-2.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-lg px-4 py-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-blue-300"><span className="font-semibold">Synthetic Mode:</span> Pre-configured parameters. Switch to Custom to edit all inputs.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-lg px-4 py-2.5">
          <Pencil className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300"><span className="font-semibold">Custom Mode:</span> All parameters are editable.</p>
        </div>
      )}

      {!investOk && (
        <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-semibold">Investment CAP total = {investTotal.toFixed(1)}% — must equal 100%.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><Building2 className="w-4 h-4 text-blue-400" /><h3 className="text-xs font-bold text-blue-400">Industry Selection</h3></div>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} disabled={readonly} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white outline-none mb-3 disabled:opacity-60">
              {INDUSTRIES.map((i) => <option key={i.name} value={i.name}>{i.name}{i.cap > 0 ? ` ($${i.cap}B)` : ""}</option>)}
            </select>
            {industry === "Custom" && (
              <div className="flex gap-2 mb-3">
                <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Industry name" className="flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2 text-xs text-white outline-none" />
                <NI value={customCap} onChange={setCustomCap} className="w-20" />
                <span className="text-[10px] text-slate-500 self-center">$B</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-[#1E293B]">
              <span className="text-[10px] text-slate-500">Total Market Capital</span>
              <span className="text-xl font-black text-blue-400">${totalCap.toLocaleString()}B</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-400" /><h3 className="text-xs font-bold text-amber-400">Risk Assessment — Probability Engine</h3></div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[72px]" />
              {["Market", "Product", "Team", "Finance"].map((l) => <div key={l} className="w-[72px] shrink-0 text-center text-[8px] text-slate-500 font-medium">{l}</div>)}
              <div className="w-[64px] shrink-0 text-right text-[8px] text-slate-500">M×P×T×F</div>
            </div>
            <RiskRow label="Creation" accent="#F97316" risk={rC} setRisk={setRC} readonly={readonly} />
            <RiskRow label="Early Stage" accent="#06B6D4" risk={rE} setRisk={setRE} readonly={readonly} />
            <RiskRow label="Mass Market" accent="#10B981" risk={rM} setRisk={setRM} readonly={readonly} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /><h3 className="text-xs font-bold text-cyan-400">Market Share Distribution</h3></div>
              <div className="flex bg-[#0B0F19] border border-[#1E293B] rounded-full p-0.5">
                {(["synthetic", "custom"] as const).map((m) => (
                  <button key={m} onClick={() => !readonly && setShareMode(m)} disabled={readonly} className={`px-3 py-1 rounded-full text-[9px] font-semibold transition-all capitalize disabled:opacity-50 ${shareMode === m ? "bg-cyan-600 text-white" : "text-slate-500"}`}>{m === "synthetic" ? "60/40" : "Custom"}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5">
              {SCENARIOS.map((s, i) => (
                <div key={s.id} className="flex-1 text-center">
                  <div className="text-[8px] font-bold mb-1" style={{ color: s.color }}>{s.id}</div>
                  {shareMode === "custom" && !readonly ? (
                    <NI value={customShares[i]} onChange={(v) => { const n = [...customShares]; n[i] = v; setCustomShares(n); }} className="w-full text-[10px]" />
                  ) : (
                    <div className="bg-cyan-500/5 border border-cyan-500/15 rounded px-1 py-1.5 text-[10px] text-slate-300">{shares[i].toFixed(1)}%</div>
                  )}
                </div>
              ))}
            </div>
            <div className={`text-right mt-2 text-[9px] ${shareOk ? "text-emerald-400" : "text-amber-400 font-semibold"}`}>
              Total: {shareTotal.toFixed(1)}%{!shareOk && " ⚠ Must equal 100%"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><Calculator className="w-4 h-4 text-emerald-400" /><h3 className="text-xs font-bold text-emerald-400">TAM Computation</h3></div>
            <div className="flex gap-1.5 mb-3">
              {TAM_TABS.map((t) => { const Icon = t.icon; const active = tamApproach === t.id; return (
                <button key={t.id} onClick={() => setTamApproach(t.id)} disabled={readonly} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all disabled:opacity-50 ${active ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-transparent border-[#1E293B] text-slate-500"}`}>
                  <Icon className="w-3 h-3" /> {t.label}
                </button>
              ); })}
            </div>
            {tamApproach === "Top-Down" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Total Market Size ($B)</span><NI value={tdMkt} onChange={setTdMkt} className="w-20" disabled={readonly} /></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Segment %</span><NI value={tdSeg} onChange={setTdSeg} className="w-20" disabled={readonly} /></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Geographic / Demo %</span><NI value={tdGeo} onChange={setTdGeo} className="w-20" disabled={readonly} /></div>
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-2 text-[9px] text-slate-500">TAM = {tdMkt} × {tdSeg}% × {tdGeo}% = <span className="text-emerald-400 font-bold">${fmt(baseTAM, 1)}B</span></div>
              </div>
            )}
            {tamApproach === "Bottom-Up" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Customers (Million)</span><NI value={buCust} onChange={setBuCust} className="w-20" disabled={readonly} /></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">ARPU / Year ($)</span><NI value={buArpu} onChange={setBuArpu} className="w-24" disabled={readonly} /></div>
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-2 text-[9px] text-slate-500">TAM = {buCust}M × ${buArpu.toLocaleString()} = <span className="text-emerald-400 font-bold">${fmt(baseTAM, 1)}B</span></div>
              </div>
            )}
            {tamApproach === "Value Theory" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Potential Customers (M)</span><NI value={vtCust} onChange={setVtCust} className="w-20" disabled={readonly} /></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Energy Cost / Client ($)</span><NI value={vtCost} onChange={setVtCost} className="w-24" disabled={readonly} /></div>
                <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Revenue (% of saving)</span><NI value={vtSave} onChange={setVtSave} className="w-20" disabled={readonly} /></div>
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-2 text-[9px] text-slate-500">TAM = {vtCust}M × ${vtCost.toLocaleString()} × {vtSave}% = <span className="text-emerald-400 font-bold">${fmt(baseTAM, 1)}B</span></div>
              </div>
            )}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1E293B]">
              <span className="text-[10px] text-slate-500">Base TAM</span>
              <span className="text-base font-black text-emerald-400">${fmt(baseTAM, 1)}B</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-4">
            <h3 className="text-xs font-bold text-slate-300 mb-3">Revenue Multipliers</h3>
            <div className="flex gap-1.5">
              {SCENARIOS.map((s, i) => (
                <div key={s.id} className="flex-1 text-center">
                  <div className="text-[8px] font-bold mb-1" style={{ color: s.color }}>{s.id}</div>
                  <NI value={multipliers[i]} onChange={(v) => { const n = [...multipliers]; n[i] = v; setMultipliers(n); }} className="w-full text-[10px]" disabled={readonly} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-4">
            <h3 className="text-xs font-bold text-slate-300 mb-3">Investment CAP Share %</h3>
            <div className="flex gap-1.5">
              {SCENARIOS.map((s, i) => (
                <div key={s.id} className="flex-1 text-center">
                  <div className="text-[8px] font-bold mb-1" style={{ color: s.color }}>{s.id}</div>
                  <NI value={investPcts[i]} onChange={(v) => { const n = [...investPcts]; n[i] = v; setInvestPcts(n); }} className="w-full text-[10px]" disabled={readonly} />
                </div>
              ))}
            </div>
            <p className={`text-[8px] mt-2 ${investOk ? "text-slate-600" : "text-red-400 font-semibold"}`}>Total: {investTotal.toFixed(1)}% {!investOk && "⚠ Must equal 100%"}</p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleCalc} disabled={isCalc} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50">
        {isCalc ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Calculating...</span> : <span className="flex items-center gap-2"><Zap className="w-4 h-4" />Calculate PWMOIC</span>}
      </Button>

      {calculated && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-[#111827] border-[#1E293B]">
            <CardContent className="p-5 overflow-x-auto">
              <h3 className="text-sm font-bold text-white mb-4">PWMOIC Analysis for Venture Decision-Making</h3>
              <table className="w-full text-[10px]">
                <thead><tr className="border-b border-[#1E293B]">{["Scenario","Prob%","Share%","TAM ($B)","REV ($B)","Mult","Exit ($B)","Inv%","InvCAP ($B)","MOIC","PWMOIC"].map((h) => <th key={h} className="py-2.5 px-1.5 text-slate-400 font-medium text-center">{h}</th>)}</tr></thead>
                <tbody>
                  {SCENARIOS.map((s, i) => (
                    <tr key={s.id} className="border-b border-[#1E293B]/30 hover:bg-white/[0.01]">
                      <td className="py-2 px-1.5 text-center"><span className="px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ backgroundColor: s.color + "20", color: s.color }}>{s.id}</span></td>
                      <td className="text-center font-mono font-bold" style={{ color: s.color }}>{(probs[i] * 100).toFixed(2)}%</td>
                      <td className="text-center text-slate-300">{shares[i].toFixed(1)}%</td>
                      <td className="text-center text-slate-300">${fmt(tamVals[i], 1)}</td>
                      <td className="text-center text-cyan-400">${fmt(revVals[i], 2)}</td>
                      <td className="text-center text-slate-300">{multipliers[i]}</td>
                      <td className="text-center text-emerald-400 font-bold">${fmt(exitVals[i], 1)}</td>
                      <td className="text-center text-slate-300">{investPcts[i]}%</td>
                      <td className="text-center text-slate-300">${fmt(invCaps[i], 1)}</td>
                      <td className="text-center text-amber-400 font-bold">{fmt(moics[i])}</td>
                      <td className="text-center font-black text-xs" style={{ color: s.color }}>{fmt(pwmoics[i], 4)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="bg-blue-500/5 border-t border-blue-500/20"><td colSpan={10} className="py-2.5 px-2 text-right font-bold text-blue-400">Σ PWMOIC</td><td className="py-2.5 text-center font-black text-sm text-blue-400">{fmt(totalPW, 4)}</td></tr></tfoot>
              </table>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1E293B]">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 tracking-widest uppercase mb-1">Final PWMOIC</div>
                  <div className="text-5xl font-black text-blue-400">{fmt(totalPW)}</div>
                </div>
                <div className="w-px h-16 bg-[#1E293B]" />
                <div className="text-center">
                  <div className="text-[9px] text-slate-500 tracking-widest uppercase mb-1">Score</div>
                  <div className="text-3xl font-black" style={{ color: scoreInfo.color }}>{scoreInfo.score}</div>
                  <Badge className="mt-1 text-[10px]" style={{ backgroundColor: scoreInfo.color + "20", color: scoreInfo.color }}>{scoreInfo.label}</Badge>
                </div>
                <div className="w-px h-16 bg-[#1E293B]" />
                <div className="flex gap-1.5">
                  {SCORE_SCALE.slice().reverse().map((s) => (
                    <div key={s.score} className={`w-10 text-center py-1.5 rounded-md transition-all ${scoreInfo.score === s.score ? "scale-110" : "opacity-40"}`} style={{ backgroundColor: s.color + "20", boxShadow: scoreInfo.score === s.score ? `0 0 0 2px ${s.color}, 0 0 0 3px #111827` : undefined }}>
                      <div className="text-sm font-black" style={{ color: s.color }}>{s.score}</div>
                      <div className="text-[7px] font-semibold" style={{ color: s.color }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1E293B]">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-white mb-4">PWMOIC Contribution by Scenario</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pwChartData} layout="vertical" margin={{ left: 8, right: 20 }}>
                  <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} width={32} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: 8, fontSize: 11 }} formatter={(v: number, _: string, entry: any) => [v.toFixed(6), entry.payload.fullName]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>{pwChartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1E293B]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-slate-400" /><h3 className="text-sm font-bold text-white">PWMOIC Score Reference Guide</h3></div>
              <div className="space-y-2.5">
                {SCORE_SCALE.map((s) => (
                  <div key={s.score} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: scoreInfo.score === s.score ? s.color + "44" : "#1E293B", backgroundColor: scoreInfo.score === s.score ? s.color + "08" : "transparent" }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-black" style={{ backgroundColor: s.color + "20", color: s.color }}>{s.score}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                        {scoreInfo.score === s.score && <Badge className="text-[8px] px-1.5 py-0" style={{ backgroundColor: s.color + "20", color: s.color }}>← CURRENT</Badge>}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#1E293B]">
                <p className="text-[9px] text-slate-600 leading-relaxed"><strong>Formula:</strong> PWMOIC = Σ (Probability_i × MOIC_i). MOIC = Exit Value / Invested Capital. Above 1x = positive expected returns.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
