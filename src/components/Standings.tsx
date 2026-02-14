import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Trophy } from "lucide-react";
import { leagueMembers, leagueSettings } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useLeague } from "@/contexts/LeagueContext";
import { findOrCreateDM } from "@/hooks/useChat";

const Standings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leagueId } = useLeague();
  const [loadingDm, setLoadingDm] = useState<string | null>(null);

  const playoffTeams = leagueSettings.playoffTeams;
  const playoffStartWeek = leagueSettings.playoffStartWeek;
  const currentWeek = leagueSettings.currentWeek;
  const weeksAway = Math.max(0, playoffStartWeek - currentWeek);

  // Sort by wins desc, losses asc
  const members = [...leagueMembers].sort(
    (a, b) => b.record.wins - a.record.wins || a.record.losses - b.record.losses
  );

  return (
    <div className="rounded-xl border border-border bg-card card-elevated overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-4 w-4 text-xp" />
          STANDINGS
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {weeksAway > 0 ? `Playoffs in ${weeksAway}w` : "🏆 Playoffs!"}
        </span>
      </div>

      {/* Header row */}
      <div className="flex items-center gap-2.5 px-4 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
        <span className="w-5 text-center">#</span>
        <span className="flex-1 ml-10">Team</span>
        <span className="w-10 text-center">W-L</span>
        <span className="w-10 text-center">Strk</span>
        <span className="w-6" />
      </div>

      <div className="divide-y divide-border/30">
        {members.map((member, i) => {
          const inPlayoffs = i < playoffTeams;
          const isPlayoffLine = i === playoffTeams - 1 && members.length > playoffTeams;

          return (
            <div key={member.id}>
              <div
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                  inPlayoffs ? "bg-gain/[0.03]" : ""
                }`}
              >
                <button
                  onClick={() => navigate(`/team/${member.id}`)}
                  className="flex flex-1 items-center gap-2.5 min-w-0 active:opacity-70 transition-opacity"
                >
                  <span className={`w-5 text-center font-display text-xs font-bold ${
                    i === 0 ? "text-xp" : inPlayoffs ? "text-gain" : "text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[9px] font-bold text-secondary-foreground">
                    {member.avatar}
                  </div>
                  <p className="truncate text-xs font-semibold text-foreground flex-1 min-w-0">{member.teamName}</p>
                  <span className="w-10 text-center text-[11px] font-semibold text-foreground">{member.record.wins}-{member.record.losses}</span>
                  <span className={`w-10 text-center font-display text-[10px] font-bold ${
                    member.streak?.startsWith("W") ? "text-gain" : member.streak?.startsWith("L") ? "text-loss" : "text-muted-foreground"
                  }`}>
                    {member.streak || "—"}
                  </span>
                </button>
                {member.id !== user?.id ? (
                  <button
                    className="shrink-0 w-6 rounded-md p-1 text-muted-foreground hover:text-primary active:bg-accent transition-colors"
                    aria-label={`Message ${member.name}`}
                    disabled={loadingDm === member.id}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user || !leagueId) return;
                      setLoadingDm(member.id);
                      const convoId = await findOrCreateDM(user.id, member.id, leagueId);
                      setLoadingDm(null);
                      if (convoId) navigate(`/chat?dm=${convoId}`);
                    }}
                  >
                    <MessageCircle className={`h-3.5 w-3.5 ${loadingDm === member.id ? "animate-pulse" : ""}`} />
                  </button>
                ) : <span className="w-6" />}
              </div>
              {isPlayoffLine && (
                <div className="flex items-center gap-2 px-4 py-1">
                  <div className="flex-1 border-t border-dashed border-primary/30" />
                  <span className="text-[9px] font-semibold text-primary/60 uppercase tracking-wider">Playoff cutoff</span>
                  <div className="flex-1 border-t border-dashed border-primary/30" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Standings;
