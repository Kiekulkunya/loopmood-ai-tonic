import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) { setError("Please enter your email address"); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl shadow-primary/20">
            <Mail className="text-primary-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
          <p className="text-muted-foreground text-sm">
            We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link to set a new password.
          </p>
          <button onClick={() => navigate("/login")} className="mt-6 text-primary hover:underline text-sm font-medium">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <Mail className="text-primary-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Forgot Password</h2>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            Enter your email address and we'll send you a link to reset your password.
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
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
