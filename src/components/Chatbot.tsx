import { useState, useRef, useEffect } from "react";
import { useDisplay } from "@/contexts/DisplayContext";

interface Message {
  role: "user" | "ai";
  text: string;
}

const respond = (text: string) => {
  const l = text.toLowerCase();
  if (l.includes("pwmoic")) return "PWMOIC = Σ(Probability × MOIC)\n\nScoring:\n5 (Excellent) ≥ 4x\n4 (Good) 3–3.9x\n3 (Fair) 2–2.9x\n2 (Low) 1–1.9x\n1 (Poor) < 1x";
  if (l.includes("risk")) return "Risk Framework: Success = M × P × T × F\n\nEach factor (Market, Product, Team, Finance) scored 0–100%. Multiplicative across 3 stages:\nCreation → Early Stage → Mass Market";
  if (l.includes("stage") || l.includes("scenario")) return "7 Scenarios:\nS7: Market Leader (best)\nS6: Challenger\nS5: Laggard\nS4: Early Adoption\nS3: Innovator\nS2: White Paper Only\nS1: Initial Idea (worst)\n\nS7–S3 = Success, S2–S1 = Failure";
  if (l.includes("valuation") || l.includes("firm")) return "Valuation scores 3 firms across:\nA. Risk/Reward (50%)\nB. Team (25%)\nC. Market (25%)\n\nEach param scored 1–5, weighted. Standardized to 100 points.";
  if (l.includes("classifier") || l.includes("classify")) return "The Startup Classifier analyzes text, URLs, or documents to determine the most likely stage of a startup:\n• Pre-Seed / Seed\n• Early Stage (Series A)\n• Scaling (Series B/C)\n• Expansion (Series D+)\n• Maturity";
  if (l.includes("hello") || l.includes("hi")) return "Hello! I'm LoopAI Assistant. Ask me about PWMOIC, risk framework, startup stages, valuation methodology, or the classifier.";
  return "Try asking about: PWMOIC, risk framework, startup stages, or valuation methodology.";
};

export function ChatbotFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground border-none cursor-pointer flex items-center justify-center text-lg shadow-lg shadow-primary/30 z-50 hover:scale-105 transition-transform"
      >
        💬
      </button>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Message[]>([
    { role: "ai", text: "👋 Welcome to LoopAI! Ask about:\n• PWMOIC analysis\n• Risk framework\n• Startup stages\n• Valuation" },
  ]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    if (!inp.trim()) return;
    setMsgs((p) => [...p, { role: "user", text: inp.trim() }]);
    const input = inp;
    setInp("");
    setLoading(true);
    setTimeout(() => {
      setMsgs((p) => [...p, { role: "ai", text: respond(input) }]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed bottom-16 right-4 w-[350px] h-[460px] bg-card border border-border rounded-xl flex flex-col z-50 shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-extrabold text-primary">AI</div>
          <span className="text-sm font-semibold text-foreground">Ask LoopAI</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-foreground rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex">
            <div className="bg-secondary px-4 py-2 rounded-xl rounded-bl-sm">
              <span className="text-xs text-muted-foreground">typing...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-1 px-2.5 overflow-x-auto py-1">
        {["PWMOIC", "Risk", "Stages", "Valuation"].map((c) => (
          <button
            key={c}
            onClick={() => setInp(c)}
            className="px-2 py-0.5 text-[9px] rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 px-2.5 py-2 border-t border-border">
        <input
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
          placeholder="Ask anything..."
          className="flex-1 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={send} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold">→</button>
      </div>
    </div>
  );
}
