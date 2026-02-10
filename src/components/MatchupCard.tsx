import { Matchup } from "@/data/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MatchupCardProps {
  matchup: Matchup;
}

const GrowthBadge = ({ pct }: { pct: number }) => {
  const isPositive = pct >= 0;
  return (
    <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
      isPositive ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
    }`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}{pct.toFixed(1)}%
    </div>
  );
};

const PlayerSide = ({
  member,
  align,
  isWinning,
}: {
  member: Matchup["home"];
  align: "left" | "right";
  isWinning: boolean;
}) => {
  const textAlign = align === "right" ? "text-right" : "text-left";
  const flexDir = align === "right" ? "flex-row-reverse" : "flex-row";

  return (
    <div className={`flex flex-1 ${flexDir} items-center gap-3`}>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
          isWinning
            ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {member.avatar}
      </div>
      <div className={`min-w-0 ${textAlign}`}>
        <p className="truncate font-display text-sm font-semibold text-foreground">
          {member.teamName}
        </p>
        <p className="text-xs text-muted-foreground">{member.name}</p>
        <p className="text-xs text-muted-foreground">
          {member.record.wins}-{member.record.losses}
        </p>
      </div>
    </div>
  );
};

const MatchupCard = ({ matchup }: MatchupCardProps) => {
  const { home, away } = matchup;
  const homeWinning = home.weeklyGrowthPct > away.weeklyGrowthPct;

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-4">
        <PlayerSide member={home} align="left" isWinning={homeWinning} />

        <div className="flex shrink-0 flex-col items-center gap-1">
          <GrowthBadge pct={home.weeklyGrowthPct} />
          <span className="font-display text-xs font-bold text-muted-foreground">VS</span>
          <GrowthBadge pct={away.weeklyGrowthPct} />
        </div>

        <PlayerSide member={away} align="right" isWinning={!homeWinning} />
      </div>
    </div>
  );
};

export default MatchupCard;
