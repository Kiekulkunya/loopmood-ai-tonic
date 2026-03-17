import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ValuationProvider } from "@/contexts/ValuationContext";
import { DisplayProvider } from "@/contexts/DisplayContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthRedirect from "@/components/AuthRedirect";
import AppLayout from "@/components/AppLayout";
import LandingPage from "@/pages/LandingPage";
import LoginRoleSelect from "@/pages/LoginRoleSelect";
import UserLogin from "@/pages/UserLogin";
import UserSignup from "@/pages/UserSignup";
import PMLogin from "@/pages/PMLogin";
import PMSignup from "@/pages/PMSignup";
import EngineConfig from "@/pages/EngineConfig";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import StartupClassifier from "@/pages/StartupClassifier";
import DecodedXReturn from "@/pages/DecodedXReturn";
import RiskPWMOIC from "@/pages/RiskPWMOIC";
import StartupValuation from "@/pages/StartupValuation";
import NovaDashboard from "@/pages/NovaDashboard";
import PMLog from "@/pages/PMLog";
import PMTraffic from "@/pages/PMTraffic";
import PMDashboard from "@/pages/PMDashboard";
import PMArchitecture from "@/pages/PMArchitecture";
import PMEmailAutomation from "@/pages/PMEmailAutomation";
import CustomerFeedback from "@/pages/CustomerFeedback";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ValuationProvider>
              <DisplayProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  {/* Legacy routes redirect to new login */}
                  <Route path="/role" element={<Navigate to="/login" replace />} />
                  <Route path="/auth" element={<Navigate to="/login" replace />} />
                  {/* Auth routes */}
                  <Route path="/login" element={<AuthRedirect><LoginRoleSelect /></AuthRedirect>} />
                  <Route path="/login/user" element={<AuthRedirect><UserLogin /></AuthRedirect>} />
                  <Route path="/login/user/signup" element={<AuthRedirect><UserSignup /></AuthRedirect>} />
                  <Route path="/login/pm" element={<AuthRedirect><PMLogin /></AuthRedirect>} />
                  <Route path="/login/pm/signup" element={<AuthRedirect><PMSignup /></AuthRedirect>} />
                  <Route path="/engine" element={<EngineConfig />} />
                  {/* Protected app routes */}
                  <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/app/classifier" replace />} />
                    <Route path="classifier" element={<StartupClassifier />} />
                    <Route path="decoded-x-return" element={<DecodedXReturn />} />
                    <Route path="risk-pwmoic" element={<RiskPWMOIC />} />
                    <Route path="valuation" element={<StartupValuation />} />
                    <Route path="nova-dashboard" element={<NovaDashboard />} />
                    <Route path="feedback" element={<CustomerFeedback />} />
                    <Route path="pm/log" element={<PMLog />} />
                    <Route path="pm/traffic" element={<PMTraffic />} />
                    <Route path="pm/dashboard" element={<PMDashboard />} />
                    <Route path="pm/architecture" element={<PMArchitecture />} />
                    <Route path="pm/email" element={<PMEmailAutomation />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </DisplayProvider>
            </ValuationProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
