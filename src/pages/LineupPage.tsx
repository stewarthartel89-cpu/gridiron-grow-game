import { useState, memo } from "react";
import { leagueMembers, Sector } from "@/data/mockData";
import LeagueHeader from "@/components/LeagueHeader";
import { Target, Shield, AlertTriangle, Zap, ArrowRightLeft, Info } from "lucide-react";

const SECTORS: Sector[] = ["Tech", "Healthcare", "Energy", "Financials", "Consumer", "Index/ETF", "International", "Real Estate", "Crypto", "Industrials"];

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

const DiversityGauge = memo(({ score }: { score: number }) => {
  const color = score >= 80 ? "text-gain" : score >= 60 ? "text-warning" : "text-loss";
  const bg = score >= 80 ? "bg-gain" : score >= 60 ? "bg-warning" : "bg-loss";
  const label = score >= 80 ? "EXCELLENT" : score >= 60 ? "PASSING" : "PENALTY ACTIVE";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className={`h-4 w-4 ${color}`} />
          <h3 className="font-display text-sm font-bold text-foreground">DIVERSITY SCORE</h3>
        </div>
        <span className={`text-xs font-bold ${color}`}>{label}</span>
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span className={`font-display text-4xl font-bold ${color}`}>{score}</span>
        <span className="text-sm text-muted-foreground mb-1">/100</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${bg} transition-all`} style={{ width: `${score}%` }} />
      </div>
      {score < 60 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-loss/10 p-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-loss mt-0.5" />
          <p className="text-[11px] text-loss">
            Your lineup fails diversity validation. <strong>0.9x scoring multiplier</strong> is active. Add exposure to more sectors to remove penalty.
          </p>
        </div>
      )}
      {score >= 80 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-gain/10 p-2.5">
          <Zap className="h-4 w-4 shrink-0 text-gain mt-0.5" />
          <p className="text-[11px] text-gain">
            Great diversification! You may qualify for <strong>stacking bonuses</strong> if correlated plays outperform.
          </p>
        </div>
      )}
    </div>
  );
});
DiversityGauge.displayName = "DiversityGauge";

const LineupPage = () => {
  const me = leagueMembers[0]; // Mock current user
  const [activeTab, setActiveTab] = useState<"active" | "bench">("active");
  const activeHoldings = me.holdings.filter(h => h.isActive);
  const benchHoldings = me.holdings.filter(h => !h.isActive);

  return (
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

        {/* Diversity Gauge */}
        <DiversityGauge score={me.gameModifiers.diversityScore} />

        {/* Sector Exposure */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-bold text-foreground">SECTOR EXPOSURE</h3>
            <button className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Info className="h-3 w-3" />
              Max 40% per sector
            </button>
          </div>
          <div className="space-y-2">
            {SECTORS.filter(s => (me.sectorExposure[s] || 0) > 0).map(sector => {
              const pct = me.sectorExposure[sector] || 0;
              const isOver = pct > 40;
              return (
                <div key={sector}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-muted-foreground">{sector}</span>
                    <span className={`text-[11px] font-bold ${isOver ? "text-warning" : "text-foreground"}`}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${isOver ? "bg-warning" : SECTOR_COLORS[sector]}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Modifiers Summary */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stacking</p>
            <p className={`mt-1 font-display text-lg font-bold ${me.gameModifiers.stackingBonus > 0 ? "text-bonus" : "text-muted-foreground"}`}>
              {me.gameModifiers.stackingBonus > 0 ? `+${(me.gameModifiers.stackingBonus * 100).toFixed(0)}%` : "None"}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Correlated sector plays</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Volatility</p>
            <p className={`mt-1 font-display text-lg font-bold ${me.gameModifiers.volatilityBonus > 0 ? "text-primary" : "text-muted-foreground"}`}>
              {me.gameModifiers.volatilityBonus > 0 ? `+${(me.gameModifiers.volatilityBonus * 100).toFixed(0)}%` : "None"}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5">High-vol outperformance</p>
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

        {/* Active / Bench Tabs */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-2.5 text-center font-display text-xs font-bold transition-colors ${
                activeTab === "active" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              ACTIVE LINEUP ({activeHoldings.length})
            </button>
            <button
              onClick={() => setActiveTab("bench")}
              className={`flex-1 py-2.5 text-center font-display text-xs font-bold transition-colors ${
                activeTab === "bench" ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              BENCH ({benchHoldings.length})
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {(activeTab === "active" ? activeHoldings : benchHoldings).map(h => {
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
  );
};

export default LineupPage;
