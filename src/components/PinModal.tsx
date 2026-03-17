import { useState, useRef, useEffect } from "react";
import { Lock, X } from "lucide-react";

interface PinModalProps {
  open: boolean;
  onVerify: () => void;
  onCancel: () => void;
}

const CORRECT_PIN = "1234";

export default function PinModal({ open, onVerify, onCancel }: PinModalProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(0);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (lockout > 0) {
      const timer = setTimeout(() => setLockout((l) => l - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockout]);

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", ""]);
      setError("");
      refs[0].current?.focus();
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    if (lockout > 0) return;
    const d = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = d;
    setDigits(newDigits);
    setError("");
    if (d && index < 3) refs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    if (lockout > 0) return;
    const pin = digits.join("");
    if (pin === CORRECT_PIN) {
      onVerify();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setDigits(["", "", "", ""]);
      refs[0].current?.focus();
      if (newAttempts >= 3) {
        setLockout(30);
        setAttempts(0);
        setError("Too many failed attempts. Locked for 30 seconds.");
      } else {
        setError("Invalid PIN. Please try again.");
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
            <Lock className="text-accent-foreground" size={28} />
          </div>
          <h3 className="text-xl font-bold text-foreground">PM Access Required</h3>
          <p className="text-muted-foreground text-sm mt-1">Enter your 4-digit Security PIN</p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="password"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={lockout > 0}
              className="w-14 h-14 text-center text-2xl font-bold bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
            />
          ))}
        </div>

        {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}
        {lockout > 0 && (
          <p className="text-warning text-sm text-center mb-4">Retry in {lockout}s</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:bg-secondary transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={digits.some((d) => !d) || lockout > 0}
            className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
