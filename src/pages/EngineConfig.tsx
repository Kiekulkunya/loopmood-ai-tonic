import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ChevronDown, Zap, Activity, Cpu } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", icon: <Zap className="text-accent" size={16} /> },
  { id: "gemini", name: "Google Gemini", icon: <Cpu className="text-primary" size={16} /> },
  { id: "claude", name: "Anthropic Claude", icon: <Cpu className="text-warning" size={16} /> },
  { id: "mock", name: "Mock Demo (No API Key)", icon: <Activity className="text-muted-foreground" size={16} /> },
];

export default function EngineConfig() {
  const [provider, setProviderLocal] = useState("mock");
  const [key, setKey] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setProvider, setApiKey, addToast } = useApp();
  const role = (location.state as any)?.role || "user";

  const handleComplete = () => {
    setProvider(provider);
    setApiKey(key);
    addToast(provider === "mock" ? "Mock Mode activated" : `AI: ${provider} configured`);
    navigate("/app/classifier");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mb-6 border border-accent/30">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center">Engine Configuration</h2>
          <p className="text-muted-foreground text-sm mt-2 text-center">Choose your analytical intelligence provider</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Provider</label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProviderLocal(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground appearance-none focus:ring-2 focus:ring-accent outline-none"
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
            </div>
          </div>

          {provider !== "mock" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Integration Key</label>
              <input
                type="password"
                placeholder="sk-..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
          )}

          {provider === "mock" && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl text-sm text-warning">
              Mock Mode: keyword-based analysis, no API needed.
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={provider !== "mock" && !key}
            className="w-full py-4 bg-accent hover:bg-accent/90 disabled:opacity-50 text-accent-foreground font-bold rounded-2xl transition-all shadow-lg shadow-accent/10"
          >
            {provider === "mock" ? "Activate Mock Intelligence" : "Sync AI Engine"}
          </button>
        </div>
      </div>
    </div>
  );
}
