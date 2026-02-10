import { leagueMembers } from "@/data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

const Standings = () => {
  const sorted = [...leagueMembers].sort(
    (a, b) => b.record.wins - a.record.wins || a.record.losses - b.record.losses
  );

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-foreground">Standings</h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rank
              </th>
              <th className="px-4 py-3 text-left font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Team
              </th>
              <th className="hidden px-4 py-3 text-right font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                Record
              </th>
              <th className="hidden px-4 py-3 text-right font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                Portfolio
              </th>
              <th className="px-4 py-3 text-right font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                This Week
              </th>
              <th className="hidden px-4 py-3 text-right font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((member, i) => {
              const isPositive = member.weeklyGrowthPct >= 0;
              const totalReturn = (
                ((member.currentValue - member.totalInvested) / member.totalInvested) *
                100
              ).toFixed(1);
              return (
                <tr
                  key={member.id}
                  className="border-b border-border/50 transition-colors last:border-0 hover:bg-accent/50"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`font-display text-sm font-bold ${
                        i === 0
                          ? "text-primary"
                          : i < 3
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-secondary-foreground">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{member.teamName}</p>
                        <p className="text-xs text-muted-foreground">{member.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-right font-semibold text-foreground sm:table-cell">
                    {member.record.wins}-{member.record.losses}
                  </td>
                  <td className="hidden px-4 py-3 text-right md:table-cell">
                    <p className="font-semibold text-foreground">
                      ${member.currentValue.toLocaleString()}
                    </p>
                    <p className={`text-xs ${Number(totalReturn) >= 0 ? "text-gain" : "text-loss"}`}>
                      {Number(totalReturn) >= 0 ? "+" : ""}{totalReturn}%
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      isPositive ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {isPositive ? "+" : ""}{member.weeklyGrowthPct.toFixed(1)}%
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-right sm:table-cell">
                    <span
                      className={`font-display text-xs font-bold ${
                        member.streak.startsWith("W") ? "text-gain" : "text-loss"
                      }`}
                    >
                      {member.streak}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Standings;
