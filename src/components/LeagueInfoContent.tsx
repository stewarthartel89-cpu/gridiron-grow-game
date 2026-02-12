import { useLeagueData } from "@/hooks/useLeagueData";
import Standings from "@/components/Standings";
import { Trophy, Crown, Users, Calendar, Shield, DollarSign, Settings as SettingsIcon, Copy, Check, Info } from "lucide-react";
import { useState } from "react";
import { TARGET_ALLOCATION, BUCKETS, deviationToModifier } from "@/lib/diversificationModifier";

const LeagueInfoContent = () => {
  const { settings, members, loading } = useLeagueData();
  const [copied, setCopied] = useState(false);

  const copyInvite = () => {
    if (settings?.inviteCode) {
      navigator.clipboard.writeText(settings.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !settings) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  const playoffBound = members.slice(0, settings.playoffTeams);
  const weeksAway = Math.max(0, settings.playoffStartWeek - settings.currentWeek);

  return (
    <>
      {/* League Info */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-xp" />
            {settings.name}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Crown className="h-3.5 w-3.5 text-xp" />
            <div>
              <p className="text-[10px] text-muted-foreground">Commissioner</p>
              <p className="text-xs font-semibold text-foreground">{settings.commissionerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Weekly Buy-In</p>
              <p className="text-xs font-semibold text-foreground">${settings.weeklyDeposit}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-bonus" />
            <div>
              <p className="text-[10px] text-muted-foreground">Season</p>
              <p className="text-xs font-semibold text-foreground">Wk {settings.currentWeek}/{settings.seasonLength}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Members</p>
              <p className="text-xs font-semibold text-foreground">{settings.memberCount}/{settings.maxMembers}</p>
            </div>
          </div>
        </div>
        {settings.inviteCode && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Invite Code</p>
              <p className="font-display text-sm font-bold tracking-[0.2em] text-primary">{settings.inviteCode.toUpperCase()}</p>
            </div>
            <button onClick={copyInvite} className="rounded-lg p-2 text-muted-foreground active:bg-accent">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Diversification Modifier Rules */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-bonus" />
          <h3 className="font-display text-sm font-bold text-foreground">DIVERSIFICATION MODIFIER</h3>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Target Allocation</p>
        <div className="space-y-1.5 mb-4">
          {BUCKETS.map((bucket) => (
            <div key={bucket} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{bucket}</span>
              <span className="text-xs font-semibold text-foreground">{TARGET_ALLOCATION[bucket]}%</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-secondary p-3">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The modifier compares your portfolio to the ideal allocation. The <strong>worst bucket deviation</strong> determines your multiplier.
            </p>
          </div>
        </div>
      </div>

      {/* Playoff Picture */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">
          🏆 PLAYOFF PICTURE ({weeksAway > 0 ? `${weeksAway} weeks away` : "Playoffs!"})
        </h3>
        {playoffBound.length > 0 ? (
          <div className="space-y-2">
            {playoffBound.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2.5 rounded-lg bg-gain/5 border border-gain/20 px-3 py-2">
                <span className="font-display text-sm font-bold text-primary">#{i + 1}</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary font-display text-[8px] font-bold text-secondary-foreground">{m.avatar}</div>
                <p className="text-xs font-semibold text-foreground flex-1">{m.teamName}</p>
                <span className="text-[10px] font-bold text-gain">{m.wins}-{m.losses}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Not enough members for playoff seeding yet.</p>
        )}
      </div>

      {/* Full Standings */}
      <Standings />
    </>
  );
};

export default LeagueInfoContent;
