import { useNavigate } from "react-router-dom";
import { useLeagueData } from "@/hooks/useLeagueData";

const Standings = () => {
  const navigate = useNavigate();
  const { members, loading } = useLeagueData();

  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">Standings</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">Standings</h2>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No members yet. Share your invite code to get started!</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-foreground">Standings</h2>
      <div className="space-y-2">
        {members.map((member, i) => (
          <button
            key={member.id}
            onClick={() => navigate(`/team/${member.userId}`)}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-colors active:border-primary/30"
          >
            <span className={`w-5 text-center font-display text-sm font-bold ${
              i === 0 ? "text-primary" : i < 3 ? "text-foreground" : "text-muted-foreground"
            }`}>
              {i + 1}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[10px] font-bold text-secondary-foreground">
              {member.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{member.teamName}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{member.wins}-{member.losses}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              {member.streak && (
                <span className={`font-display text-[10px] font-bold ${
                  member.streak.startsWith("W") ? "text-gain" : member.streak.startsWith("L") ? "text-loss" : "text-muted-foreground"
                }`}>
                  {member.streak}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Standings;
