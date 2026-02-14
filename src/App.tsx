import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LeagueProvider, useLeague } from "@/contexts/LeagueContext";
import Index from "./pages/Index";
import TeamDetail from "./pages/TeamDetail";
import LeaguePage from "./pages/LeaguePage";
import NewsPage from "./pages/NewsPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import LeagueHubPage from "./pages/LeagueHubPage";
import ContactPage from "./pages/ContactPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import MessageNotificationListener from "./components/MessageNotificationListener";

const queryClient = new QueryClient();

const ONBOARDING_KEY = "capital_league_onboarded_v2";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const LeagueGate = ({ children }: { children: React.ReactNode }) => {
  const { activeLeagueId, loading } = useLeague();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!activeLeagueId) return <LeagueHubPage />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/league" element={<ProtectedRoute><LeagueGate><LeaguePage /></LeagueGate></ProtectedRoute>} />
          <Route path="/league-hub" element={<ProtectedRoute><LeagueHubPage /></ProtectedRoute>} />
          <Route path="/team/:id" element={<ProtectedRoute><LeagueGate><TeamDetail /></LeagueGate></ProtectedRoute>} />
          <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <LeagueProvider>
          <BrowserRouter>
            <AnimatedRoutes />
            <MessageNotificationListener />
            <BottomNav />
          </BrowserRouter>
        </LeagueProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
