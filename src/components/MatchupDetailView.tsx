import { useMemo } from "react";
import { LeagueMember, Holding, weeklyMatchups, leagueMembers } from "@/data/mockData";
import { classifyHolding, AssetBucket, BUCKETS, calculateDiversification } from "@/lib/diversificationModifier";
import { TrendingUp, TrendingDown, Shield } from "lucide-react";

/** Group active holdings by diversity bucket */
function groupByBucket(holdings: Holding[]): Record<AssetBucket, Holding[]> {
  const groups: Record<AssetBucket, Holding[]> = {
    "US Stocks": [],
    "Intl Stocks": [],
    "US Bonds": [],
    "Intl Bonds": [],
  };
  for (const h of holdings.filter((h) => h.isActive)) {
    groups[classifyHolding(h.sector)].push(h);
  }
  return groups;
}

/** Simple win-probability estimate based on adjusted growth difference */
function winProbability(home: LeagueMember, away: LeagueMember): number {
  const hAdj = home.weeklyGrowthPct * home.gameModifiers.totalMultiplier;
  const aAdj = away.weeklyGrowthPct * away.gameModifiers.totalMultiplier;
  const diff = hAdj - aAdj;
  // Sigmoid-ish: clamp between 5-95%
  const raw = 50 + diff * 8;
  return Math.max(5, Math.min(95, Math.round(raw)));
}

const HoldingRow = ({
  home,
  away,
  bucket,
}: {
  home: Holding | null;
  away: Holding | null;
  bucket: AssetBucket;
}) => {
  const growthPct = (h: Holding) => ((h.currentPrice - h.avgCost) / h.avgCost) * 100;

  return (
    <div className="flex items-center gap-1 py-2 px-2">
      {/* Home holding */}
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

      {/* Center badge */}
      <div className="shrink-0 w-10 flex justify-center">
        <span className="text-[8px] font-bold text-muted-foreground bg-secondary rounded px-1 py-0.5">
          {bucket === "US Stocks" ? "US" : bucket === "Intl Stocks" ? "INTL" : bucket === "US Bonds" ? "BND" : "IB"}
        </span>
      </div>

      {/* Away holding */}
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

  const homeGroups = useMemo(() => home ? groupByBucket(home.holdings) : { "US Stocks": [], "Intl Stocks": [], "US Bonds": [], "Intl Bonds": [] }, [home]);
  const awayGroups = useMemo(() => away ? groupByBucket(away.holdings) : { "US Stocks": [], "Intl Stocks": [], "US Bonds": [], "Intl Bonds": [] }, [away]);
  const homeDiv = useMemo(() => home ? calculateDiversification(home.holdings) : { allocations: [], worstDeviation: 0, worstBucket: "US Stocks" as AssetBucket, modifier: 1 }, [home]);
  const awayDiv = useMemo(() => away ? calculateDiversification(away.holdings) : { allocations: [], worstDeviation: 0, worstBucket: "US Stocks" as AssetBucket, modifier: 1 }, [away]);

  if (!matchup || !home || !away) return <p className="text-sm text-muted-foreground text-center py-8">No matchup this week.</p>;

  const homeAdj = home.weeklyGrowthPct * home.gameModifiers.totalMultiplier;
  const awayAdj = away.weeklyGrowthPct * away.gameModifiers.totalMultiplier;
  const homeWinPct = winProbability(home, away);
  const awayWinPct = 100 - homeWinPct;
  const homeWinning = homeAdj >= awayAdj;

  // Build matched rows per bucket
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
    <div className="space-y-4">
      {/* Scoreboard */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Home */}
          <div className="flex items-center gap-2.5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
              homeWinning ? "bg-primary text-primary-foreground ring-2 ring-primary/40" : "bg-secondary text-secondary-foreground"
            }`}>
              {home.avatar}
            </div>
            <div>
              <p className="font-display text-lg font-bold text-foreground">${home.currentValue.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{home.teamName}</p>
              <p className="text-[9px] text-muted-foreground">{home.record.wins}-{home.record.losses}</p>
            </div>
          </div>

          {/* Away */}
          <div className="flex items-center gap-2.5 flex-row-reverse">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${
              !homeWinning ? "bg-primary text-primary-foreground ring-2 ring-primary/40" : "bg-secondary text-secondary-foreground"
            }`}>
              {away.avatar}
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold text-foreground">${away.currentValue.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{away.teamName}</p>
              <p className="text-[9px] text-muted-foreground">{away.record.wins}-{away.record.losses}</p>
            </div>
          </div>
        </div>

        {/* Weekly growth score */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-secondary/30">
          <div className="flex items-center gap-1.5">
            {homeAdj >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-gain" /> : <TrendingDown className="h-3.5 w-3.5 text-loss" />}
            <span className={`font-display text-sm font-bold ${homeAdj >= 0 ? "text-gain" : "text-loss"}`}>
              {homeAdj >= 0 ? "+" : ""}{homeAdj.toFixed(2)}%
            </span>
            {home.gameModifiers.totalMultiplier !== 1 && (
              <span className="text-[9px] text-muted-foreground">({home.gameModifiers.totalMultiplier.toFixed(2)}x)</span>
            )}
          </div>
          <span className="font-display text-[10px] font-bold text-muted-foreground">WEEKLY SCORE</span>
          <div className="flex items-center gap-1.5 flex-row-reverse">
            {awayAdj >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-gain" /> : <TrendingDown className="h-3.5 w-3.5 text-loss" />}
            <span className={`font-display text-sm font-bold ${awayAdj >= 0 ? "text-gain" : "text-loss"}`}>
              {awayAdj >= 0 ? "+" : ""}{awayAdj.toFixed(2)}%
            </span>
            {away.gameModifiers.totalMultiplier !== 1 && (
              <span className="text-[9px] text-muted-foreground">({away.gameModifiers.totalMultiplier.toFixed(2)}x)</span>
            )}
          </div>
        </div>
      </div>

      {/* Win Probability Meter */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Win Projection</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${homeWinning ? "text-primary" : "text-muted-foreground"}`}>{homeWinPct}%</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden bg-secondary flex">
            <div
              className="h-full rounded-l-full bg-primary transition-all duration-500"
              style={{ width: `${homeWinPct}%` }}
            />
            <div
              className="h-full rounded-r-full bg-loss/60 transition-all duration-500"
              style={{ width: `${awayWinPct}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${!homeWinning ? "text-loss" : "text-muted-foreground"}`}>{awayWinPct}%</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[9px] text-muted-foreground">{home.name}</p>
          <p className="text-[9px] text-muted-foreground">{away.name}</p>
        </div>
      </div>

      {/* Diversification modifiers comparison */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-card p-2.5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Div. Modifier</p>
            <p className={`font-display text-sm font-bold ${homeDiv.modifier < 1 ? "text-warning" : "text-gain"}`}>
              {homeDiv.modifier.toFixed(2)}x
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-2.5 flex items-center gap-2 flex-row-reverse">
          <Shield className="h-4 w-4 text-loss/60 shrink-0" />
          <div className="text-right">
            <p className="text-[9px] text-muted-foreground uppercase">Div. Modifier</p>
            <p className={`font-display text-sm font-bold ${awayDiv.modifier < 1 ? "text-warning" : "text-gain"}`}>
              {awayDiv.modifier.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      {/* Holdings by bucket */}
      {bucketRows.map(({ bucket, rows }) => (
        <div key={bucket} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-secondary/40 px-3 py-2">
            <h3 className="font-display text-[11px] font-bold text-foreground uppercase tracking-wider">{bucket}</h3>
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
