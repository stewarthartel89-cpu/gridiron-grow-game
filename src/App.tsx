import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import TeamDetail from "./pages/TeamDetail";
import LineupPage from "./pages/LineupPage";
import ScoutPage from "./pages/ScoutPage";
import NewsPage from "./pages/NewsPage";
import LeaguePage from "./pages/LeaguePage";
import SocialPage from "./pages/SocialPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";

const queryClient = new QueryClient();

const ONBOARDING_KEY = "capital_league_onboarded_v2";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/team/:id" element={<TeamDetail />} />
        <Route path="/lineup" element={<LineupPage />} />
        <Route path="/scout" element={<ScoutPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/league" element={<LeaguePage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
        <BrowserRouter>
          <AnimatedRoutes />
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
