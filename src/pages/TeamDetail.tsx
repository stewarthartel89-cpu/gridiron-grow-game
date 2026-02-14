import { memo, useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLeague } from "@/contexts/LeagueContext";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { calculateDiversification } from "@/lib/diversificationModifier";
import DiversificationModifier from "@/components/DiversificationModifier";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { leagueMembers } from "@/data/mockData";

type Sector = "Tech" | "Healthcare" | "Energy" | "Financials" | "Consumer" | "Index/ETF" | "International" | "Real Estate" | "Crypto" | "Industrials";

const SECTOR_COLORS: Record<string, string> = {
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

interface HoldingData {
  symbol: string;
  name: string;
  shares: number;
  avg_cost: number;
  current_price: number;
  allocation: number;
  sector: string;
  weeks_held: number;
  // is_active is deprecated – all holdings are always in play
}

interface TeamData {
  displayName: string;
  teamName: string;
  avatar: string;
  wins: number;
  losses: number;
  streak: string;
  xp: number;
  level: number;
  holdings: HoldingData[];
}

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

const HoldingsList = memo(({ holdings }: { holdings: HoldingData[] }) => {
  const totalInvested = holdings.reduce((sum, h) => sum + h.avg_cost * h.shares, 0);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">Holdings</h2>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3" />
          {Math.round(totalInvested).toLocaleString()} invested
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {holdings.map((h) => {
          const gainPct = h.avg_cost > 0 ? ((h.current_price - h.avg_cost) / h.avg_cost) * 100 : 0;
          const isUp = gainPct >= 0;
          const isFatigued = h.weeks_held >= 10;
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
                    <span className={`rounded px-1 py-0.5 text-[8px] font-bold ${SECTOR_COLORS[h.sector] || "bg-secondary"} text-white`}>{h.sector}</span>
                    {/* All holdings are always in play */}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{h.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${(h.current_price * h.shares).toFixed(0)}</p>
                <p className={`text-[11px] font-medium ${isUp ? "text-gain" : "text-loss"}`}>
                  {isUp ? "+" : ""}{gainPct.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
HoldingsList.displayName = "HoldingsList";

const TeamDetail = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const { leagueId } = useLeague();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Check if this is a mock member first
    const mockMember = leagueMembers.find((m) => m.id === userId);
    if (mockMember) {
      const name = mockMember.name;
      setTeam({
        displayName: name,
        teamName: mockMember.teamName,
        avatar: mockMember.avatar,
        wins: mockMember.record.wins,
        losses: mockMember.record.losses,
        streak: mockMember.streak,
        xp: mockMember.xp,
        level: mockMember.level,
        holdings: mockMember.holdings.map((h) => ({
          symbol: h.symbol,
          name: h.name,
          shares: h.shares,
          avg_cost: h.avgCost,
          current_price: h.currentPrice,
          allocation: h.allocation,
          sector: h.sector,
          weeks_held: h.weeksHeld,
        })),
      });
      setLoading(false);
      return;
    }

    if (!leagueId) return;

    const fetchTeam = async () => {
      setLoading(true);

      const [profileRes, memberRes, holdingsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, team_name, xp, level, avatar_url").eq("user_id", userId).maybeSingle(),
        supabase.from("league_members").select("wins, losses, streak").eq("league_id", leagueId).eq("user_id", userId).maybeSingle(),
        supabase.from("holdings").select("*").eq("league_id", leagueId).eq("user_id", userId),
      ]);

      const profile = profileRes.data;
      const member = memberRes.data;
      const holdings = holdingsRes.data || [];

      if (!profile) {
        setTeam(null);
        setLoading(false);
        return;
      }

      const name = profile.display_name || "Unknown";
      setTeam({
        displayName: name,
        teamName: profile.team_name || name,
        avatar: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        wins: member?.wins || 0,
        losses: member?.losses || 0,
        streak: member?.streak || "",
        xp: profile.xp || 0,
        level: profile.level || 1,
        holdings,
      });
      setLoading(false);
    };

    fetchTeam();
  }, [userId, leagueId]);

  const totalInvested = useMemo(() => team?.holdings.reduce((sum, h) => sum + h.avg_cost * h.shares, 0) ?? 0, [team]);
  const currentValue = useMemo(() => team?.holdings.reduce((sum, h) => sum + h.current_price * h.shares, 0) ?? 0, [team]);
  const totalReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  const totalGain = currentValue - totalInvested;

  const activeHoldings = useMemo(() => team?.holdings || [], [team]);
  const diversification = useMemo(() => calculateDiversification(team?.holdings || []), [team]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Team not found</p>
        <button onClick={() => navigate("/")} className="text-sm text-primary underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
              {team.avatar}
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">{team.teamName}</h1>
              <p className="text-xs text-muted-foreground">{team.displayName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
        {/* Portfolio Value Card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Portfolio Value</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">
            ${currentValue > 0 ? currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}
          </p>
          {totalInvested > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 text-sm font-semibold ${totalReturn >= 0 ? "text-gain" : "text-loss"}`}>
                {totalReturn >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}% all time
              </span>
              <span className={`text-sm font-semibold ${totalGain >= 0 ? "text-gain" : "text-loss"}`}>
                {totalGain >= 0 ? "+" : ""}${Math.abs(totalGain).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Record</p>
            <p className="mt-0.5 font-display text-base font-bold text-foreground">{team.wins}-{team.losses}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Streak</p>
            <p className={`mt-0.5 font-display text-base font-bold ${team.streak.startsWith("W") ? "text-gain" : team.streak.startsWith("L") ? "text-loss" : "text-muted-foreground"}`}>
              {team.streak || "—"}
            </p>
          </div>
        </div>

        {/* Diversification Modifier */}
        <DiversificationModifier result={diversification} />

        {/* Holdings */}
        {team.holdings.length > 0 ? (
          <>
            <HoldingsList holdings={team.holdings} />

            {/* Allocation by Sector */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-bold text-foreground">Sector Allocation</h2>
              <div className="flex h-3 overflow-hidden rounded-full">
                {activeHoldings.map((h) => (
                  <div key={h.symbol} className={SECTOR_COLORS[h.sector] || "bg-secondary"} style={{ width: `${h.allocation}%` }} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {activeHoldings.map((h) => (
                  <div key={h.symbol} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className={`h-2 w-2 rounded-full ${SECTOR_COLORS[h.sector] || "bg-secondary"}`} />
                    {h.symbol} {h.allocation}%
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No holdings yet. Start building your portfolio!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamDetail;
