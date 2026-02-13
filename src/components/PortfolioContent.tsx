import { useState, useMemo } from "react";
import { leagueMembers, Sector } from "@/data/mockData";
import { ArrowRightLeft, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
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

type TimeFilter = "1D" | "1W" | "1M" | "1Y";

const PortfolioContent = () => {
  const me = leagueMembers[0];
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1W");

  const totalBalance = me.currentValue;
  const totalInvested = me.totalInvested;

  // Simulate growth data per filter
  const { growthPct, chartData } = useMemo(() => {
    const history = me.weeklyHistory;
    let pct: number;
    let data: { label: string; value: number }[];

    switch (timeFilter) {
      case "1D": {
        // Simulate intraday from last weekly point
        const last = history[history.length - 1];
        const intraDaySteps = ["9:30", "10", "11", "12", "1", "2", "3", "4"];
        let cumulative = 0;
        data = intraDaySteps.map((label, i) => {
          cumulative += (last / intraDaySteps.length) * (0.6 + Math.sin(i) * 0.4);
          return { label, value: +(totalBalance - (last / 100) * totalBalance + cumulative * (totalBalance / 100)).toFixed(0) };
        });
        pct = last * 0.3; // partial day
        break;
      }
      case "1W": {
        pct = history[history.length - 1];
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const weekPct = pct;
        data = days.map((label, i) => ({
          label,
          value: +(totalBalance - (weekPct / 100) * totalBalance * (1 - i / (days.length - 1))).toFixed(0),
        }));
        break;
      }
      case "1M": {
        pct = history.slice(-4).reduce((a, b) => a + b, 0);
        let running = totalBalance - (pct / 100) * totalBalance;
        data = ["W1", "W2", "W3", "W4"].map((label, i) => {
          running += (history[history.length - 4 + i] / 100) * totalBalance;
          return { label, value: +running.toFixed(0) };
        });
        break;
      }
      case "1Y": {
        pct = ((totalBalance - totalInvested) / totalInvested) * 100;
        let running2 = totalInvested;
        data = history.map((w, i) => {
          running2 += (w / 100) * running2;
          return { label: `W${i + 1}`, value: +running2.toFixed(0) };
        });
        break;
      }
    }

    return { growthPct: pct, chartData: data };
  }, [timeFilter, me, totalBalance, totalInvested]);

  const isUp = growthPct >= 0;
  const dollarChange = (growthPct / 100) * totalBalance;

  // Calculate diversification modifier
  const divResult = useMemo(() => calculateDiversification(me.holdings), [me.holdings]);
  const gameScore = growthPct * divResult.modifier;
  const gameScoreUp = gameScore >= 0;

  const allHoldings = me.holdings;

  return (
    <>
      {/* Balance + Growth + Game Score */}
      <div className="text-center space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Portfolio Balance</p>
        <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
          ${totalBalance.toLocaleString()}
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          {isUp ? <TrendingUp className="h-4 w-4 text-gain" /> : <TrendingDown className="h-4 w-4 text-loss" />}
          <span className={`text-sm font-semibold ${isUp ? "text-gain" : "text-loss"}`}>
            {isUp ? "+" : ""}{dollarChange.toFixed(2)} ({isUp ? "+" : ""}{growthPct.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Game Score Bar */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Weekly Growth</span>
              <span className={`font-display text-lg font-bold ${isUp ? "text-gain" : "text-loss"}`}>
                {isUp ? "+" : ""}{growthPct.toFixed(2)}%
              </span>
            </div>
            <span className="text-muted-foreground font-display text-lg">×</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Modifier</span>
              <span className={`font-display text-lg font-bold ${divResult.modifier >= 1 ? "text-gain" : divResult.modifier >= 0.9 ? "text-warning" : "text-loss"}`}>
                {divResult.modifier.toFixed(2)}x
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" /> Game Score
            </span>
            <span className={`font-display text-2xl font-bold ${gameScoreUp ? "text-gain" : "text-loss"}`}>
              {gameScoreUp ? "+" : ""}{gameScore.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Time filter */}
      <div className="flex justify-center gap-1">
        {(["1D", "1W", "1M", "1Y"] as TimeFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              timeFilter === f
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-3 -mx-1">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isUp ? "hsl(142,70%,45%)" : "hsl(0,70%,50%)"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isUp ? "hsl(142,70%,45%)" : "hsl(0,70%,50%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isUp ? "hsl(142,70%,45%)" : "hsl(0,70%,50%)"}
                strokeWidth={2}
                fill="url(#portfolioGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="font-display text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Holdings ({allHoldings.length})
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {allHoldings.map(h => {
            const gainPct = ((h.currentPrice - h.avgCost) / h.avgCost) * 100;
            const holdingUp = gainPct >= 0;
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
                    <p className="text-[10px] text-muted-foreground">{h.name} · {h.shares} shares</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${(h.currentPrice * h.shares).toFixed(0)}
                    </p>
                    <p className={`text-[11px] font-medium ${holdingUp ? "text-gain" : "text-loss"}`}>
                      {holdingUp ? "+" : ""}{gainPct.toFixed(1)}%
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

      {/* Diversification Modifier */}
      <DiversificationModifier result={divResult} />
    </>
  );
};

export default PortfolioContent;
