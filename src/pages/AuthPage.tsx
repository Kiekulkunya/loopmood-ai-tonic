import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state as any)?.role || "user";

  const handleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/engine", { state: { role, email: email || "user@stanford.edu" } });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <Lock className="text-primary-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Security Gateway</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Authenticating for <span className="text-primary font-bold uppercase">{role}</span> privileges
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Gmail Address"
            className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Security Pin"
            className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center"
          >
            {loading ? "Establishing Session..." : "Secure Login"}
          </button>

          <div className="flex items-center space-x-2 text-muted-foreground py-2">
            <div className="flex-grow border-t border-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Biometric Backup</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <button
            onClick={handleAuth}
            className="w-full py-4 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all"
          >
            <Mail className="mr-2" size={18} /> Continue with Google
          </button>
        </div>

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <p className="text-[11px] text-primary leading-relaxed text-center">
            Your credentials will be stored in encrypted memory for automatic access during your next session.
          </p>
        </div>
      </div>
    </div>
  );
}
