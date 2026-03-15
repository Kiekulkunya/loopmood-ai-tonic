import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FlaskConical,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  ClipboardList,
  Activity,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ChatbotFAB } from "@/components/Chatbot";
import ToastContainer from "@/components/ToastContainer";
import { useApp } from "@/contexts/AppContext";

const USER_NAV = [
  { label: "Startup Classifier", icon: FlaskConical, path: "/app/classifier" },
  { label: "Decoded X Return", icon: TrendingUp, path: "/app/decoded-x-return" },
  { label: "Unleashing Risk & PWMOIC", icon: Zap, path: "/app/risk-pwmoic" },
  { label: "Valuation Simulator", icon: Target, path: "/app/valuation" },
  { label: "Nova Dashboard", icon: BarChart3, path: "/app/nova-dashboard" },
];

const PM_NAV = [
  { label: "Activity Log", icon: ClipboardList, path: "/app/pm/log" },
  { label: "Traffic Analytics", icon: Activity, path: "/app/pm/traffic" },
  { label: "PM Dashboard", icon: LayoutDashboard, path: "/app/pm/dashboard" },
];

const PAGE_TITLES: Record<string, string> = {
  "/app/classifier": "Startup Classifier",
  "/app/decoded-x-return": "Decoded X Return",
  "/app/risk-pwmoic": "Unleashing Risk & PWMOIC",
  "/app/valuation": "Startup Valuation",
  "/app/nova-dashboard": "Nova Dashboard",
  "/app/pm/log": "Activity Log",
  "/app/pm/traffic": "Traffic Analytics",
  "/app/pm/dashboard": "PM Dashboard",
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [session, setSession] = useState<"user" | "pm">("user");
  const location = useLocation();
  const navigate = useNavigate();
  const { provider, logAct } = useApp();

  const navItems = session === "user" ? USER_NAV : PM_NAV;
  const pageTitle = PAGE_TITLES[location.pathname] || "LoopAI";

  useEffect(() => {
    logAct("page_view", location.pathname);
  }, [location.pathname, logAct]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border bg-sidebar transition-all duration-200 ${
          collapsed ? "w-14" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          {!collapsed && (
            <div>
              <div className="text-lg font-bold text-foreground tracking-wide">LoopAI</div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Startup Analytics
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Session Tabs */}
        {!collapsed && (
          <div className="flex gap-1 p-2">
            <button
              onClick={() => { setSession("user"); navigate("/app/classifier"); }}
              className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                session === "user"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              User
            </button>
            <button
              onClick={() => { setSession("pm"); navigate("/app/pm/log"); }}
              className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                session === "pm"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Product Manager
            </button>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border-l-2 border-transparent"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2 space-y-0.5">
          <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Settings size={16} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-2.5">
          <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              provider === "mock"
                ? "bg-warning/15 text-warning"
                : "bg-accent/15 text-accent"
            }`}>
              {provider === "mock" ? "Mock Mode" : `AI: ${provider}`}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-2 text-center text-[10px] text-muted-foreground">
          LoopAI for TECH 41 Stanford · Educational Purpose Only · © 2025
        </footer>
      </div>

      {/* Chatbot FAB */}
      <ChatbotFAB />
      <ToastContainer />
    </div>
  );
}
