import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (!password || !confirm) { setError("Please fill in all fields"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl shadow-accent/20">
            <CheckCircle className="text-accent-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Password Updated</h2>
          <p className="text-muted-foreground text-sm">Your password has been successfully reset.</p>
          <button onClick={() => navigate("/login")} className="mt-6 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
          <p className="text-muted-foreground text-sm">This link is invalid or has expired. Please request a new password reset.</p>
          <button onClick={() => navigate("/forgot-password")} className="mt-6 text-primary hover:underline text-sm font-medium">
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
            <Lock className="text-primary-foreground" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Set New Password</h2>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            Enter your new password below.
          </p>
        </div>

        {error && <p className="text-destructive text-sm text-center mb-4 bg-destructive/10 p-2 rounded-xl">{error}</p>}

        <div className="space-y-4">
          <PasswordInput
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus:ring-primary"
          />
          <PasswordInput
            placeholder="Confirm New Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="focus:ring-primary"
          />
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
