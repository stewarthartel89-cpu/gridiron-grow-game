import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import LeagueHeader from "@/components/LeagueHeader";
import WeeklyMatchups from "@/components/WeeklyMatchups";
import MatchupDetailView from "@/components/MatchupDetailView";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useLeague } from "@/contexts/LeagueContext";
import { Settings as SettingsIcon, Binoculars, Swords, Trophy, Briefcase, MessageCircle } from "lucide-react";
import { useUnreadCount } from "@/hooks/useChat";

// Import Scout page content inline
import ScoutContent from "@/components/ScoutContent";
import LeagueInfoContent from "@/components/LeagueInfoContent";
import PortfolioContent from "@/components/PortfolioContent";

const TABS = [
  { key: "portfolio", label: "Portfolio", icon: Briefcase },
  { key: "matchup", label: "Matchup", icon: Swords },
  { key: "scout", label: "Scout", icon: Binoculars },
  { key: "league", label: "League", icon: Trophy },
] as const;

type TabKey = typeof TABS[number]["key"];

const LeaguePage = () => {
  const [tab, setTab] = useState<TabKey>("portfolio");
  const navigate = useNavigate();
  const { leagueName } = useLeague();
  const unreadCount = useUnreadCount();

  return (
    <PageTransition>
      <div className="min-h-[100dvh] bg-background pb-28">
        {/* Header */}
        <header className="border-b border-border bg-card safe-area-top">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate("/settings")}
              className="rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-accent transition-colors"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-lg font-bold tracking-wider text-foreground">
                {leagueName || "League"}
              </h1>
            </div>
            <button
              onClick={() => navigate("/chat")}
              className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-accent transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Tab bar */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-2xl flex">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors relative ${
                  tab === key ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {tab === key && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <main className="mx-auto max-w-2xl px-4 py-5 space-y-5">
          {tab === "portfolio" && <PortfolioContent />}
          {tab === "matchup" && <MatchupDetailView />}
          {tab === "scout" && <ScoutContent />}
          {tab === "league" && <LeagueInfoContent />}
        </main>
      </div>
    </PageTransition>
  );
};

export default LeaguePage;
