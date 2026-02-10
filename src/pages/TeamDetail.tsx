import { useParams, useNavigate } from "react-router-dom";
import { leagueMembers } from "@/data/mockData";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = leagueMembers.find((m) => m.id === id);

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Team not found</p>
      </div>
    );
  }

  const totalReturn = ((member.currentValue - member.totalInvested) / member.totalInvested) * 100;
  const totalGain = member.currentValue - member.totalInvested;
  const chartData = member.weeklyHistory.map((pct, i) => ({
    week: `W${i + 1}`,
    growth: pct,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
              {member.avatar}
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">{member.teamName}</h1>
              <p className="text-xs text-muted-foreground">{member.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5">
        {/* Portfolio Value Card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Portfolio Value</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">
            ${member.currentValue.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${totalReturn >= 0 ? "text-gain" : "text-loss"}`}>
              {totalReturn >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}% all time
            </span>
            <span className={`text-sm font-semibold ${totalGain >= 0 ? "text-gain" : "text-loss"}`}>
              {totalGain >= 0 ? "+" : ""}${Math.abs(totalGain).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Record</p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">
              {member.record.wins}-{member.record.losses}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This Week</p>
            <p className={`mt-1 font-display text-lg font-bold ${member.weeklyGrowthPct >= 0 ? "text-gain" : "text-loss"}`}>
              {member.weeklyGrowthPct >= 0 ? "+" : ""}{member.weeklyGrowthPct.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</p>
            <p className={`mt-1 font-display text-lg font-bold ${member.streak.startsWith("W") ? "text-gain" : "text-loss"}`}>
              {member.streak}
            </p>
          </div>
        </div>

        {/* Weekly Performance Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold text-foreground">Weekly Growth %</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220, 18%, 10%)",
                    border: "1px solid hsl(220, 14%, 16%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(210, 20%, 95%)",
                  }}
                  formatter={(value: number) => [`${value >= 0 ? "+" : ""}${value.toFixed(1)}%`, "Growth"]}
                />
                <Area
                  type="monotone"
                  dataKey="growth"
                  stroke="hsl(152, 60%, 48%)"
                  strokeWidth={2}
                  fill="url(#gainGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Holdings */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold text-foreground">Holdings</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              {member.totalInvested.toLocaleString()} invested
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {member.holdings.map((h) => {
              const gainPct = ((h.currentPrice - h.avgCost) / h.avgCost) * 100;
              const isUp = gainPct >= 0;
              return (
                <div key={h.symbol} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-display text-[10px] font-bold text-secondary-foreground">
                      {h.symbol}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">{h.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${(h.currentPrice * h.shares).toFixed(0)}
                    </p>
                    <p className={`text-[11px] font-medium ${isUp ? "text-gain" : "text-loss"}`}>
                      {isUp ? "+" : ""}{gainPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Allocation Bar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold text-foreground">Allocation</h2>
          <div className="flex h-3 overflow-hidden rounded-full">
            {member.holdings.map((h, i) => {
              const colors = [
                "bg-primary",
                "bg-[hsl(200,70%,50%)]",
                "bg-[hsl(35,90%,55%)]",
                "bg-[hsl(280,60%,55%)]",
              ];
              return (
                <div
                  key={h.symbol}
                  className={`${colors[i % colors.length]}`}
                  style={{ width: `${h.allocation}%` }}
                />
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {member.holdings.map((h, i) => {
              const dotColors = [
                "bg-primary",
                "bg-[hsl(200,70%,50%)]",
                "bg-[hsl(35,90%,55%)]",
                "bg-[hsl(280,60%,55%)]",
              ];
              return (
                <div key={h.symbol} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`h-2 w-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                  {h.symbol} {h.allocation}%
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamDetail;
