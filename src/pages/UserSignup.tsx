import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export default function UserSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) { setError("Please fill in all fields"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role: "user" }, emailRedirectTo: window.location.origin + "/app/classifier" },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app/classifier",
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl shadow-accent/20">
            <Mail className="text-accent-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
          <p className="text-muted-foreground text-sm">We've sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.</p>
          <button onClick={() => navigate("/login/user")} className="mt-6 text-primary hover:underline text-sm font-medium">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <button onClick={() => navigate("/login")} className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <UserPlus className="text-primary-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Create User Account</h2>
        </div>

        {error && <p className="text-destructive text-sm text-center mb-4 bg-destructive/10 p-2 rounded-xl">{error}</p>}

        <div className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email Address" className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm Password" className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button onClick={handleSignup} disabled={loading} className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/10 disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="flex items-center space-x-2 text-muted-foreground py-2">
            <div className="flex-grow border-t border-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="w-full py-4 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50">
            <Mail className="mr-2" size={18} /> Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link to="/login/user" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
