import { useMemo, memo } from "react";
import { leagueMembers, Sector } from "@/data/mockData";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { Target, ArrowRightLeft } from "lucide-react";
import { calculateDiversification } from "@/lib/diversificationModifier";
import DiversificationModifier from "@/components/DiversificationModifier";

const SECTOR_COLORS: Record<Sector, string> = {
  "Tech": "bg-[hsl(200,70%,50%)]",
  "Healthcare": "bg-[hsl(340,70%,55%)]",
  "Energy": "bg-[hsl(35,90%,55%)]",
  "Financials": "bg-[hsl(220,60%,55%)]",
  "Consumer": "bg-[hsl(280,60%,55%)]",
  "Index/ETF": "bg-primary",
  "International": "bg-[hsl(170,60%,45%)]",
  "Real Estate": "bg-[hsl(25,80%,50%)]",
  "Crypto": "bg-[hsl(45,90%,50%)]",
  "Industrials": "bg-[hsl(0,0%,55%)]",
};

const LineupPage = () => {
  const me = leagueMembers[0];
  const allHoldings = me.holdings;
  const diversification = useMemo(() => calculateDiversification(me.holdings), [me.holdings]);

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      <LeagueHeader />
      <main className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Set Lineup
          </h2>
          <span className="text-xs text-muted-foreground">Week 13 deadline: Fri 6PM</span>
        </div>

        {/* Diversification Modifier */}
        <DiversificationModifier result={diversification} />

        {/* Game Modifiers Summary */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Modifier</p>
            <p className={`mt-1 font-display text-lg font-bold ${diversification.modifier < 1 ? "text-warning" : "text-gain"}`}>
              {diversification.modifier.toFixed(2)}x
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Diversification</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Worst Bucket</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground truncate">
              {diversification.worstDeviation.toFixed(0)}%
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{diversification.worstBucket}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Multi</p>
            <p className={`mt-1 font-display text-lg font-bold ${
              me.gameModifiers.totalMultiplier >= 1 ? "text-gain" : "text-loss"
            }`}>
              {me.gameModifiers.totalMultiplier.toFixed(2)}x
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Applied to weekly score</p>
          </div>
        </div>

        {/* Holdings */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 py-2.5">
            <p className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">
              HOLDINGS ({allHoldings.length})
            </p>
          </div>
          <div className="divide-y divide-border/50">
            {allHoldings.map(h => {
              const gainPct = ((h.currentPrice - h.avgCost) / h.avgCost) * 100;
              const isUp = gainPct >= 0;
              return (
                <div key={h.symbol} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-display text-[10px] font-bold text-secondary-foreground">
                      {h.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                        <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${SECTOR_COLORS[h.sector]} text-white`}>
                          {h.sector}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{h.name} · {h.weeksHeld}w held</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">${(h.currentPrice * h.shares).toFixed(0)}</p>
                      <p className={`text-[11px] font-medium ${isUp ? "text-gain" : "text-loss"}`}>
                        {isUp ? "+" : ""}{gainPct.toFixed(1)}%
                      </p>
                    </div>
                    <button className="rounded-lg p-1.5 text-muted-foreground active:bg-accent">
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
    </PageTransition>
  );
};

export default LineupPage;
