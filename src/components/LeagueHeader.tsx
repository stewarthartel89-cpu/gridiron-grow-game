import { TrendingUp } from "lucide-react";
import { useLeagueData } from "@/hooks/useLeagueData";

const LeagueHeader = () => {
  const { settings, currentMember, loading } = useLeagueData();

  if (loading || !settings) {
    return (
      <header className="border-b border-border bg-card safe-area-top">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-secondary" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-card safe-area-top">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-foreground">
                {settings.name}
              </h1>
              <p className="text-[10px] text-muted-foreground">Fantasy Investing</p>
            </div>
          </div>

          <div className="rounded-md bg-primary px-2 py-1">
            <p className="font-display text-[11px] font-bold text-primary-foreground">
              WK {settings.currentWeek}/{settings.seasonLength}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LeagueHeader;
