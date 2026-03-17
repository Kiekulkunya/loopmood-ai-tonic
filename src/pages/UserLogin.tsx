import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logActivity } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    await logActivity("login", "/login/user", { role: "user", method: "email" });
    navigate("/app/classifier");
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/app/classifier" },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <Lock className="text-primary-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Security Gateway</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Authenticating for <span className="text-primary font-bold uppercase">USER</span> privileges
          </p>
        </div>

        {error && <p className="text-destructive text-sm text-center mb-4 bg-destructive/10 p-2 rounded-xl">{error}</p>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Secure Login"}
          </button>

          <div className="flex items-center space-x-2 text-muted-foreground py-2">
            <div className="flex-grow border-t border-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Or Sign Up With</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-4 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Mail className="mr-2" size={18} /> Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/login/user/signup" className="text-primary hover:underline font-medium">Sign Up</Link>
          </p>
        </div>

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
          <p className="text-[11px] text-primary leading-relaxed text-center">
            Your data is stored in memory only for this session. It is never saved to our servers and will be cleared when you close the browser.
          </p>
        </div>
      </div>
    </div>
  );
}
