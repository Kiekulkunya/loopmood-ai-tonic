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
  Workflow,
  Mail,
  Lock,
  MessageSquare,
} from "lucide-react";
import { ChatbotFAB } from "@/components/Chatbot";
import ToastContainer from "@/components/ToastContainer";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplay } from "@/contexts/DisplayContext";
import DisplayModeSelector from "./DisplayModeSelector";
import MobileNav from "./MobileNav";

const USER_NAV = [
  { label: "Startup Classifier", icon: FlaskConical, path: "/app/classifier" },
  { label: "Decoded X Return", icon: TrendingUp, path: "/app/decoded-x-return" },
  { label: "Unleashing Risk & PWMOIC", icon: Zap, path: "/app/risk-pwmoic" },
  { label: "Valuation Simulator", icon: Target, path: "/app/valuation" },
  { label: "Nova Dashboard", icon: BarChart3, path: "/app/nova-dashboard" },
  { label: "Customer Feedback", icon: MessageSquare, path: "/app/feedback" },
];

const PM_NAV = [
  { label: "Activity Log", icon: ClipboardList, path: "/app/pm/log" },
  { label: "Traffic Analytics", icon: Activity, path: "/app/pm/traffic" },
  { label: "PM Dashboard", icon: LayoutDashboard, path: "/app/pm/dashboard" },
  { label: "LoopAI Architecture", icon: Workflow, path: "/app/pm/architecture" },
  { label: "Email Reports", icon: Mail, path: "/app/pm/email" },
];

const PAGE_TITLES: Record<string, string> = {
  "/app/classifier": "Startup Classifier",
  "/app/decoded-x-return": "Decoded X Return",
  "/app/risk-pwmoic": "Unleashing Risk & PWMOIC",
  "/app/valuation": "Valuation Simulator",
  "/app/nova-dashboard": "Nova Dashboard",
  "/app/feedback": "Customer Feedback",
  "/app/pm/log": "Activity Log",
  "/app/pm/traffic": "Traffic Analytics",
  "/app/pm/dashboard": "PM Dashboard",
  "/app/pm/architecture": "LoopAI Architecture",
  "/app/pm/email": "Email Report Automation",
};

// Map MobileNav page IDs to routes
const PAGE_ID_TO_PATH: Record<string, string> = {
  classifier: "/app/classifier",
  decoded: "/app/decoded-x-return",
  risk: "/app/risk-pwmoic",
  valuation: "/app/valuation",
  nova: "/app/nova-dashboard",
  feedback: "/app/feedback",
  pmlog: "/app/pm/log",
  pmtraffic: "/app/pm/traffic",
  pmdash: "/app/pm/dashboard",
  pmarch: "/app/pm/architecture",
  pmemail: "/app/pm/email",
};

const PATH_TO_PAGE_ID: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_ID_TO_PATH).map(([k, v]) => [v, k])
);

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [session, setSession] = useState<"user" | "pm">("user");
  const location = useLocation();
  const navigate = useNavigate();
  const { provider, logAct, addToast } = useApp();
  const { user, isPM, role, signOut } = useAuth();
  const { containerWidth, sidebarVisible, compactMode, fontSize } = useDisplay();

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";
  const userName = user?.user_metadata?.full_name || user?.email || "User";
  const navItems = session === "user" ? USER_NAV : PM_NAV;
  const pageTitle = PAGE_TITLES[location.pathname] || "LoopAI";
  const currentPageId = PATH_TO_PAGE_ID[location.pathname] || "classifier";

  useEffect(() => {
    logAct("page_view", location.pathname);
  }, [location.pathname, logAct]);

  const handlePMClick = () => {
    if (!isPM) {
      addToast("Access denied: Product Manager privileges required");
      return;
    }
    setSession("pm");
    navigate("/app/pm/log");
  };

  const handleMobileNavigate = (pageId: string) => {
    const path = PAGE_ID_TO_PATH[pageId];
    if (path) navigate(path);
  };

  const handleSessionChange = (tab: "user" | "pm") => {
    if (tab === "pm" && !isPM) {
      addToast("Access denied: Product Manager privileges required");
      return;
    }
    setSession(tab);
    if (tab === "user") navigate("/app/classifier");
    else navigate("/app/pm/log");
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div
        className="flex min-h-screen w-full transition-all duration-500 ease-in-out relative"
        style={{ maxWidth: containerWidth }}
      >
        {/* Display Mode Selector */}
        <DisplayModeSelector />

        {/* Sidebar — desktop only */}
        {sidebarVisible && (
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
                  onClick={handlePMClick}
                  className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors relative ${
                    session === "pm"
                      ? "bg-primary text-primary-foreground"
                      : !isPM
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                  disabled={!isPM}
                >
                  {!isPM && <Lock size={10} className="inline mr-1 mb-0.5" />}
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

            {/* Bottom — User info + Sign Out */}
            <div className="border-t border-border p-2 space-y-1">
              {!collapsed && (
                <div className="flex items-center gap-2.5 px-2.5 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">{userName}</div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      isPM ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
                    }`}>
                      {isPM ? "PM" : "USER"}
                    </span>
                  </div>
                </div>
              )}
              <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Settings size={16} className="shrink-0" />
                {!collapsed && <span>Settings</span>}
              </button>
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
              >
                <LogOut size={16} className="shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className={`flex flex-1 flex-col overflow-hidden min-w-0 ${compactMode ? "pb-16" : ""} ${fontSize}`}>
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-2.5 shrink-0">
            <div className={sidebarVisible ? "" : "pl-20"}>
              <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                provider === "mock"
                  ? "bg-warning/15 text-warning"
                  : "bg-accent/15 text-accent"
              }`}>
                {provider === "mock" ? "Mock Mode" : `AI: ${provider}`}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                isPM ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {isPM ? "PM Access" : "User Access"}
              </span>
            </div>
          </header>

          {/* Content */}
          <main className={`flex-1 overflow-y-auto ${compactMode ? "p-3" : ""}`}>
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-border py-2 text-center text-[10px] text-muted-foreground">
            LoopAI for TECH 41 Stanford · Educational Purpose Only · @ 2026
          </footer>
        </div>

        {/* Mobile bottom nav — tablet/mobile only */}
        {!sidebarVisible && (
          <MobileNav
            currentPage={currentPageId}
            onNavigate={handleMobileNavigate}
            sessionTab={session}
            onSessionChange={handleSessionChange}
            onLogout={async () => { await signOut(); navigate("/login"); }}
            onSettings={() => {}}
            userName={userName}
          />
        )}

        {/* Chatbot FAB */}
        <div className={compactMode ? "mb-16" : ""}>
          <ChatbotFAB />
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}
