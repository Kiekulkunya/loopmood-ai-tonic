import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import StartupClassifier from "@/pages/StartupClassifier";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app/classifier" replace />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/classifier" replace />} />
            <Route path="classifier" element={<StartupClassifier />} />
            <Route path="decoded-x-return" element={<PlaceholderPage />} />
            <Route path="risk-pwmoic" element={<PlaceholderPage />} />
            <Route path="valuation" element={<PlaceholderPage />} />
            <Route path="nova-dashboard" element={<PlaceholderPage />} />
            <Route path="pm/log" element={<PlaceholderPage />} />
            <Route path="pm/traffic" element={<PlaceholderPage />} />
            <Route path="pm/dashboard" element={<PlaceholderPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
