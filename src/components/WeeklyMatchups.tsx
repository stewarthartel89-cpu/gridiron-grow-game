import { useLeagueData } from "@/hooks/useLeagueData";

const WeeklyMatchups = () => {
  const { matchups, members, settings, loading } = useLeagueData();

  if (loading || !settings) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-7 w-40 animate-pulse rounded bg-secondary" />
        </div>
      </section>
    );
  }

  if (matchups.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Week {settings.currentWeek} Matchups
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No matchups yet for this week.</p>
        </div>
      </section>
    );
  }

  const memberMap = new Map(members.map((m) => [m.userId, m]));

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Week {settings.currentWeek} Matchups
        </h2>
        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          LIVE
        </span>
      </div>
      <div className="grid gap-3">
        {matchups.map((matchup) => {
          const home = memberMap.get(matchup.homeUserId);
          const away = memberMap.get(matchup.awayUserId);
          if (!home || !away) return null;

          return (
            <div key={matchup.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                {/* Home */}
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground">
                    {home.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-xs font-semibold text-foreground">{home.teamName}</p>
                    <p className="text-[10px] text-muted-foreground">{home.wins}-{home.losses}</p>
                  </div>
                </div>

                {/* VS */}
                <span className="font-display text-[10px] font-bold text-muted-foreground shrink-0">VS</span>

                {/* Away */}
                <div className="flex flex-1 flex-row-reverse items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground">
                    {away.avatar}
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="truncate font-display text-xs font-semibold text-foreground">{away.teamName}</p>
                    <p className="text-[10px] text-muted-foreground">{away.wins}-{away.losses}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WeeklyMatchups;
