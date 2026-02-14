import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import LeagueHeader from "@/components/LeagueHeader";
import WeeklyMatchups from "@/components/WeeklyMatchups";
import MatchupDetailView from "@/components/MatchupDetailView";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useLeague } from "@/contexts/LeagueContext";
import { Settings as SettingsIcon, Binoculars, Swords, Trophy, Briefcase, MessageCircle, ChevronDown, Check } from "lucide-react";
import { useUnreadCount } from "@/hooks/useChat";

import ScoutContent from "@/components/ScoutContent";
import LeagueInfoContent from "@/components/LeagueInfoContent";
import PortfolioContent from "@/components/PortfolioContent";

const TAB_ACCENTS: Record<string, string> = {
  portfolio: "152 100% 45%",  // green
  matchup: "15 90% 55%",     // orange-red
  scout: "210 80% 55%",      // blue
  league: "45 90% 55%",      // yellow
};

const TABS = [
  { key: "portfolio", label: "Portfolio", icon: Briefcase },
  { key: "matchup", label: "Matchup", icon: Swords },
  { key: "scout", label: "Scout", icon: Binoculars },
  { key: "league", label: "League", icon: Trophy },
] as const;

type TabKey = typeof TABS[number]["key"];

const LeaguePage = () => {
  const [tab, setTab] = useState<TabKey>("portfolio");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { leagueName, leagues, activeLeagueId, setActiveLeague } = useLeague();
  const unreadCount = useUnreadCount();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <PageTransition>
      <div
        className="min-h-[100dvh] pb-28 transition-colors duration-500"
        style={{ "--tab-accent": TAB_ACCENTS[tab], backgroundColor: `hsl(${TAB_ACCENTS[tab]} / 0.06)` } as React.CSSProperties}
      >
        {/* Header */}
        <header className="border-b border-border bg-card safe-area-top">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate("/settings")}
              className="rounded-lg p-2 text-muted-foreground hover:text-foreground active:bg-accent transition-colors"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>

            {/* League name with dropdown switcher */}
            <div className="relative min-w-0 flex-1 flex justify-center" ref={dropdownRef}>
              <button
                onClick={() => leagues.length > 1 && setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 active:opacity-70 transition-opacity min-w-0 max-w-full"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary glow-primary">
                  <Trophy className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="font-display text-base font-bold tracking-wider text-foreground truncate">
                  {leagueName || "League"}
                </h1>
                {leagues.length > 1 && (
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {dropdownOpen && leagues.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(14rem,calc(100vw-2rem))] rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden"
                  >
                    {leagues.map((l) => (
                      <button
                        key={l.leagueId}
                        onClick={() => {
                          setActiveLeague(l.leagueId);
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent active:bg-accent"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <Trophy className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="flex-1 font-semibold text-foreground truncate">{l.leagueName}</span>
                        {l.leagueId === activeLeagueId && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
        <div className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl flex px-2 py-1.5 gap-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = tab === key;
              return (
                <motion.button
                  key={key}
                  onClick={() => setTab(key)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 relative ${
                    isActive
                      ? ""
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  style={isActive ? { color: `hsl(${TAB_ACCENTS[key]})`, backgroundColor: `hsl(${TAB_ACCENTS[key]} / 0.15)` } : undefined}
                >
                  <Icon className="h-4 w-4" style={isActive ? { filter: `drop-shadow(0 0 6px hsl(${TAB_ACCENTS[key]} / 0.6))` } : undefined} />
                  <span className="font-display uppercase">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-glow"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        border: `1px solid hsl(${TAB_ACCENTS[key]} / 0.3)`,
                        boxShadow: `0 0 12px hsl(${TAB_ACCENTS[key]} / 0.15), inset 0 0 12px hsl(${TAB_ACCENTS[key]} / 0.05)`,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
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
