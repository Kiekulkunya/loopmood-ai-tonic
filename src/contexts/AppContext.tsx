import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface LogEntry {
  id: string;
  action: string;
  page: string;
  time: string;
}

interface AppContextType {
  provider: string;
  setProvider: (p: string) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  logs: LogEntry[];
  logAct: (action: string, page: string) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  addToast: (msg: string) => void;
  toasts: { id: number; msg: string }[];
}

const AppCtx = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState("mock");
  const [apiKey, setApiKey] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const addToast = useCallback((msg: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  const logAct = useCallback((action: string, page: string) => {
    setLogs((p) =>
      [{ id: crypto.randomUUID(), action, page, time: new Date().toISOString() }, ...p].slice(0, 300)
    );
  }, []);

  return (
    <AppCtx.Provider value={{ provider, setProvider, apiKey, setApiKey, logs, logAct, chatOpen, setChatOpen, addToast, toasts }}>
      {children}
    </AppCtx.Provider>
  );
}
