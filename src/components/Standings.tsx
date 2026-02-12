import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useAuth } from "@/contexts/AuthContext";
import { useLeague } from "@/contexts/LeagueContext";
import { findOrCreateDM } from "@/hooks/useChat";

const Standings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leagueId } = useLeague();
  const { members, loading } = useLeagueData();

  const handleDM = async (e: React.MouseEvent, targetUserId: string) => {
    e.stopPropagation();
    if (!user || !leagueId) return;
    const conversationId = await findOrCreateDM(user.id, targetUserId, leagueId);
    if (conversationId) {
      navigate(`/chat?dm=${conversationId}`);
    }
  };

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
          <div
            key={member.id}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-colors"
          >
            <button
              onClick={() => navigate(`/team/${member.userId}`)}
              className="flex flex-1 items-center gap-2.5 min-w-0 active:opacity-70 transition-opacity"
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
            {member.userId !== user?.id && (
              <button
                onClick={(e) => handleDM(e, member.userId)}
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-primary active:bg-accent transition-colors"
                aria-label={`Message ${member.displayName}`}
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Standings;
