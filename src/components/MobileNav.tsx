// src/components/MobileNav.tsx
// Bottom navigation for tablet/mobile display modes
// Paste into Lovable

import { useState } from "react";
import {
  FlaskConical, TrendingUp, Zap, Target, BarChart3,
  ClipboardList, Activity, LayoutDashboard, Workflow, Mail,
  Menu, X, LogOut, Settings, User,
} from "lucide-react";

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  sessionTab: "user" | "pm";
  onSessionChange: (tab: "user" | "pm") => void;
  onLogout: () => void;
  onSettings: () => void;
  userName: string;
}

const USER_NAV = [
  { id: "classifier", icon: FlaskConical, label: "Classify" },
  { id: "decoded", icon: TrendingUp, label: "Decoded X" },
  { id: "risk", icon: Zap, label: "PWMOIC" },
  { id: "valuation", icon: Target, label: "Valuation" },
  { id: "nova", icon: BarChart3, label: "Nova" },
];

const PM_NAV = [
  { id: "pmlog", icon: ClipboardList, label: "Log" },
  { id: "pmtraffic", icon: Activity, label: "Traffic" },
  { id: "pmdash", icon: LayoutDashboard, label: "PM Dash" },
  { id: "pmarch", icon: Workflow, label: "Arch" },
  { id: "pmemail", icon: Mail, label: "Email" },
];

export default function MobileNav({
  currentPage, onNavigate, sessionTab, onSessionChange, onLogout, onSettings, userName,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = sessionTab === "user" ? USER_NAV : PM_NAV;

  return (
    <>
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] bg-[#0F172A]/95 backdrop-blur-md border-t border-[#1E293B]"
        style={{ maxWidth: "inherit", margin: "0 auto" }}
      >
        <div className="flex items-center justify-around py-1.5 px-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all"
                style={{
                  backgroundColor: active ? "rgba(59,130,246,0.1)" : "transparent",
                }}
              >
                <Icon
                  className="w-4 h-4 transition-colors"
                  style={{ color: active ? "#3B82F6" : "#475569" }}
                />
                <span
                  className="text-[8px] font-semibold transition-colors"
                  style={{ color: active ? "#3B82F6" : "#475569" }}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-0.5"
                    style={{ boxShadow: "0 0 4px rgba(59,130,246,0.6)" }}
                  />
                )}
              </button>
            );
          })}

          {/* Hamburger menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2"
          >
            <Menu className="w-4 h-4 text-slate-500" />
            <span className="text-[8px] text-slate-500 font-semibold">More</span>
          </button>
        </div>
      </div>

      {/* Slide-up menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[95]" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#111827] border-t border-[#1E293B] rounded-t-2xl overflow-hidden"
            style={{ maxWidth: "inherit", margin: "0 auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-[#334155]" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1E293B]">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{userName}</div>
                <div className="text-[9px] text-slate-500">LoopAI User</div>
              </div>
            </div>

            {/* Session toggle */}
            <div className="flex gap-2 px-5 py-3">
              {(["user", "pm"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { onSessionChange(t); setMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    sessionTab === t
                      ? "bg-blue-600/15 text-blue-400 border border-blue-600/30"
                      : "text-slate-500 border border-[#1E293B]"
                  }`}
                >
                  {t === "user" ? "User Tools" : "Product Mgr"}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="px-5 py-2 space-y-1">
              <button
                onClick={() => { onSettings(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 py-3 px-3 rounded-lg text-xs text-slate-400 hover:bg-white/[0.03] transition-colors"
              >
                <Settings className="w-4 h-4" /> API Settings
              </button>
              <button
                onClick={() => { onLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 py-3 px-3 rounded-lg text-xs text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            {/* Close */}
            <div className="px-5 py-3 border-t border-[#1E293B]">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#1E293B] text-xs text-slate-400 font-semibold text-center hover:bg-[#334155] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
