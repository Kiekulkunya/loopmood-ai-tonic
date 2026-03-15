import { useApp } from "@/contexts/AppContext";
import Toolbar from "@/components/Toolbar";

export default function PMDashboard() {
  const { logs } = useApp();

  const top = (() => {
    const c: Record<string, number> = {};
    logs.forEach((l) => { c[l.action] = (c[l.action] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  return (
    <div className="p-4 animate-fade-in">
      <Toolbar title="PM Dashboard" />
      <div className="grid grid-cols-4 gap-3 mb-3">
        {[
          { l: "Users", v: "1" },
          { l: "Actions", v: logs.length },
          { l: "Top Feature", v: top[0]?.[0] || "—" },
          { l: "System", v: "Healthy" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3">
            <div className="text-[9px] text-muted-foreground tracking-wider">{s.l}</div>
            <div className="text-lg font-black text-foreground mt-1">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-bold text-muted-foreground mb-2">Top Actions</div>
          {top.length === 0 ? (
            <p className="text-muted-foreground text-xs p-4 text-center">No data</p>
          ) : (
            top.map(([a, c], i) => (
              <div key={i} className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-foreground/80">{a}</span>
                <span className="text-xs font-bold text-primary">{c}</span>
              </div>
            ))
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-bold text-muted-foreground mb-2">System Health</div>
          {["Auth Service", "AI Provider", "Database", "Uptime 99.9%"].map((h, i) => (
            <div key={i} className="flex justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">{h}</span>
              <span className="text-xs text-accent font-semibold">● OK</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
