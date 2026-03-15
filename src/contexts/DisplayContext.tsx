// src/contexts/DisplayContext.tsx
// Paste into Lovable

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type DisplayMode = "desktop-wide" | "desktop" | "tablet" | "mobile";

interface DisplayState {
  mode: DisplayMode;
  setMode: (m: DisplayMode) => void;
  containerWidth: string;
  sidebarVisible: boolean;
  compactMode: boolean;
  fontSize: string;
}

const CONFIG: Record<DisplayMode, { width: string; sidebar: boolean; compact: boolean; font: string }> = {
  "desktop-wide": { width: "100%", sidebar: true, compact: false, font: "text-sm" },
  "desktop": { width: "1280px", sidebar: true, compact: false, font: "text-sm" },
  "tablet": { width: "768px", sidebar: false, compact: false, font: "text-xs" },
  "mobile": { width: "390px", sidebar: false, compact: true, font: "text-xs" },
};

const DisplayContext = createContext<DisplayState | undefined>(undefined);

export function DisplayProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DisplayMode>(() => {
    try { return (sessionStorage.getItem("loopai-display") as DisplayMode) || "desktop"; }
    catch { return "desktop"; }
  });

  useEffect(() => {
    try { sessionStorage.setItem("loopai-display", mode); } catch {}
  }, [mode]);

  const c = CONFIG[mode];

  return (
    <DisplayContext.Provider value={{
      mode, setMode,
      containerWidth: c.width,
      sidebarVisible: c.sidebar,
      compactMode: c.compact,
      fontSize: c.font,
    }}>
      {children}
    </DisplayContext.Provider>
  );
}

export function useDisplay() {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplay must be inside DisplayProvider");
  return ctx;
}
