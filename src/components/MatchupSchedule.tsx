import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLeague } from "@/contexts/LeagueContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLeagueData } from "@/hooks/useLeagueData";
import { Calendar, ChevronDown, User, Swords } from "lucide-react";

interface ScheduleMatchup {
  id: string;
  week: number;
  homeUserId: string;
  awayUserId: string;
  homeGrowthPct: number | null;
  awayGrowthPct: number | null;
  isFinal: boolean;
  winnerUserId: string | null;
}

interface MemberInfo {
  userId: string;
  teamName: string;
  avatar: string;
  wins: number;
  losses: number;
}

const MatchupSchedule = () => {
  const { leagueId } = useLeague();
  const { user } = useAuth();
  const { settings, members } = useLeagueData();
  const [allMatchups, setAllMatchups] = useState<ScheduleMatchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUserId, setFilterUserId] = useState<string>("mine");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Build member lookup
  const memberMap = useMemo(() => {
    const map = new Map<string, MemberInfo>();
    for (const m of members) {
      map.set(m.userId, {
        userId: m.userId,
        teamName: m.teamName,
        avatar: m.avatar,
        wins: m.wins,
        losses: m.losses,
      });
    }
    return map;
  }, [members]);

  // Fetch all matchups for the league
  useEffect(() => {
    if (!leagueId) return;
    const fetchAll = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("matchups")
        .select("*")
        .eq("league_id", leagueId)
        .order("week", { ascending: true });

      setAllMatchups(
        (data || []).map((m) => ({
          id: m.id,
          week: m.week,
          homeUserId: m.home_user_id,
          awayUserId: m.away_user_id,
          homeGrowthPct: m.home_growth_pct,
          awayGrowthPct: m.away_growth_pct,
          isFinal: m.is_final,
          winnerUserId: m.winner_user_id,
        }))
      );
      setLoading(false);
    };
    fetchAll();
  }, [leagueId]);

  // Resolve which userId to filter
  const activeFilterId = filterUserId === "mine" ? user?.id : filterUserId === "all" ? null : filterUserId;

  // Group matchups by week and filter
  const weeklySchedule = useMemo(() => {
    const weeks = new Map<number, ScheduleMatchup[]>();
    for (const m of allMatchups) {
      if (activeFilterId && m.homeUserId !== activeFilterId && m.awayUserId !== activeFilterId) continue;
      if (!weeks.has(m.week)) weeks.set(m.week, []);
      weeks.get(m.week)!.push(m);
    }
    return Array.from(weeks.entries()).sort(([a], [b]) => a - b);
  }, [allMatchups, activeFilterId]);

  // Build filter options
  const filterOptions = useMemo(() => {
    const opts: { value: string; label: string; avatar?: string }[] = [
      { value: "mine", label: "My Schedule" },
      { value: "all", label: "All Matchups" },
    ];
    for (const m of members) {
      if (m.userId === user?.id) continue;
      opts.push({ value: m.userId, label: m.teamName, avatar: m.avatar });
    }
    return opts;
  }, [members, user]);

  const selectedLabel = filterOptions.find((o) => o.value === filterUserId)?.label || "My Schedule";

  const getMember = (uid: string): MemberInfo =>
    memberMap.get(uid) || { userId: uid, teamName: "Unknown", avatar: "??", wins: 0, losses: 0 };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

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
          <p className="text-[10px] text-muted-foreground/60 mt-1">Matchups will appear once the commissioner sets up the schedule.</p>
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
                {settings && week === settings.currentWeek && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[8px] font-bold text-primary">CURRENT</span>
                )}
                {settings && week >= settings.playoffStartWeek && (
                  <span className="rounded-full bg-xp/15 px-2 py-0.5 text-[8px] font-bold text-xp">PLAYOFFS</span>
                )}
              </div>

              {/* Matchups for this week */}
              <div className="divide-y divide-border/20">
                {matchups.map((m) => {
                  const home = getMember(m.homeUserId);
                  const away = getMember(m.awayUserId);
                  const isMyMatchup = user && (m.homeUserId === user.id || m.awayUserId === user.id);
                  const homeWon = m.isFinal && m.winnerUserId === m.homeUserId;
                  const awayWon = m.isFinal && m.winnerUserId === m.awayUserId;

                  return (
                    <div
                      key={m.id}
                      className={`flex items-center gap-2 px-4 py-2.5 ${isMyMatchup ? "bg-primary/5" : ""}`}
                    >
                      {/* Home team */}
                      <div className="flex flex-1 items-center gap-2 min-w-0">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold ${
                          homeWon ? "bg-primary text-primary-foreground ring-1 ring-primary/30" :
                          isMyMatchup && m.homeUserId === user?.id ? "bg-primary/20 text-primary" :
                          "bg-secondary text-secondary-foreground"
                        }`}>
                          {home.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-semibold truncate ${homeWon ? "text-primary" : "text-foreground"}`}>
                            {home.teamName}
                          </p>
                          {m.isFinal && m.homeGrowthPct !== null && (
                            <p className={`text-[9px] font-bold ${(m.homeGrowthPct ?? 0) >= 0 ? "text-gain" : "text-loss"}`}>
                              {(m.homeGrowthPct ?? 0) >= 0 ? "+" : ""}{m.homeGrowthPct?.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>

                      {/* VS / Result */}
                      <div className="shrink-0 text-center w-10">
                        {m.isFinal ? (
                          <span className="text-[8px] font-bold text-muted-foreground bg-secondary rounded px-1.5 py-0.5">FINAL</span>
                        ) : settings && week === settings.currentWeek ? (
                          <span className="text-[8px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">LIVE</span>
                        ) : (
                          <span className="font-display text-[9px] font-bold text-muted-foreground">VS</span>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex flex-1 items-center gap-2 flex-row-reverse min-w-0">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold ${
                          awayWon ? "bg-primary text-primary-foreground ring-1 ring-primary/30" :
                          isMyMatchup && m.awayUserId === user?.id ? "bg-primary/20 text-primary" :
                          "bg-secondary text-secondary-foreground"
                        }`}>
                          {away.avatar}
                        </div>
                        <div className="min-w-0 text-right">
                          <p className={`text-[11px] font-semibold truncate ${awayWon ? "text-primary" : "text-foreground"}`}>
                            {away.teamName}
                          </p>
                          {m.isFinal && m.awayGrowthPct !== null && (
                            <p className={`text-[9px] font-bold ${(m.awayGrowthPct ?? 0) >= 0 ? "text-gain" : "text-loss"}`}>
                              {(m.awayGrowthPct ?? 0) >= 0 ? "+" : ""}{m.awayGrowthPct?.toFixed(1)}%
                            </p>
                          )}
                        </div>
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
