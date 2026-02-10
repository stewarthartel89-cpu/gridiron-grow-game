import { TrendingUp, DollarSign, Zap } from "lucide-react";
import { currentWeek, seasonLength, leagueMembers } from "@/data/mockData";

const LeagueHeader = () => {
  // Current user (mock: first member)
  const me = leagueMembers[0];

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-foreground">
                Capital League
              </h1>
              <p className="text-[10px] text-muted-foreground">Fantasy Investing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* XP badge */}
            <div className="flex items-center gap-1 rounded-full bg-xp/15 px-2 py-1">
              <Zap className="h-3 w-3 text-xp" />
              <span className="text-[10px] font-bold text-xp">{me.xp.toLocaleString()} XP</span>
            </div>
            {/* Level */}
            <div className="flex items-center gap-1 rounded-full bg-bonus/15 px-2 py-1">
              <span className="text-[10px] font-bold text-bonus">LVL {me.level}</span>
            </div>
            {/* Week */}
            <div className="rounded-md bg-primary px-2 py-1">
              <p className="font-display text-[11px] font-bold text-primary-foreground">
                WK {currentWeek}/{seasonLength}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LeagueHeader;
