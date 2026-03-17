import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: "user" | "pm" | null;
  isAuthenticated: boolean;
  isPM: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  setPmPinValidated: (valid: boolean) => void;
  isPmPinValidated: () => boolean;
  isPmPinRemembered: (userId: string) => boolean;
  rememberPmAccount: (userId: string) => void;
  logActivity: (action: string, page: string, details?: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isAuthenticated: false,
    isPM: false,
    isLoading: true,
  });

  const deriveRole = (user: User | null): "user" | "pm" | null => {
    if (!user) return null;
    const metaRole = user.user_metadata?.role;
    if (metaRole === "pm") return "pm";
    return "user";
  };

  const isPmPinValidated = useCallback(() => {
    return sessionStorage.getItem("pm_pin_validated") === "true";
  }, []);

  const isPmPinRemembered = useCallback((userId: string) => {
    try {
      const remembered = JSON.parse(localStorage.getItem("pm_remembered_accounts") || "[]");
      return remembered.includes(userId);
    } catch { return false; }
  }, []);

  const setPmPinValidated = useCallback((valid: boolean) => {
    if (valid) {
      sessionStorage.setItem("pm_pin_validated", "true");
    } else {
      sessionStorage.removeItem("pm_pin_validated");
    }
  }, []);

  const rememberPmAccount = useCallback((userId: string) => {
    try {
      const remembered = JSON.parse(localStorage.getItem("pm_remembered_accounts") || "[]");
      if (!remembered.includes(userId)) {
        remembered.push(userId);
        localStorage.setItem("pm_remembered_accounts", JSON.stringify(remembered));
      }
    } catch {}
  }, []);

  const logActivity = useCallback(async (action: string, page: string, details?: Record<string, unknown>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("activity_logs" as any).insert({
      user_id: user.id,
      user_email: user.email,
      action,
      page,
      details: details || {},
    } as any);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      const role = deriveRole(user);

      // Handle PM pending from Google OAuth
      if (user && sessionStorage.getItem("pm_pending") === "true") {
        sessionStorage.removeItem("pm_pending");
        sessionStorage.setItem("pm_pin_validated", "true");
        // Update user metadata role to pm
        supabase.auth.updateUser({ data: { role: "pm" } });
        setState({
          user,
          session,
          role: "pm",
          isAuthenticated: true,
          isPM: true,
          isLoading: false,
        });
        return;
      }

      setState({
        user,
        session,
        role,
        isAuthenticated: !!user,
        isPM: role === "pm" && sessionStorage.getItem("pm_pin_validated") === "true",
        isLoading: false,
      });
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      const role = deriveRole(user);
      setState({
        user,
        session,
        role,
        isAuthenticated: !!user,
        isPM: role === "pm" && sessionStorage.getItem("pm_pin_validated") === "true",
        isLoading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("pm_pin_validated");
    sessionStorage.removeItem("pm_pending");
    setState({
      user: null,
      session: null,
      role: null,
      isAuthenticated: false,
      isPM: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signOut, setPmPinValidated, isPmPinValidated, logActivity }}>
      {children}
    </AuthContext.Provider>
  );
}
