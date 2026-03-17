import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import PinModal from "@/components/PinModal";

export default function PMLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setPmPinValidated, logActivity } = useAuth();
  const pinExpired = (location.state as any)?.pinExpired;

  const validateAndLogin = async (method: "email" | "google") => {
    // Quick PIN check from the inline field
    if (pin !== "1234") {
      setPendingAction(method);
      setShowPinModal(true);
      return;
    }
    await proceedLogin(method);
  };

  const proceedLogin = async (method: "email" | "google") => {
    setPmPinValidated(true);
    if (method === "google") {
      sessionStorage.setItem("pm_pending", "true");
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/app/pm/log",
      });
      return;
    }
    // Email login
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    // Update role to pm
    await supabase.auth.updateUser({ data: { role: "pm" } });
    await logActivity("login", "/login/pm", { role: "pm", method: "email" });
    navigate("/app/pm/log");
  };

  const handlePinVerified = () => {
    setShowPinModal(false);
    setPin("1234");
    if (pendingAction) proceedLogin(pendingAction);
  };

  const handleLogin = () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError("");
    validateAndLogin("email");
  };

  const handleGoogle = () => {
    validateAndLogin("google");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-accent/20">
            <Lock className="text-accent-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Security Gateway</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Authenticating for <span className="text-accent font-bold uppercase">PM</span> privileges
          </p>
        </div>

        {pinExpired && (
          <p className="text-warning text-sm text-center mb-4 bg-warning/10 p-2 rounded-xl">
            PM session expired. Please re-enter your Security PIN.
          </p>
        )}
        {error && <p className="text-destructive text-sm text-center mb-4 bg-destructive/10 p-2 rounded-xl">{error}</p>}

        <div className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Security PIN (4 digits)" maxLength={4} className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all tracking-[0.5em] text-center" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />

          <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-2xl transition-all shadow-lg shadow-accent/10 flex items-center justify-center disabled:opacity-50">
            {loading ? "Authenticating..." : "Secure Login"}
          </button>

          <div className="flex items-center space-x-2 text-muted-foreground py-2">
            <div className="flex-grow border-t border-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Or Sign Up With</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="w-full py-4 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50">
            <Mail className="mr-2" size={18} /> Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account? <Link to="/login/pm/signup" className="text-accent hover:underline font-medium">Sign Up</Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-accent/5 border border-accent/10 rounded-2xl">
          <p className="text-[11px] text-accent leading-relaxed text-center">
            PM access requires a Security PIN each session. Your PIN is validated in-memory and never stored on our servers.
          </p>
        </div>
      </div>

      <PinModal open={showPinModal} onVerify={handlePinVerified} onCancel={() => { setShowPinModal(false); navigate("/login"); }} />
    </div>
  );
}
