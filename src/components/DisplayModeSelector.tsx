// src/components/DisplayModeSelector.tsx
// Paste into Lovable

import { useState } from "react";
import { useDisplay, type DisplayMode } from "@/contexts/DisplayContext";

const OPTIONS: { id: DisplayMode; emoji: string; label: string; sub: string }[] = [
  { id: "desktop-wide", emoji: "🖥️", label: "Wide Screen", sub: "Full width · Sidebar visible" },
  { id: "desktop", emoji: "💻", label: "Desktop", sub: "1280px · Standard layout" },
  { id: "tablet", emoji: "📱", label: "Tablet", sub: "768px · No sidebar" },
  { id: "mobile", emoji: "📲", label: "Mobile", sub: "390px · Compact mode" },
];

export default function DisplayModeSelector() {
  const { mode, setMode } = useDisplay();
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.id === mode)!;

  return (
    <div
      className="fixed top-3 left-3 z-[100]"
      onMouseLeave={() => setOpen(false)}
    >
      {open ? (
        /* ─── Expanded Picker ─── */
        <div
          className="bg-[#111827]/95 backdrop-blur-md border border-[#1E293B] rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)" }}
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-[#1E293B] bg-[#0F172A]/60">
            <span className="text-[9px] text-slate-500 font-bold tracking-[2px] uppercase">
              Display Mode
            </span>
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            {OPTIONS.map((opt) => {
              const active = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => { setMode(opt.id); setOpen(false); }}
                  className="w-full flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: active ? "rgba(59,130,246,0.12)" : "transparent",
                    boxShadow: active ? "inset 0 0 0 1px rgba(59,130,246,0.25)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)");
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget.style.backgroundColor = "transparent");
                  }}
                >
                  {/* Emoji with glow when active */}
                  <span
                    className="text-2xl transition-all duration-300"
                    style={{
                      filter: active
                        ? "drop-shadow(0 0 8px rgba(59,130,246,0.6)) drop-shadow(0 0 20px rgba(59,130,246,0.3))"
                        : "grayscale(0.6) opacity(0.5)",
                      transform: active ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {opt.emoji}
                  </span>

                  {/* Label */}
                  <div className="flex-1 text-left">
                    <div
                      className="text-xs font-bold transition-colors duration-200"
                      style={{ color: active ? "#60A5FA" : "#94A3B8" }}
                    >
                      {opt.label}
                    </div>
                    <div className="text-[8px] text-slate-600 mt-0.5">
                      {opt.sub}
                    </div>
                  </div>

                  {/* Active indicator */}
                  {active && (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full bg-blue-500"
                        style={{ boxShadow: "0 0 8px rgba(59,130,246,0.6)" }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-[#1E293B] bg-[#0F172A]/40">
            <p className="text-[7px] text-slate-600 text-center">
              Layout adjusts in real-time · Sidebar hides on Tablet & Mobile
            </p>
          </div>
        </div>
      ) : (
        /* ─── Collapsed Button ─── */
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setOpen(true)}
          className="group flex items-center gap-2 bg-[#111827]/90 backdrop-blur-sm border border-[#1E293B] rounded-full pl-2.5 pr-3.5 py-2 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:bg-[#111827]"
        >
          <span
            className="text-lg transition-all duration-300 group-hover:scale-115"
            style={{
              filter: "drop-shadow(0 0 6px rgba(59,130,246,0.4))",
            }}
          >
            {current.emoji}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-400 transition-colors duration-200">
            {current.label}
          </span>
        </button>
      )}
    </div>
  );
}
