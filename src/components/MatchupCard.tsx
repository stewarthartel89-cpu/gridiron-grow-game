import { useNavigate } from "react-router-dom";
import { Matchup } from "@/data/mockData";
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";

interface MatchupCardProps {
  matchup: Matchup;
}

const GrowthBadge = ({ pct, multiplier }: { pct: number; multiplier: number }) => {
  const isPositive = pct >= 0;
  const hasBonus = multiplier > 1.0;
  const hasPenalty = multiplier < 1.0;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        isPositive ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"
      }`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? "+" : ""}{pct.toFixed(1)}%
      </div>
      {(hasBonus || hasPenalty) && (
        <div className={`flex items-center gap-0.5 text-[9px] font-bold ${
          hasBonus ? "text-bonus" : "text-warning"
        }`}>
          {hasBonus ? <Zap className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
          {multiplier.toFixed(2)}x
        </div>
      )}
    </div>
  );
};

const PlayerSide = ({
  member,
  align,
  isWinning,
  onClick,
}: {
  member: Matchup["home"];
  align: "left" | "right";
  isWinning: boolean;
  onClick: () => void;
}) => {
  const textAlign = align === "right" ? "text-right" : "text-left";
  const flexDir = align === "right" ? "flex-row-reverse" : "flex-row";

  return (
    <button
      onClick={onClick}
      className={`flex flex-1 ${flexDir} items-center gap-2 rounded-lg p-1 transition-colors active:bg-accent`}
    >
      <div className="relative">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
            isWinning
              ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {member.avatar}
        </div>
        {/* Level indicator */}
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bonus text-[8px] font-bold text-bonus-foreground">
          {member.level}
        </div>
      </div>
      <div className={`min-w-0 ${textAlign}`}>
        <p className="truncate font-display text-xs font-semibold text-foreground">
          {member.teamName}
        </p>
        <p className="text-[10px] text-muted-foreground">{member.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {member.record.wins}-{member.record.losses}
        </p>
      </div>
    </button>
  );
};

const MatchupCard = ({ matchup }: MatchupCardProps) => {
  const navigate = useNavigate();
  const { home, away } = matchup;
  const homeAdjusted = home.weeklyGrowthPct * home.gameModifiers.totalMultiplier;
  const awayAdjusted = away.weeklyGrowthPct * away.gameModifiers.totalMultiplier;
  const homeWinning = homeAdjusted > awayAdjusted;

  return (
    <div className="rounded-xl border border-border bg-card p-3 transition-colors active:border-primary/30">
      <div className="flex items-center gap-2">
        <PlayerSide member={home} align="left" isWinning={homeWinning} onClick={() => navigate(`/team/${home.id}`)} />

        <div className="flex shrink-0 flex-col items-center gap-1">
          <GrowthBadge pct={home.weeklyGrowthPct} multiplier={home.gameModifiers.totalMultiplier} />
          <span className="font-display text-[10px] font-bold text-muted-foreground">VS</span>
          <GrowthBadge pct={away.weeklyGrowthPct} multiplier={away.gameModifiers.totalMultiplier} />
        </div>

        <PlayerSide member={away} align="right" isWinning={!homeWinning} onClick={() => navigate(`/team/${away.id}`)} />
      </div>
    </div>
  );
};

export default MatchupCard;
