import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useApp } from "@/contexts/AppContext";
import Toolbar from "@/components/Toolbar";

export default function PMTraffic() {
  const { logs } = useApp();

  const pv = useMemo(() => {
    const c: Record<string, number> = {};
    logs.forEach((l) => { c[l.page] = (c[l.page] || 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [logs]);

  return (
    <div className="p-4 animate-fade-in">
      <Toolbar title="Traffic Analytics" />
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[
          { l: "Total Actions", v: logs.length },
          { l: "Page Views", v: pv.reduce((a, b) => a + b.value, 0) },
          { l: "Status", v: "Active" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3">
            <div className="text-[9px] text-muted-foreground tracking-wider">{s.l}</div>
            <div className="text-xl font-black text-foreground mt-1">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-xs font-bold text-muted-foreground mb-2">Page Views</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={pv}>
            <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 9 }} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 9 }} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(220,33%,9%)", border: "1px solid hsl(215,25%,18%)", borderRadius: 8, fontSize: 10 }} />
            <Bar dataKey="value" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
