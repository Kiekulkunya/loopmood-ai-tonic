import { useMemo } from "react";
import Toolbar from "@/components/Toolbar";
import { useVal } from "@/contexts/ValuationContext";

const FIRM_COLORS = ["#3B82F6", "#06B6D4", "#10B981"];

const EVAL_CATEGORIES = [
  {
    section: "A", title: "Risk/Reward Strategy", items: [
      { sub: "A1", label: "Return", params: [{ name: "CAGR 3Y" }, { name: "ROI" }] },
      { sub: "A2", label: "Risk", params: [{ name: "Market Risk" }, { name: "Product Risk" }, { name: "Team Risk" }, { name: "Finance Risk" }] },
      { sub: "A3", label: "PWMOIC", params: [{ name: "PWMOIC" }, { name: "Risk Adj" }] },
    ]
  },
  {
    section: "B", title: "Visionary Team", items: [
      { sub: "B1", label: "Founder", params: [{ name: "Experience" }, { name: "Vision" }] },
      { sub: "B2", label: "Integrity", params: [{ name: "Ethics" }, { name: "Transparency" }] },
      { sub: "B3", label: "Expert Team", params: [{ name: "PhDs" }, { name: "Skills" }, { name: "Tenure" }] },
    ]
  },
  {
    section: "C", title: "Market Opportunity", items: [
      { sub: "C1", label: "Technology", params: [{ name: "Patents" }, { name: "Disruption" }, { name: "Uniqueness" }] },
      { sub: "C2", label: "Market", params: [{ name: "Mkt Size" }, { name: "TAM" }, { name: "Scalability" }] },
      { sub: "C3", label: "Impact", params: [{ name: "ESG" }, { name: "Urgency" }] },
    ]
  },
];

export default function StartupValuation() {
  const { weights, setWeights, firmScores, setFirmScores, firmNames, setFirmNames } = useVal();
  const tw = weights.reduce((a, b) => a + b, 0);
  const ok = Math.abs(tw - 100) < 0.1;

  const upSc = (fi: number, pi: number, v: number) => {
    const n = firmScores.map((f, i) => i === fi ? f.map((s, j) => j === pi ? Math.max(1, Math.min(5, v)) : s) : f);
    setFirmScores(n);
  };

  const res = firmScores.map((sc) => {
    let idx = 0, tot: Record<string, number> = {}, total = 0;
    EVAL_CATEGORIES.forEach((c) => {
      let ct = 0;
      c.items.forEach((it) => it.params.forEach(() => { ct += (sc[idx] || 1) * (weights[idx] / 100); idx++; }));
      tot[c.section] = ct;
      total += ct;
    });
    return { tot, total, std: (total / 5) * 100 };
  });

  const sectionWeights = useMemo(() => {
    let idx = 0;
    const sw: Record<string, number> = {};
    EVAL_CATEGORIES.forEach((cat) => {
      let s = 0;
      cat.items.forEach((item) => { item.params.forEach(() => { s += weights[idx]; idx++; }); });
      sw[cat.section] = s;
    });
    return sw;
  }, [weights]);

  const handleRefresh = () => {
    setWeights([10,10,5,5,5,5,7,3,5,5,5,2.5,2.5,2.5,2.5,5,5,2.5,2.5,2.5,2.5,2.5,2.5]);
    setFirmScores([[3,3,2,2,3,4,5,2,1,2,1,1,2,5,2,1,3,2,2,2,2],[2,2,2,2,2,2,2,2,5,5,5,5,5,5,4,3,2,3,2,4,4],[1,2,2,1,3,2,1,1,3,2,4,1,2,5,2,2,3,4,3,5,3]]);
    setFirmNames(["Firm A", "Firm B", "Firm C"]);
  };

  return (
    <div className="p-4 animate-fade-in">
      <Toolbar title="Startup Valuation" onRefresh={handleRefresh} />

      {!ok && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg mb-3 text-xs text-destructive font-semibold">
          ⚠ Weights = {tw.toFixed(1)}% (must = 100%)
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-3 mb-3 overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-1 text-muted-foreground w-6">#</th>
              <th className="text-left p-1 text-muted-foreground min-w-[90px]">Param</th>
              <th className="text-center p-1 text-muted-foreground w-10">Wt%</th>
              {firmNames.map((n, i) => (
                <th key={i} colSpan={2} className="text-center p-1" style={{ color: FIRM_COLORS[i] }}>
                  <input
                    value={n}
                    onChange={(e) => { const ns = [...firmNames]; ns[i] = e.target.value; setFirmNames(ns); }}
                    className="bg-transparent border-none text-center text-[9px] font-bold w-[70px] outline-none"
                    style={{ color: FIRM_COLORS[i] }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let pi = 0;
              const rows: JSX.Element[] = [];
              EVAL_CATEGORIES.forEach((cat) => {
                rows.push(
                  <tr key={`c${cat.section}`} className="bg-primary/5">
                    <td colSpan={3 + firmNames.length * 2} className="p-1.5 text-[10px] font-bold text-primary">
                      {cat.section}. {cat.title} — <span className={ok ? "text-primary" : "text-destructive"}>{sectionWeights[cat.section]?.toFixed(1)}%</span>
                    </td>
                  </tr>
                );
                cat.items.forEach((it) =>
                  it.params.forEach((p) => {
                    const idx = pi;
                    rows.push(
                      <tr key={`p${idx}`} className="border-b border-border/20">
                        <td className="p-0.5 text-muted-foreground">{idx + 1}</td>
                        <td className="p-0.5 text-foreground/80">{p.name}</td>
                        <td className="p-0.5 text-center">
                          <input
                            type="number"
                            value={weights[idx]}
                            onChange={(e) => { const n = [...weights]; n[idx] = +e.target.value || 0; setWeights(n); }}
                            className="w-9 bg-background border border-border rounded px-0.5 py-0.5 text-[9px] text-primary text-center"
                          />
                        </td>
                        {firmScores.map((sc, fi) => {
                          const v = sc[idx] || 1;
                          const w = v * (weights[idx] / 100);
                          return (
                            <td key={`s${fi}`} className="p-0.5 text-center" colSpan={1}>
                              <select
                                value={v}
                                onChange={(e) => upSc(fi, idx, +e.target.value)}
                                className="w-9 bg-background border border-border rounded px-0.5 py-0.5 text-[9px]"
                                style={{ color: FIRM_COLORS[fi] }}
                              >
                                {[1, 2, 3, 4, 5].map((x) => <option key={x} value={x}>{x}</option>)}
                              </select>
                            </td>
                          );
                        })}
                        {firmScores.map((sc, fi) => {
                          const v = sc[idx] || 1;
                          const w = v * (weights[idx] / 100);
                          return (
                            <td key={`w${fi}`} className="p-0.5 text-center text-[9px] font-semibold" style={{ color: FIRM_COLORS[fi] }}>
                              {w.toFixed(3)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                    pi++;
                  })
                );
                rows.push(
                  <tr key={`t${cat.section}`} className="bg-primary/5 border-t border-primary/20">
                    <td colSpan={2} className="text-right p-1 font-bold text-primary text-[10px]">Subtotal {cat.section}</td>
                    <td className="text-center font-semibold text-primary">{sectionWeights[cat.section]?.toFixed(1)}%</td>
                    {res.map((r, fi) => (
                      <td key={fi} colSpan={2} className="text-center font-bold text-xs" style={{ color: FIRM_COLORS[fi] }}>
                        {r.tot[cat.section]?.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                );
              });
              return rows;
            })()}
            <tr className="bg-primary/10 border-t-2 border-primary/30">
              <td colSpan={2} className="text-right p-2 font-black text-primary text-xs">TOTAL</td>
              <td className={`text-center font-bold ${ok ? "text-primary" : "text-destructive"}`}>{tw.toFixed(1)}%</td>
              {res.map((r, fi) => (
                <td key={fi} colSpan={2} className="text-center font-black text-sm" style={{ color: FIRM_COLORS[fi] }}>
                  {r.std.toFixed(1)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {res.map((r, fi) => {
          const c = FIRM_COLORS[fi];
          const g = r.std >= 80 ? "A" : r.std >= 60 ? "B" : r.std >= 40 ? "C" : "D";
          return (
            <div key={fi} className="rounded-lg border bg-card p-3 text-center" style={{ borderColor: c + "33" }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: c }}>{firmNames[fi]}</div>
              <div className="text-3xl font-black" style={{ color: c }}>{r.std.toFixed(1)}</div>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold mt-1" style={{ background: c + "15", color: c }}>
                Grade: {g}
              </span>
              <div className="w-full h-0.5 bg-border rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.std}%`, background: c }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
