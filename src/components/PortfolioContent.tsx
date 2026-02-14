import { useState, useMemo } from "react";
import { leagueMembers, Sector } from "@/data/mockData";
import { ArrowRightLeft, TrendingUp, TrendingDown, Zap, Trophy, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { calculateDiversification } from "@/lib/diversificationModifier";
import DiversificationModifier from "@/components/DiversificationModifier";
import { motion } from "framer-motion";

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
      {/* Hero — Balance + Growth */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.06] p-5 pb-4 card-glow-primary noise-overlay"
      >
        {/* Ambient glow orb */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative z-10 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Flame className="h-3 w-3" />
            Portfolio Balance
          </div>

          <motion.h2
            className="font-display text-5xl font-bold text-foreground tracking-tight glow-balance animate-float"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 200 }}
          >
            ${totalBalance.toLocaleString()}
          </motion.h2>

          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold ${
              isUp
                ? "bg-gain/15 text-gain"
                : "bg-loss/15 text-loss"
            }`}>
              {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isUp ? "+" : ""}{dollarChange.toFixed(2)}
            </span>
            <span className={`text-sm font-semibold ${isUp ? "text-gain" : "text-loss"}`}>
              ({isUp ? "+" : ""}{growthPct.toFixed(2)}%)
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Game Score Bar — the money stat */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative overflow-hidden rounded-xl border border-border bg-card card-elevated"
      >
        {/* Subtle shimmer accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-shimmer" />

        <div className="flex items-stretch divide-x divide-border">
          <div className="flex-1 p-3 text-center">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold block">Growth</span>
            <span className={`font-display text-xl font-bold ${isUp ? "text-gain" : "text-loss"}`}>
              {isUp ? "+" : ""}{growthPct.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center px-3">
            <span className="text-muted-foreground/60 font-display text-lg">×</span>
          </div>
          <div className="flex-1 p-3 text-center">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold block">Modifier</span>
            <span className={`font-display text-xl font-bold ${
              divResult.modifier >= 1 ? "text-gain" : divResult.modifier >= 0.9 ? "text-warning" : "text-loss"
            }`}>
              {divResult.modifier.toFixed(2)}x
            </span>
          </div>
          <div className="flex-1 p-3 text-center relative">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 text-primary" /> Score
            </span>
            <motion.span
              className={`font-display text-2xl font-bold glow-score ${gameScoreUp ? "text-gain" : "text-loss"}`}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              {gameScoreUp ? "+" : ""}{gameScore.toFixed(2)}%
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Time filter */}
      <div className="flex justify-center gap-1 bg-secondary/50 rounded-full p-1 mx-auto w-fit">
        {(["1D", "1W", "1M", "1Y"] as TimeFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              timeFilter === f
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card card-elevated p-4 -mx-1"
      >
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isUp ? "hsl(152,100%,45%)" : "hsl(0,70%,50%)"} stopOpacity={0.4} />
                  <stop offset="50%" stopColor={isUp ? "hsl(152,100%,45%)" : "hsl(0,70%,50%)"} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={isUp ? "hsl(152,100%,45%)" : "hsl(0,70%,50%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(215,12%,55%)" }}
              />
              <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220,18%,10%)",
                  border: "1px solid hsl(152,100%,45%,0.2)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 8px 32px hsl(152,100%,45%,0.1)",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isUp ? "hsl(152,100%,45%)" : "hsl(0,70%,50%)"}
                strokeWidth={2.5}
                fill="url(#portfolioGrad)"
                dot={false}
                activeDot={{ r: 5, fill: isUp ? "hsl(152,100%,45%)" : "hsl(0,70%,50%)", stroke: "hsl(220,18%,10%)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Holdings list */}
      <div className="rounded-xl border border-border bg-card card-elevated overflow-hidden">
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
