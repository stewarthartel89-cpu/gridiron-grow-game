import { useState, useMemo } from "react";
import { leagueMembers, leagueSettings, seasonSchedule, currentWeek } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, ChevronDown, User, Swords } from "lucide-react";

const MatchupSchedule = () => {
  const { user } = useAuth();
  const [filterUserId, setFilterUserId] = useState<string>("mine");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Resolve which userId to filter — for mock data, default to member "1"
  const myId = user?.id || "1";
  const activeFilterId = filterUserId === "mine" ? myId : filterUserId === "all" ? null : filterUserId;

  // Group matchups by week and filter
  const weeklySchedule = useMemo(() => {
    const weeks = new Map<number, typeof seasonSchedule>();
    for (const m of seasonSchedule) {
      if (activeFilterId && m.home.id !== activeFilterId && m.away.id !== activeFilterId) continue;
      if (!weeks.has(m.week)) weeks.set(m.week, []);
      weeks.get(m.week)!.push(m);
    }
    return Array.from(weeks.entries()).sort(([a], [b]) => a - b);
  }, [activeFilterId]);

  // Build filter options
  const filterOptions = useMemo(() => {
    const opts: { value: string; label: string; avatar?: string }[] = [
      { value: "mine", label: "My Schedule" },
      { value: "all", label: "All Matchups" },
    ];
    for (const m of leagueMembers) {
      if (m.id === myId) continue;
      opts.push({ value: m.id, label: m.teamName, avatar: m.avatar });
    }
    return opts;
  }, [myId]);

  const selectedLabel = filterOptions.find((o) => o.value === filterUserId)?.label || "My Schedule";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header with filter */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-bonus" />
          <h3 className="font-display text-sm font-bold text-foreground">SCHEDULE</h3>
        </div>

        {/* Player filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-foreground active:bg-accent transition-colors"
          >
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="max-w-[100px] truncate">{selectedLabel}</span>
            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilterUserId(opt.value); setDropdownOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[11px] transition-colors hover:bg-accent active:bg-accent ${
                    filterUserId === opt.value ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  {opt.avatar && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[8px] font-bold text-muted-foreground">
                      {opt.avatar}
                    </div>
                  )}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule body */}
      {weeklySchedule.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Swords className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No matchups scheduled yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {weeklySchedule.map(([week, matchups]) => (
            <div key={week}>
              {/* Week header */}
              <div className="flex items-center gap-2 bg-secondary/30 px-4 py-1.5">
                <span className="font-display text-[10px] font-bold text-muted-foreground tracking-wider">
                  WEEK {week}
                </span>
                {week === currentWeek && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[8px] font-bold text-primary">CURRENT</span>
                )}
                {week >= leagueSettings.playoffStartWeek && (
                  <span className="rounded-full bg-xp/15 px-2 py-0.5 text-[8px] font-bold text-xp">PLAYOFFS</span>
                )}
              </div>

              {/* Matchups for this week */}
              <div className="divide-y divide-border/20">
                {matchups.map((m) => {
                  const isMyMatchup = m.home.id === myId || m.away.id === myId;
                  const isFinal = m.week < currentWeek;

                  return (
                    <div
                      key={m.id}
                      className={`flex items-center gap-2 px-4 py-2.5 ${isMyMatchup ? "bg-primary/5" : ""}`}
                    >
                      {/* Home team */}
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold ${
                          isMyMatchup && m.home.id === myId ? "bg-primary/20 text-primary" :
                          "bg-secondary text-secondary-foreground"
                        }`}>
                          {m.home.avatar}
                        </div>
                        <p className="text-[11px] font-semibold truncate text-foreground min-w-0">
                          {m.home.teamName}
                        </p>
                      </div>

                      {/* VS / Result */}
                      <div className="shrink-0 text-center w-10">
                        {isFinal ? (
                          <span className="text-[8px] font-bold text-muted-foreground bg-secondary rounded px-1.5 py-0.5">FINAL</span>
                        ) : m.week === currentWeek ? (
                          <span className="text-[8px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">LIVE</span>
                        ) : (
                          <span className="font-display text-[9px] font-bold text-muted-foreground">VS</span>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex flex-1 items-center gap-2 flex-row-reverse min-w-0">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold ${
                          isMyMatchup && m.away.id === myId ? "bg-primary/20 text-primary" :
                          "bg-secondary text-secondary-foreground"
                        }`}>
                          {m.away.avatar}
                        </div>
                        <p className="text-[11px] font-semibold truncate text-foreground min-w-0 text-right">
                          {m.away.teamName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchupSchedule;
