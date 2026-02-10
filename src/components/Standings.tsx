import { useNavigate } from "react-router-dom";
import { leagueMembers } from "@/data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

const Standings = () => {
  const navigate = useNavigate();
  const sorted = [...leagueMembers].sort(
    (a, b) => b.record.wins - a.record.wins || a.record.losses - b.record.losses
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-foreground">Standings</h2>
      <div className="space-y-2">
        {sorted.map((member, i) => {
          const isPositive = member.weeklyGrowthPct >= 0;
          return (
            <button
              key={member.id}
              onClick={() => navigate(`/team/${member.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors active:border-primary/30"
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
                <p className="text-[10px] text-muted-foreground">
                  {member.record.wins}-{member.record.losses} · ${member.currentValue.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isPositive ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
                }`}>
                  {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {isPositive ? "+" : ""}{member.weeklyGrowthPct.toFixed(1)}%
                </div>
                <span className={`font-display text-[10px] font-bold ${
                  member.streak.startsWith("W") ? "text-gain" : "text-loss"
                }`}>
                  {member.streak}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default Standings;
