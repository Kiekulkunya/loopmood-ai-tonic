import { useMemo } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useVal } from "@/contexts/ValuationContext";
import Toolbar from "@/components/Toolbar";

const FC3 = ["#3B82F6", "#06B6D4", "#10B981"];
const secCounts = [8, 7, 8];
const secNames = ["Risk/Reward", "Team", "Market"];

export default function NovaDashboard() {
  const { weights, firmScores, firmNames } = useVal();

  const sectionData = useMemo(() => {
    return secNames.map((name, si) => {
      const start = secCounts.slice(0, si).reduce((a, b) => a + b, 0);
      const d: Record<string, any> = { section: name };
      firmNames.forEach((fn, fi) => {
        let t = 0;
        for (let i = start; i < start + secCounts[si]; i++) t += (firmScores[fi][i] || 1) * (weights[i] / 100);
        d[fn] = +t.toFixed(3);
      });
      return d;
    });
  }, [weights, firmScores, firmNames]);

  const res = firmScores.map((sc) => {
    let t = 0;
    sc.forEach((s, i) => { t += (s || 1) * (weights[i] / 100); });
    return { t, std: +(t / 5 * 100).toFixed(1) };
  });

  const ranked = firmNames.map((n, i) => ({ n, std: res[i].std, c: FC3[i] })).sort((a, b) => b.std - a.std);
  const hBar = firmNames.map((n, i) => ({ name: n, score: res[i].std, fill: FC3[i] }));

  const pie = useMemo(() => {
    let idx = 0;
    return secCounts.map((cnt, si) => {
      let s = 0;
      for (let i = 0; i < cnt; i++) { s += weights[idx]; idx++; }
      return { name: secNames[si], value: +s.toFixed(1) };
    });
  }, [weights]);

  const lineData = useMemo(() => weights.map((_, pi) => {
    const pt: Record<string, any> = { idx: pi + 1 };
    firmNames.forEach((n, fi) => {
      let cum = 0;
      for (let i = 0; i <= pi; i++) cum += (firmScores[fi][i] || 1) * (weights[i] / 100);
      pt[n] = +cum.toFixed(3);
    });
    return pt;
  }), [weights, firmScores, firmNames]);

  const tooltipStyle = { backgroundColor: "hsl(220,33%,9%)", border: "1px solid hsl(215,25%,18%)", borderRadius: 8, fontSize: 10 };

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs font-bold text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );

  return (
    <div className="p-4 animate-fade-in">
      <Toolbar title="Nova Dashboard" />

      <div className="rounded-lg border border-border bg-card p-3 mb-3 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center text-2xl">🏆</div>
        <div>
          <div className="text-[10px] text-muted-foreground">Battle Winner</div>
          <div className="text-base font-black" style={{ color: ranked[0].c }}>{ranked[0].n}</div>
          <div className="text-[10px] text-muted-foreground">{ranked.map((r) => `${r.n} (${r.std})`).join(" > ")}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Firm Radar">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={sectionData}>
              <PolarGrid stroke="hsl(215,25%,18%)" />
              <PolarAngleAxis dataKey="section" tick={{ fill: "#94A3B8", fontSize: 9 }} />
              {firmNames.map((n, i) => <Radar key={n} name={n} dataKey={n} stroke={FC3[i]} fill={FC3[i]} fillOpacity={0.15} strokeWidth={2} />)}
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Category Breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectionData}>
              <XAxis dataKey="section" tick={{ fill: "#94A3B8", fontSize: 9 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              {firmNames.map((n, i) => <Bar key={n} dataKey={n} fill={FC3[i]} radius={[3, 3, 0, 0]} />)}
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Standardized Scores">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hBar} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 9 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 9 }} width={50} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>{hBar.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Weight Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pie} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: "#334155" }}>
                {pie.map((_, i) => <Cell key={i} fill={FC3[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Cumulative Score">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <XAxis dataKey="idx" tick={{ fill: "#94A3B8", fontSize: 9 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              {firmNames.map((n, i) => <Line key={n} type="monotone" dataKey={n} stroke={FC3[i]} strokeWidth={2} dot={{ r: 1.5 }} />)}
              <Legend wrapperStyle={{ fontSize: 9 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Score Heatmap">
          <div className="max-h-[220px] overflow-y-auto">
            <table className="w-full text-[9px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-0.5 text-muted-foreground">#</th>
                  {firmNames.map((n, i) => <th key={i} className="text-center p-0.5" style={{ color: FC3[i] }}>{n}</th>)}
                </tr>
              </thead>
              <tbody>
                {weights.map((_, pi) => (
                  <tr key={pi} className="border-b border-border/10">
                    <td className="p-0.5 text-muted-foreground">{pi + 1}</td>
                    {firmScores.map((sc, fi) => {
                      const v = sc[pi] || 1;
                      const bg = v === 1 ? "#7F1D1D" : v === 2 ? "#92400E" : v === 3 ? "#854D0E" : v === 4 ? "#166534" : "#047857";
                      return <td key={fi} className="text-center p-0.5 font-bold text-foreground" style={{ background: bg + "55" }}>{v}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
