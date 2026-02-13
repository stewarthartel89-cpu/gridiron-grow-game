import { useMemo } from "react";
import { LeagueMember, Holding, weeklyMatchups } from "@/data/mockData";
import { classifyHolding, AssetBucket, BUCKETS, calculateDiversification } from "@/lib/diversificationModifier";
import { TrendingUp, TrendingDown, Shield } from "lucide-react";

/** Group holdings by diversity bucket */
function groupByBucket(holdings: Holding[]): Record<AssetBucket, Holding[]> {
  const groups: Record<AssetBucket, Holding[]> = { Stocks: [], ETFs: [] };
  for (const h of holdings) {
    groups[classifyHolding(h.sector)].push(h);
  }
  return groups;
}

function winProbability(home: LeagueMember, away: LeagueMember): number {
  const hAdj = home.weeklyGrowthPct * home.gameModifiers.totalMultiplier;
  const aAdj = away.weeklyGrowthPct * away.gameModifiers.totalMultiplier;
  const diff = hAdj - aAdj;
  const raw = 50 + diff * 8;
  return Math.max(5, Math.min(95, Math.round(raw)));
}

const HoldingRow = ({ home, away, bucket }: { home: Holding | null; away: Holding | null; bucket: AssetBucket }) => {
  const growthPct = (h: Holding) => ((h.currentPrice - h.avgCost) / h.avgCost) * 100;

  return (
    <div className="flex items-center gap-1 py-2 px-2">
      <div className="flex-1 min-w-0">
        {home ? (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{home.symbol}</p>
              <p className="text-[9px] text-muted-foreground truncate">{home.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-[11px] font-bold ${growthPct(home) >= 0 ? "text-gain" : "text-loss"}`}>
                {growthPct(home) >= 0 ? "+" : ""}{growthPct(home).toFixed(1)}%
              </p>
              <p className="text-[9px] text-muted-foreground">{home.allocation}%</p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground/40 italic">—</p>
        )}
      </div>
      <div className="shrink-0 w-8 flex justify-center">
        <span className="text-[7px] font-bold text-muted-foreground bg-secondary rounded px-1 py-0.5">
          {bucket === "Stocks" ? "STK" : "ETF"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        {away ? (
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="min-w-0 flex-1 text-right">
              <p className="text-xs font-semibold text-foreground truncate">{away.symbol}</p>
              <p className="text-[9px] text-muted-foreground truncate">{away.name}</p>
            </div>
            <div className="text-left shrink-0">
              <p className={`text-[11px] font-bold ${growthPct(away) >= 0 ? "text-gain" : "text-loss"}`}>
                {growthPct(away) >= 0 ? "+" : ""}{growthPct(away).toFixed(1)}%
              </p>
              <p className="text-[9px] text-muted-foreground">{away.allocation}%</p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground/40 italic text-right">—</p>
        )}
      </div>
    </div>
  );
};

const MatchupDetailView = () => {
  const matchup = weeklyMatchups[0];
  const home = matchup?.home;
  const away = matchup?.away;

  const homeGroups = useMemo(() => home ? groupByBucket(home.holdings) : { Stocks: [], ETFs: [] }, [home]);
  const awayGroups = useMemo(() => away ? groupByBucket(away.holdings) : { Stocks: [], ETFs: [] }, [away]);
  const homeDiv = useMemo(() => home ? calculateDiversification(home.holdings) : { tier: "moderate" as const, allocations: [], worstDeviation: 0, worstBucket: "Stocks" as AssetBucket, modifier: 1 }, [home]);
  const awayDiv = useMemo(() => away ? calculateDiversification(away.holdings) : { tier: "moderate" as const, allocations: [], worstDeviation: 0, worstBucket: "Stocks" as AssetBucket, modifier: 1 }, [away]);

  if (!matchup || !home || !away) return <p className="text-sm text-muted-foreground text-center py-8">No matchup this week.</p>;

  const homeScore = home.weeklyGrowthPct * homeDiv.modifier;
  const awayScore = away.weeklyGrowthPct * awayDiv.modifier;
  const homeWinPct = winProbability(home, away);
  const awayWinPct = 100 - homeWinPct;
  const homeWinning = homeScore >= awayScore;

  const bucketRows = BUCKETS.map((bucket) => {
    const hList = homeGroups[bucket];
    const aList = awayGroups[bucket];
    const maxLen = Math.max(hList.length, aList.length);
    const rows: { home: Holding | null; away: Holding | null }[] = [];
    for (let i = 0; i < maxLen; i++) {
      rows.push({ home: hList[i] || null, away: aList[i] || null });
    }
    return { bucket, rows };
  }).filter((b) => b.rows.length > 0);

  return (
    <div className="space-y-3">
      {/* Compact Scoreboard + Game Score */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Team Headers */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
              homeWinning ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-secondary text-secondary-foreground"
            }`}>
              {home.avatar}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground truncate max-w-[100px]">{home.teamName}</p>
              <p className="text-[9px] text-muted-foreground">{home.record.wins}-{home.record.losses}</p>
            </div>
          </div>
          <span className="font-display text-[9px] font-bold text-muted-foreground uppercase tracking-wider">vs</span>
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
              !homeWinning ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-secondary text-secondary-foreground"
            }`}>
              {away.avatar}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-foreground truncate max-w-[100px]">{away.teamName}</p>
              <p className="text-[9px] text-muted-foreground">{away.record.wins}-{away.record.losses}</p>
            </div>
          </div>
        </div>

        {/* Game Score Row */}
        <div className="flex items-center justify-between border-t border-border px-3 py-2 bg-secondary/20">
          <div className="flex items-center gap-1.5">
            {homeScore >= 0 ? <TrendingUp className="h-3 w-3 text-gain" /> : <TrendingDown className="h-3 w-3 text-loss" />}
            <span className={`font-display text-sm font-bold ${homeScore >= 0 ? "text-gain" : "text-loss"}`}>
              {homeScore >= 0 ? "+" : ""}{homeScore.toFixed(2)}%
            </span>
            <span className="text-[8px] text-muted-foreground">({homeDiv.modifier.toFixed(2)}x)</span>
          </div>
          <span className="font-display text-[9px] font-bold text-muted-foreground tracking-wider">GAME SCORE</span>
          <div className="flex items-center gap-1.5 flex-row-reverse">
            {awayScore >= 0 ? <TrendingUp className="h-3 w-3 text-gain" /> : <TrendingDown className="h-3 w-3 text-loss" />}
            <span className={`font-display text-sm font-bold ${awayScore >= 0 ? "text-gain" : "text-loss"}`}>
              {awayScore >= 0 ? "+" : ""}{awayScore.toFixed(2)}%
            </span>
            <span className="text-[8px] text-muted-foreground">({awayDiv.modifier.toFixed(2)}x)</span>
          </div>
        </div>

        {/* Win Probability — inline */}
        <div className="border-t border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold w-7 text-right ${homeWinning ? "text-primary" : "text-muted-foreground"}`}>{homeWinPct}%</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden bg-secondary flex">
              <div className="h-full rounded-l-full bg-primary transition-all duration-500" style={{ width: `${homeWinPct}%` }} />
              <div className="h-full rounded-r-full bg-loss/60 transition-all duration-500" style={{ width: `${awayWinPct}%` }} />
            </div>
            <span className={`text-[10px] font-bold w-7 ${!homeWinning ? "text-loss" : "text-muted-foreground"}`}>{awayWinPct}%</span>
          </div>
        </div>
      </div>

      {/* Holdings by bucket */}
      {bucketRows.map(({ bucket, rows }) => (
        <div key={bucket} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-secondary/40 px-3 py-1.5">
            <h3 className="font-display text-[10px] font-bold text-foreground uppercase tracking-wider">{bucket}</h3>
          </div>
          <div className="divide-y divide-border/40">
            {rows.map((row, i) => (
              <HoldingRow key={`${bucket}-${i}`} home={row.home} away={row.away} bucket={bucket} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchupDetailView;
