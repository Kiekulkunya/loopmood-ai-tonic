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

type RiskState = { market: number; product: number; team: number; finance: number };

function RiskCard({ title, risk, setRisk, accentColor }: { title: string; risk: RiskState; setRisk: (r: RiskState) => void; accentColor: string }) {
  const [modes, setModes] = useState<Record<string, string>>({ market: "dd", product: "dd", team: "dd", finance: "dd" });
  const s = (risk.market / 100) * (risk.product / 100) * (risk.team / 100) * (risk.finance / 100);

  return (
    <div className="rounded-lg border border-border bg-card p-3" style={{ borderColor: accentColor + "33" }}>
      <div className="text-xs font-bold mb-2" style={{ color: accentColor }}>{title}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {(["market", "product", "team", "finance"] as const).map((k) => (
          <div key={k}>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] text-muted-foreground capitalize">{k}</span>
              <button
                onClick={() => setModes((p) => ({ ...p, [k]: p[k] === "dd" ? "in" : "dd" }))}
                className="text-[8px] text-muted-foreground hover:text-foreground"
              >
                {modes[k] === "dd" ? "✏️" : "▼"}
              </button>
            </div>
            {modes[k] === "dd" ? (
              <select
                value={risk[k]}
                onChange={(e) => setRisk({ ...risk, [k]: +e.target.value })}
                className="w-full bg-background border border-border rounded px-1.5 py-1 text-xs text-foreground"
              >
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
                  <option key={v} value={v}>{v}%</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={risk[k]}
                min={0}
                max={100}
                onChange={(e) => setRisk({ ...risk, [k]: Math.min(100, Math.max(0, +e.target.value)) })}
                className="w-full bg-background border border-border rounded px-1.5 py-1 text-xs text-foreground text-center"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 text-center py-1 rounded" style={{ background: accentColor + "10" }}>
        <span className="text-[9px] text-muted-foreground">M×P×T×F = </span>
        <span className="text-sm font-extrabold" style={{ color: accentColor }}>{(s * 100).toFixed(2)}%</span>
      </div>
    </div>
  );
}

export default function DecodedXReturn() {
  const [rC, sRC] = useState<RiskState>({ market: 40, product: 70, team: 90, finance: 40 });
  const [rE, sRE] = useState<RiskState>({ market: 100, product: 90, team: 85, finance: 80 });
  const [rM, sRM] = useState<RiskState>({ market: 60, product: 90, team: 80, finance: 80 });

  const cS = (rC.market / 100) * (rC.product / 100) * (rC.team / 100) * (rC.finance / 100);
  const eS = (rE.market / 100) * (rE.product / 100) * (rE.team / 100) * (rE.finance / 100);
  const mS = (rM.market / 100) * (rM.product / 100) * (rM.team / 100) * (rM.finance / 100);

  const probs = useMemo(() => {
    const es = cS * eS, ef = cS * (1 - eS), ms = es * mS, mf = es * (1 - mS);
    return [ms * 0.2, ms * 0.3, ms * 0.5, mf * 0.3, mf * 0.7, ef, 1 - cS];
  }, [cS, eS, mS]);

  const tS = probs.slice(0, 5).reduce((a, b) => a + b, 0);
  const tF = probs.slice(5).reduce((a, b) => a + b, 0);

  return (
    <div className="p-4 animate-fade-in">
      <Toolbar title="Decoded X Return" onRefresh={() => { sRC({ market: 40, product: 70, team: 90, finance: 40 }); sRE({ market: 100, product: 90, team: 85, finance: 80 }); sRM({ market: 60, product: 90, team: 80, finance: 80 }); }} />

      <div className="rounded-lg border border-border bg-card p-4 mb-3">
        <div className="text-xs font-bold text-foreground mb-1">Risk Assessment (M × P × T × F)</div>
        <p className="text-[10px] text-muted-foreground mb-3">Success = Market × Product × Team × Finance. Click ✏️ for custom input.</p>
        <div className="grid grid-cols-3 gap-2.5">
          <RiskCard title="Startups Creation" risk={rC} setRisk={sRC} accentColor="#F97316" />
          <RiskCard title="Early Stage" risk={rE} setRisk={sRE} accentColor="#06B6D4" />
          <RiskCard title="Mass Market" risk={rM} setRisk={sRM} accentColor="#10B981" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 mb-3">
        <div className="text-xs font-bold text-foreground mb-2.5">Stage Flow</div>
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          {[
            { l: "CREATION", v: cS, c: "#F97316" },
            { l: "EARLY STAGE", v: eS, c: "#06B6D4" },
            { l: "MASS MARKET", v: mS, c: "#10B981" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              {i > 0 && <span className="text-lg font-extrabold text-muted-foreground/30">→</span>}
              <div className="text-center p-2.5 rounded-lg border" style={{ borderColor: s.c + "33", background: s.c + "08" }}>
                <div className="text-[8px] font-bold tracking-wider" style={{ color: s.c }}>{s.l}</div>
                <div className="text-lg font-black text-foreground">{(s.v * 100).toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-bold text-foreground mb-2">Scenario Probabilities</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-1.5 text-muted-foreground font-medium">ID</th>
                <th className="text-left p-1.5 text-muted-foreground font-medium">Name</th>
                <th className="text-right p-1.5 text-muted-foreground font-medium">Prob</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((s, i) => (
                <tr key={s.id} className="border-b border-border/30">
                  <td className="p-1.5">
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold" style={{ background: s.color + "20", color: s.color }}>{s.id}</span>
                  </td>
                  <td className="p-1.5 text-foreground/80">{s.name}</td>
                  <td className="p-1.5 text-right font-bold font-mono text-foreground">{(probs[i] * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border bg-card p-3" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
            <div className="text-xs font-bold text-accent mb-1">SUCCESS (S7→S3)</div>
            <div className="text-3xl font-black text-accent">{(tS * 100).toFixed(2)}%</div>
            <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(tS * 500, 100)}%` }} />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
            <div className="text-xs font-bold text-destructive mb-1">FAILURE (S2→S1)</div>
            <div className="text-3xl font-black text-destructive">{(tF * 100).toFixed(2)}%</div>
            <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-destructive rounded-full" style={{ width: `${Math.min(tF * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
