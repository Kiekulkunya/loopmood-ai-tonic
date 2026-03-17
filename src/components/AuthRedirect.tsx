import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/** Redirects authenticated users away from login pages to their dashboard */
export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPM, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isPM ? "/app/pm/log" : "/app/classifier"} replace />;
  }

  return <>{children}</>;
}
