import { useState, useMemo } from "react";
import Toolbar from "@/components/Toolbar";

const SCENARIOS = [
  { id: "S7", name: "MKT Leader", color: "#EC4899" },
  { id: "S6", name: "Challenger", color: "#8B5CF6" },
  { id: "S5", name: "Laggard", color: "#06B6D4" },
  { id: "S4", name: "Early Adopt", color: "#10B981" },
  { id: "S3", name: "Innovator", color: "#F59E0B" },
  { id: "S2", name: "White Paper", color: "#F97316" },
  { id: "S1", name: "Initial Idea", color: "#EF4444" },
];

const INDUSTRIES = [
  { n: "Artificial Intelligence", c: 2000 }, { n: "FinTech", c: 880 }, { n: "BioTech", c: 4000 },
  { n: "ClimateTech", c: 5000 }, { n: "Clean Energy", c: 4000 }, { n: "Cybersecurity", c: 500 },
  { n: "SpaceTech", c: 1000 }, { n: "HealthTech", c: 1000 }, { n: "EdTech", c: 404 },
  { n: "Robotics", c: 210 }, { n: "Blockchain", c: 160 }, { n: "Others", c: 0 },
];

const fmt = (v: number, d = 2) => (typeof v === "number" && !isNaN(v) ? v.toFixed(d) : "0.00");

export default function RiskPWMOIC() {
  const [ind, setInd] = useState("ClimateTech");
  const [cc, setCC] = useState(2000);
  const cap = ind === "Others" ? cc : (INDUSTRIES.find((i) => i.n === ind)?.c || 2000);

  const [rC, sRC] = useState({ market: 40, product: 70, team: 90, finance: 40 });
  const [rE, sRE] = useState({ market: 100, product: 90, team: 85, finance: 80 });
  const [rM, sRM] = useState({ market: 60, product: 90, team: 80, finance: 80 });

  const cS = (rC.market / 100) * (rC.product / 100) * (rC.team / 100) * (rC.finance / 100);
  const eS = (rE.market / 100) * (rE.product / 100) * (rE.team / 100) * (rE.finance / 100);
  const mS = (rM.market / 100) * (rM.product / 100) * (rM.team / 100) * (rM.finance / 100);

  const probs = useMemo(() => {
    const es = cS * eS, ef = cS * (1 - eS), ms = es * mS, mf = es * (1 - mS);
    return [ms * 0.2, ms * 0.3, ms * 0.5, mf * 0.3, mf * 0.7, ef, 1 - cS];
  }, [cS, eS, mS]);

  const sh = [15, 15, 15, 15, 13.33, 13.33, 13.33];
  const [mul, setMul] = useState([40, 20, 8, 1, 0.2, 0, 0]);
  const [inv, setInv] = useState([35, 20, 15, 10, 10, 5, 5]);

  const tam = sh.map((s) => cap * s / 100);
  const rev = tam.map((t, i) => t * sh[i] / 100);
  const ex = rev.map((r, i) => r * mul[i]);
  const ic = inv.map((s) => cap * s / 100);
  const moic = ex.map((e, i) => (ic[i] > 0 ? e / ic[i] : 0));
  const pw = probs.map((p, i) => p * moic[i]);
  const tPW = pw.reduce((a, b) => a + b, 0);
  const sc = tPW >= 4 ? 5 : tPW >= 3 ? 4 : tPW >= 2 ? 3 : tPW >= 1 ? 2 : 1;
  const sl = ["", "Poor", "Low", "Fair", "Good", "Excellent"][sc];
  const scl = ["", "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4"][sc];

  const handleRefresh = () => {
    sRC({ market: 40, product: 70, team: 90, finance: 40 });
    sRE({ market: 100, product: 90, team: 85, finance: 80 });
    sRM({ market: 60, product: 90, team: 80, finance: 80 });
    setMul([40, 20, 8, 1, 0.2, 0, 0]);
    setInv([35, 20, 15, 10, 10, 5, 5]);
  };

  return (
    <div className="p-4 animate-fade-in">
      <Toolbar title="Unleashing Risk & PWMOIC" onRefresh={handleRefresh} />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-bold text-primary mb-2">Industry Selection</div>
          <select value={ind} onChange={(e) => setInd(e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground mb-2">
            {INDUSTRIES.map((i) => <option key={i.n} value={i.n}>{i.n}</option>)}
          </select>
          {ind === "Others" && (
            <input type="number" value={cc} onChange={(e) => setCC(+e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground mb-2" placeholder="Custom cap ($B)" />
          )}
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">Market Cap</span>
            <span className="text-lg font-black text-primary">${cap.toLocaleString()}B</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-bold text-primary mb-2">Risk Engine</div>
          {[
            { l: "Creation", r: rC, s: sRC },
            { l: "Early", r: rE, s: sRE },
            { l: "Mass", r: rM, s: sRM },
          ].map(({ l, r, s }) => {
            const v = (r.market / 100) * (r.product / 100) * (r.team / 100) * (r.finance / 100);
            return (
              <div key={l} className="flex items-center gap-1 mb-1">
                <span className="text-[9px] text-muted-foreground w-12">{l}</span>
                {(["market", "product", "team", "finance"] as const).map((k) => (
                  <select key={k} value={r[k]} onChange={(e) => s({ ...r, [k]: +e.target.value })} className="bg-background border border-border rounded px-0.5 py-0.5 text-[9px] text-foreground w-12">
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => <option key={v} value={v}>{v}%</option>)}
                  </select>
                ))}
                <span className="text-[10px] font-bold text-primary w-12 text-right">{(v * 100).toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-bold text-muted-foreground mb-2">Multipliers</div>
          <div className="flex gap-1">
            {SCENARIOS.map((s, i) => (
              <div key={s.id} className="flex-1 text-center">
                <div className="text-[8px] font-bold mb-1" style={{ color: s.color }}>{s.id}</div>
                <input type="number" value={mul[i]} onChange={(e) => { const n = [...mul]; n[i] = +e.target.value || 0; setMul(n); }} className="w-full bg-background border border-border rounded px-0.5 py-0.5 text-[10px] text-foreground text-center" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-bold text-muted-foreground mb-2">Invest CAP %</div>
          <div className="flex gap-1">
            {SCENARIOS.map((s, i) => (
              <div key={s.id} className="flex-1 text-center">
                <div className="text-[8px] font-bold mb-1" style={{ color: s.color }}>{s.id}</div>
                <input type="number" value={inv[i]} onChange={(e) => { const n = [...inv]; n[i] = +e.target.value || 0; setInv(n); }} className="w-full bg-background border border-border rounded px-0.5 py-0.5 text-[10px] text-foreground text-center" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 mb-3 overflow-x-auto">
        <div className="text-xs font-bold text-foreground mb-2">PWMOIC Analysis</div>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-border">
              {["", "Prob%", "Sh%", "TAM", "REV", "Mul", "Exit", "Inv%", "InvCAP", "MOIC", "PWMOIC"].map((h) => (
                <th key={h} className="p-1 text-center text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCENARIOS.map((s, i) => (
              <tr key={s.id} className="border-b border-border/30">
                <td className="p-1 text-center"><span className="px-1 py-0.5 rounded text-[8px] font-bold" style={{ background: s.color + "20", color: s.color }}>{s.id}</span></td>
                <td className="text-center font-mono" style={{ color: s.color }}>{(probs[i] * 100).toFixed(2)}%</td>
                <td className="text-center text-muted-foreground">{sh[i].toFixed(1)}</td>
                <td className="text-center text-muted-foreground">${tam[i].toFixed(0)}</td>
                <td className="text-center" style={{ color: "#06B6D4" }}>${rev[i].toFixed(1)}</td>
                <td className="text-center text-muted-foreground">{mul[i]}</td>
                <td className="text-center font-bold" style={{ color: "#10B981" }}>${ex[i].toFixed(0)}</td>
                <td className="text-center text-muted-foreground">{inv[i]}%</td>
                <td className="text-center text-muted-foreground">${ic[i].toFixed(0)}</td>
                <td className="text-center font-bold" style={{ color: "#F59E0B" }}>{moic[i].toFixed(2)}</td>
                <td className="text-center font-extrabold" style={{ color: s.color }}>{pw[i].toFixed(4)}</td>
              </tr>
            ))}
            <tr className="bg-primary/5 border-t border-primary/30">
              <td colSpan={10} className="text-right p-2 font-extrabold text-primary">Σ PWMOIC</td>
              <td className="text-center font-black text-sm text-primary">{tPW.toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-border bg-card flex items-center justify-center gap-6 p-5">
        <div className="text-center">
          <div className="text-[9px] text-muted-foreground tracking-wider">FINAL PWMOIC</div>
          <div className="text-4xl font-black text-primary">{fmt(tPW, 2)}</div>
        </div>
        <div className="w-px h-12 bg-border" />
        <div className="text-center">
          <div className="text-[9px] text-muted-foreground tracking-wider">SCORE</div>
          <div className="text-2xl font-black" style={{ color: scl }}>{sc}</div>
          <div className="text-xs font-semibold" style={{ color: scl }}>{sl}</div>
        </div>
      </div>
    </div>
  );
}
