// src/pages/DecodedXReturn.tsx
import React, { useState, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from "recharts";
import {
  UploadCloud, Download, RotateCcw, Zap, Info, ChevronDown, Pencil,
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

const SYNTHETIC_DEFAULTS = {
  creation: { market: 40, product: 70, team: 90, finance: 40 },
  early: { market: 100, product: 90, team: 85, finance: 80 },
  mass: { market: 60, product: 90, team: 80, finance: 80 },
};

type RiskFactors = { market: number; product: number; team: number; finance: number };
const RISK_KEYS: (keyof RiskFactors)[] = ["market", "product", "team", "finance"];
const DROPDOWN_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function RiskCard({ title, accent, risk, setRisk, readonly }: {
  title: string; accent: string; risk: RiskFactors; setRisk: (r: RiskFactors) => void; readonly: boolean;
}) {
  const [editModes, setEditModes] = useState<Record<string, "dropdown" | "input">>({
    market: "dropdown", product: "dropdown", team: "dropdown", finance: "dropdown",
  });
  const success = RISK_KEYS.reduce((acc, k) => acc * (risk[k] / 100), 1);
  const toggleMode = (key: string) => {
    if (readonly) return;
    setEditModes((prev) => ({ ...prev, [key]: prev[key] === "dropdown" ? "input" : "dropdown" }));
  };

  return (
    <Card className="bg-[#111827] border-[#1E293B] overflow-hidden" style={{ borderLeftWidth: 3, borderLeftColor: accent }}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
          <h4 className="text-xs font-bold" style={{ color: accent }}>{title}</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {RISK_KEYS.map((key) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-500 capitalize">{key}</label>
                {!readonly && (
                  <button onClick={() => toggleMode(key)} className="w-4 h-4 flex items-center justify-center rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                    {editModes[key] === "dropdown" ? <Pencil className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                  </button>
                )}
              </div>
              {readonly ? (
                <div className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-md px-3 py-2 text-xs text-white font-medium flex items-center justify-between opacity-80">
                  {risk[key]}%<span className="text-[8px] text-slate-600">locked</span>
                </div>
              ) : editModes[key] === "dropdown" ? (
                <select value={risk[key]} onChange={(e) => setRisk({ ...risk, [key]: Number(e.target.value) })} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 transition-colors">
                  {DROPDOWN_OPTIONS.map((v) => <option key={v} value={v}>{v}%</option>)}
                </select>
              ) : (
                <input type="number" value={risk[key]} min={0} max={100} onChange={(e) => setRisk({ ...risk, [key]: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-md px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 transition-colors" placeholder="0-100" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5" style={{ backgroundColor: accent + "12" }}>
          <span className="text-[10px] text-slate-400">M×P×T×F =</span>
          <span className="text-base font-black tracking-tight" style={{ color: accent }}>{(success * 100).toFixed(2)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DecodedXReturn() {
  const [mode, setMode] = useState<"synthetic" | "custom">("synthetic");
  const [calculated, setCalculated] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [riskCreation, setRiskCreation] = useState<RiskFactors>({ ...SYNTHETIC_DEFAULTS.creation });
  const [riskEarly, setRiskEarly] = useState<RiskFactors>({ ...SYNTHETIC_DEFAULTS.early });
  const [riskMass, setRiskMass] = useState<RiskFactors>({ ...SYNTHETIC_DEFAULTS.mass });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (newMode: "synthetic" | "custom") => {
    setMode(newMode);
    if (newMode === "synthetic") {
      setRiskCreation({ ...SYNTHETIC_DEFAULTS.creation });
      setRiskEarly({ ...SYNTHETIC_DEFAULTS.early });
      setRiskMass({ ...SYNTHETIC_DEFAULTS.mass });
    }
  };

  const cS = RISK_KEYS.reduce((a, k) => a * (riskCreation[k] / 100), 1);
  const eS = RISK_KEYS.reduce((a, k) => a * (riskEarly[k] / 100), 1);
  const mS = RISK_KEYS.reduce((a, k) => a * (riskMass[k] / 100), 1);

  const probs = useMemo(() => {
    const earlySucc = cS * eS;
    const earlyFail = cS * (1 - eS);
    const massSucc = earlySucc * mS;
    const massFail = earlySucc * (1 - mS);
    return [massSucc * 0.2, massSucc * 0.3, massSucc * 0.5, massFail * 0.3, massFail * 0.7, earlyFail, 1 - cS];
  }, [cS, eS, mS]);

  const totalSuccess = probs.slice(0, 5).reduce((a, b) => a + b, 0);
  const totalFailure = probs.slice(5).reduce((a, b) => a + b, 0);

  const handleCalculate = () => {
    setIsCalculating(true); setCalculated(false);
    setTimeout(() => { setCalculated(true); setIsCalculating(false); toast.success("Scenarios calculated successfully"); }, 800);
  };

  const handleRefresh = () => {
    setRiskCreation({ ...SYNTHETIC_DEFAULTS.creation }); setRiskEarly({ ...SYNTHETIC_DEFAULTS.early }); setRiskMass({ ...SYNTHETIC_DEFAULTS.mass });
    setMode("synthetic"); toast.info("Reset to synthetic defaults");
  };

  const chartData = SCENARIOS.map((s, i) => ({ name: s.id, fullName: s.name, value: +(probs[i] * 100).toFixed(2), color: s.color }));
  const stages = [
    { label: "CREATION", value: cS, color: "#F97316" },
    { label: "EARLY STAGE", value: eS, color: "#06B6D4" },
    { label: "MASS MARKET", value: mS, color: "#10B981" },
  ];

  return (
    <div className="space-y-4 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Decoded X Return</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0B0F19] border border-[#1E293B] rounded-full p-0.5">
            {(["synthetic", "custom"] as const).map((m) => (
              <button key={m} onClick={() => handleModeChange(m)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 capitalize ${mode === m ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-slate-300"}`}>{m}</button>
            ))}
          </div>
          <div className="flex gap-1">
            <input ref={fileRef} type="file" hidden accept=".csv,.pdf,.jpg,.png,.xlsx" onChange={(e) => { if (e.target.files?.[0]) toast.success(`Uploaded: ${e.target.files[0].name}`); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><UploadCloud className="w-4 h-4" /></button>
            <button onClick={() => toast.success("Download started")} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
            <button onClick={handleRefresh} className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* MODE BANNER */}
      {mode === "synthetic" ? (
        <div className="flex items-center gap-2.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-lg px-4 py-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-blue-300"><span className="font-semibold">Synthetic Mode:</span> Using pre-configured risk parameters for demonstration. Switch to Custom to edit.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 bg-amber-500/[0.08] border border-amber-500/20 rounded-lg px-4 py-2.5">
          <Pencil className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300"><span className="font-semibold">Custom Mode:</span> Adjust risk parameters to model your own scenario. Click ✏️ on any input for free-text entry.</p>
        </div>
      )}

      {/* RISK ASSESSMENT */}
      <Card className="bg-[#111827] border-[#1E293B]">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1"><h2 className="text-sm font-bold text-white">Risk Assessment (M × P × T × F)</h2></div>
          <p className="text-[10px] text-slate-500 mb-4">Success = Market × Product × Team × Finance{mode === "custom" && ". Click ✏️ to toggle free-text input."}</p>
          <div className="grid grid-cols-3 gap-4">
            <RiskCard title="Startups Creation" accent="#F97316" risk={riskCreation} setRisk={setRiskCreation} readonly={mode === "synthetic"} />
            <RiskCard title="Early Stage" accent="#06B6D4" risk={riskEarly} setRisk={setRiskEarly} readonly={mode === "synthetic"} />
            <RiskCard title="Mass Market" accent="#10B981" risk={riskMass} setRisk={setRiskMass} readonly={mode === "synthetic"} />
          </div>
        </CardContent>
      </Card>

      {/* CALCULATE BUTTON */}
      <Button onClick={handleCalculate} disabled={isCalculating} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50">
        {isCalculating ? (
          <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Calculating...</div>
        ) : (
          <div className="flex items-center gap-2"><Zap className="w-4 h-4" />Calculate Scenarios</div>
        )}
      </Button>

      {/* RESULTS */}
      {calculated && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stage Flow */}
          <Card className="bg-[#111827] border-[#1E293B]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-5"><h3 className="text-sm font-bold text-white">Stage Flow</h3><Info className="w-3.5 h-3.5 text-slate-600" /></div>
              <div className="flex items-center justify-center gap-4">
                {stages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {i > 0 && <div className="flex items-center gap-1"><div className="w-6 h-px bg-slate-700" /><span className="text-slate-600 text-sm">→</span><div className="w-6 h-px bg-slate-700" /></div>}
                    <div className="text-center px-6 py-4 rounded-xl border transition-all hover:scale-105" style={{ borderColor: stage.color + "33", backgroundColor: stage.color + "08" }}>
                      <Badge className="mb-2 text-[8px] font-bold tracking-widest px-2.5 py-0.5" style={{ backgroundColor: stage.color + "20", color: stage.color, borderColor: stage.color + "30" }}>{stage.label}</Badge>
                      <div className="text-2xl font-black text-white">{(stage.value * 100).toFixed(2)}%</div>
                      <div className="mt-2 w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: stage.color + "15" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stage.value * 100}%`, backgroundColor: stage.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#1E293B]">
                <span className="text-[10px] text-slate-500">Creation Fail: <span className="text-red-400 font-semibold">{((1 - cS) * 100).toFixed(2)}%</span></span>
                <span className="text-[10px] text-slate-500">Early Fail (Niche): <span className="text-red-400 font-semibold">{(cS * (1 - eS) * 100).toFixed(2)}%</span></span>
                <span className="text-[10px] text-slate-500">Mass Fail: <span className="text-red-400 font-semibold">{(cS * eS * (1 - mS) * 100).toFixed(2)}%</span></span>
              </div>
            </CardContent>
          </Card>

          {/* Scenarios + Summary */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="col-span-3 bg-[#111827] border-[#1E293B]">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-white mb-4">Scenario Probabilities</h3>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-[#1E293B]"><th className="text-left py-2.5 px-2 text-slate-400 font-medium">ID</th><th className="text-left py-2.5 px-2 text-slate-400 font-medium">Name</th><th className="text-right py-2.5 px-2 text-slate-400 font-medium">Probability</th><th className="text-right py-2.5 px-2 text-slate-400 font-medium">Category</th></tr></thead>
                  <tbody>
                    {SCENARIOS.map((s, i) => (
                      <tr key={s.id} className="border-b border-[#1E293B]/40 hover:bg-white/[0.01] transition-colors">
                        <td className="py-2.5 px-2"><span className="inline-flex items-center justify-center w-7 h-5 rounded-full text-[9px] font-bold" style={{ backgroundColor: s.color + "20", color: s.color }}>{s.id}</span></td>
                        <td className="py-2.5 px-2 text-slate-300">{s.name}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-white">{(probs[i] * 100).toFixed(2)}%</td>
                        <td className="py-2.5 px-2 text-right"><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${i <= 4 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{i <= 4 ? "SUCCESS" : "FAIL"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t border-blue-500/20 bg-blue-500/5"><td colSpan={2} className="py-2.5 px-2 font-bold text-blue-400">TOTAL</td><td className="py-2.5 px-2 text-right font-mono font-black text-blue-400">100.00%</td><td /></tr></tfoot>
                </table>
              </CardContent>
            </Card>

            <div className="col-span-2 flex flex-col gap-4">
              <Card className="bg-[#111827] border-[#1E293B] border-l-4 border-l-emerald-500 flex-1">
                <CardContent className="p-5">
                  <h4 className="text-xs font-bold text-emerald-400 mb-2">SUCCESS (S7→S3)</h4>
                  <div className="text-4xl font-black text-emerald-400 mb-3">{(totalSuccess * 100).toFixed(2)}%</div>
                  <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(totalSuccess * 500, 100)}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {SCENARIOS.slice(0, 5).map((s, i) => (
                      <div key={s.id} className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-slate-400">{s.id}: {s.name}</span></span>
                        <span className="font-mono font-semibold text-white">{(probs[i] * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#111827] border-[#1E293B] border-l-4 border-l-red-500 flex-1">
                <CardContent className="p-5">
                  <h4 className="text-xs font-bold text-red-400 mb-2">FAILURE (S2→S1)</h4>
                  <div className="text-4xl font-black text-red-400 mb-3">{(totalFailure * 100).toFixed(2)}%</div>
                  <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(totalFailure * 100, 100)}%` }} />
                  </div>
                  <div className="space-y-1.5">
                    {SCENARIOS.slice(5).map((s, i) => (
                      <div key={s.id} className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-slate-400">{s.id}: {s.name}</span></span>
                        <span className="font-mono font-semibold text-white">{(probs[i + 5] * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Scenario Distribution Chart */}
          <Card className="bg-[#111827] border-[#1E293B]">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-white mb-4">Scenario Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} width={36} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: 8, fontSize: 11 }} formatter={(value: number, name: string, entry: any) => [`${value}%`, entry.payload.fullName]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
