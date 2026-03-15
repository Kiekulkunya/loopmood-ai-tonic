import { useApp } from "@/contexts/AppContext";
import Toolbar from "@/components/Toolbar";

export default function PMLog() {
  const { logs } = useApp();

  return (
    <div className="p-4 animate-fade-in">
      <Toolbar title="Activity Log" />
      <div className="rounded-lg border border-border bg-card p-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-1.5 text-muted-foreground font-medium">Time</th>
              <th className="text-left p-1.5 text-muted-foreground font-medium">Action</th>
              <th className="text-left p-1.5 text-muted-foreground font-medium">Page</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-8 text-muted-foreground">No activity yet. Navigate the app to generate logs.</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="border-b border-border/30">
                  <td className="p-1.5 text-muted-foreground font-mono text-[10px]">{new Date(l.time).toLocaleString()}</td>
                  <td className="p-1.5"><span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-semibold">{l.action}</span></td>
                  <td className="p-1.5 text-foreground/70">{l.page}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-right text-[10px] text-muted-foreground mt-1">{logs.length} entries</div>
    </div>
  );
}
