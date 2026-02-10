import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/team/:id" element={<TeamDetail />} />
          <Route path="/lineup" element={<LineupPage />} />
          <Route path="/scout" element={<ScoutPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/league" element={<LeaguePage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
