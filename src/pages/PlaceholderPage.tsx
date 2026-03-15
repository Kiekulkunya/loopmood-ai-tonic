import { useLocation } from "react-router-dom";

const PAGE_DESCRIPTIONS: Record<string, { icon: string; description: string }> = {
  "/app/decoded-x-return": {
    icon: "📈",
    description: "Risk assessment with multiplicative M×P×T×F model, stage flow visualization, and 7-scenario probability analysis.",
  },
  "/app/risk-pwmoic": {
    icon: "⚡",
    description: "Industry selection, TAM computation, market share distribution, revenue multipliers, and PWMOIC scoring engine.",
  },
  "/app/valuation": {
    icon: "🎯",
    description: "3-firm comparative evaluation with 21 weighted parameters across risk/reward, team, and market categories.",
  },
  "/app/nova-dashboard": {
    icon: "📊",
    description: "Radar charts, heatmaps, and visualizations pulling data from startup valuation analysis.",
  },
  "/app/pm/log": {
    icon: "📋",
    description: "Activity log showing recent user actions with filtering and CSV export.",
  },
  "/app/pm/traffic": {
    icon: "📈",
    description: "Daily active users, page views, and action breakdowns with interactive charts.",
  },
  "/app/pm/dashboard": {
    icon: "📊",
    description: "Overview of users, growth trends, most active users, and system health.",
  },
};

export default function PlaceholderPage() {
  const location = useLocation();
  const info = PAGE_DESCRIPTIONS[location.pathname];

  return (
    <div className="flex h-full items-center justify-center p-8 animate-fade-in">
      <div className="text-center max-w-md">
        <span className="text-5xl block mb-4">{info?.icon || "🔧"}</span>
        <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {info?.description || "This feature is under development."}
        </p>
        <div className="mt-6 inline-block rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
          Feature in development
        </div>
      </div>
    </div>
  );
}
