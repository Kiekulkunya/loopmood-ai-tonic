import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { ValuationProvider } from "@/contexts/ValuationContext";
import AppLayout from "@/components/AppLayout";
import LandingPage from "@/pages/LandingPage";
import RoleSelection from "@/pages/RoleSelection";
import AuthPage from "@/pages/AuthPage";
import EngineConfig from "@/pages/EngineConfig";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <ValuationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/role" element={<RoleSelection />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/engine" element={<EngineConfig />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/classifier" replace />} />
                <Route path="classifier" element={<StartupClassifier />} />
                <Route path="decoded-x-return" element={<DecodedXReturn />} />
                <Route path="risk-pwmoic" element={<RiskPWMOIC />} />
                <Route path="valuation" element={<StartupValuation />} />
                <Route path="nova-dashboard" element={<NovaDashboard />} />
                <Route path="pm/log" element={<PMLog />} />
                <Route path="pm/traffic" element={<PMTraffic />} />
              <Route path="pm/dashboard" element={<PMDashboard />} />
              <Route path="pm/architecture" element={<PMArchitecture />} />
              <Route path="pm/email" element={<PMEmailAutomation />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ValuationProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
