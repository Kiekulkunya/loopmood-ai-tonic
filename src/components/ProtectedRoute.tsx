import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePM?: boolean;
}

export default function ProtectedRoute({ children, requirePM = false }: ProtectedRouteProps) {
  const { isAuthenticated, isPM, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requirePM && !isPM) {
    // PM role but PIN not validated this session
    if (role === "pm") {
      return <Navigate to="/login/pm" state={{ pinExpired: true }} replace />;
    }
    return <Navigate to="/app/classifier" replace />;
  }

  return <>{children}</>;
}
