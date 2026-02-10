import { memo, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { leagueMembers, LeagueMember, Sector } from "@/data/mockData";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Zap, Shield, AlertTriangle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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

const GrowthChart = memo(({ data }: { data: { week: string; growth: number }[] }) => (
  <div className="h-40">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="gainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="week" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={35} />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 20%, 95%)" }}
          formatter={(value: number) => [`${value >= 0 ? "+" : ""}${value.toFixed(1)}%`, "Growth"]}
        />
        <Area type="monotone" dataKey="growth" stroke="hsl(152, 60%, 48%)" strokeWidth={2} fill="url(#gainGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));
GrowthChart.displayName = "GrowthChart";

const HoldingsList = memo(({ member }: { member: LeagueMember }) => (
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
        const isFatigued = h.weeksHeld >= 10;
        return (
          <div key={h.symbol} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-display text-[10px] font-bold text-secondary-foreground">
                  {h.symbol}
                </div>
                {isFatigued && (
                  <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-warning text-[7px]">
                    😴
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{h.symbol}</p>
                  <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${SECTOR_COLORS[h.sector]} text-white`}>{h.sector}</span>
                  {!h.isActive && <span className="rounded px-1 py-0.5 text-[8px] font-bold bg-secondary text-muted-foreground">BENCH</span>}
                </div>
                <p className="text-[11px] text-muted-foreground">{h.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">${(h.currentPrice * h.shares).toFixed(0)}</p>
              <p className={`text-[11px] font-medium ${isUp ? "text-gain" : "text-loss"}`}>
                {isUp ? "+" : ""}{gainPct.toFixed(1)}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
));
HoldingsList.displayName = "HoldingsList";

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const member = leagueMembers.find((m) => m.id === id);

  const chartData = useMemo(
    () => member?.weeklyHistory.map((pct, i) => ({ week: `W${i + 1}`, growth: pct })) ?? [],
    [member]
  );

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Team not found</p>
      </div>
    );
  }

  const totalReturn = ((member.currentValue - member.totalInvested) / member.totalInvested) * 100;
  const totalGain = member.currentValue - member.totalInvested;
  const mod = member.gameModifiers;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                {member.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bonus text-[8px] font-bold text-bonus-foreground">
                {member.level}
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">{member.teamName}</h1>
              <p className="text-xs text-muted-foreground">{member.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-xp/15 px-2 py-1">
            <Zap className="h-3 w-3 text-xp" />
            <span className="text-[10px] font-bold text-xp">{member.xp.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5">
        {/* Badges */}
        {member.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {member.badges.map(b => (
              <span key={b} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">{b}</span>
            ))}
          </div>
        )}

        {/* Portfolio Value Card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Portfolio Value</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">${member.currentValue.toLocaleString()}</p>
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
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Record</p>
            <p className="mt-0.5 font-display text-base font-bold text-foreground">{member.record.wins}-{member.record.losses}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">This Week</p>
            <p className={`mt-0.5 font-display text-base font-bold ${member.weeklyGrowthPct >= 0 ? "text-gain" : "text-loss"}`}>
              {member.weeklyGrowthPct >= 0 ? "+" : ""}{member.weeklyGrowthPct.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Streak</p>
            <p className={`mt-0.5 font-display text-base font-bold ${member.streak.startsWith("W") ? "text-gain" : "text-loss"}`}>{member.streak}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Multi</p>
            <p className={`mt-0.5 font-display text-base font-bold ${mod.totalMultiplier >= 1 ? "text-gain" : "text-warning"}`}>{mod.totalMultiplier.toFixed(2)}x</p>
          </div>
        </div>

        {/* Diversity Score */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${mod.diversityScore >= 60 ? "text-gain" : "text-warning"}`} />
              <h2 className="text-sm font-bold text-foreground">Diversity Score</h2>
            </div>
            <span className={`font-display text-lg font-bold ${mod.diversityScore >= 80 ? "text-gain" : mod.diversityScore >= 60 ? "text-warning" : "text-loss"}`}>
              {mod.diversityScore}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className={`h-full rounded-full ${mod.diversityScore >= 80 ? "bg-gain" : mod.diversityScore >= 60 ? "bg-warning" : "bg-loss"}`} style={{ width: `${mod.diversityScore}%` }} />
          </div>
          {mod.diversityScore < 60 && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-warning">
              <AlertTriangle className="h-3 w-3" /> 0.9x penalty active — diversify to remove
            </p>
          )}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold text-foreground">Weekly Growth %</h2>
          <GrowthChart data={chartData} />
        </div>

        {/* Holdings */}
        <HoldingsList member={member} />

        {/* Allocation by Sector */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-bold text-foreground">Sector Allocation</h2>
          <div className="flex h-3 overflow-hidden rounded-full">
            {member.holdings.filter(h => h.isActive).map((h) => (
              <div key={h.symbol} className={SECTOR_COLORS[h.sector]} style={{ width: `${h.allocation}%` }} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {member.holdings.filter(h => h.isActive).map((h) => (
              <div key={h.symbol} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${SECTOR_COLORS[h.sector]}`} />
                {h.symbol} {h.allocation}%
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamDetail;
