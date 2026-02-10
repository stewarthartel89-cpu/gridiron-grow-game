import LeagueHeader from "@/components/LeagueHeader";
import Standings from "@/components/Standings";
import PageTransition from "@/components/PageTransition";
import { useLeagueData } from "@/hooks/useLeagueData";
import { Trophy, Crown, Users, Calendar, Shield, DollarSign, Settings as SettingsIcon, Copy, Check } from "lucide-react";
import { useState } from "react";

const LeaguePage = () => {
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
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  const playoffBound = members.slice(0, settings.playoffTeams);
  const weeksAway = Math.max(0, settings.playoffStartWeek - settings.currentWeek);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <LeagueHeader />
        <main className="mx-auto max-w-2xl px-4 py-5 space-y-5">
          {/* League Info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-xp" />
                {settings.name}
              </h2>
              <button className="rounded-lg p-2 text-muted-foreground active:bg-accent">
                <SettingsIcon className="h-4 w-4" />
              </button>
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

            {/* Invite Code */}
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

          {/* Diversity Rules */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-bonus" />
              <h3 className="font-display text-sm font-bold text-foreground">LEAGUE RULES</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diversity Strictness</span>
                <span className="font-semibold text-foreground capitalize">{settings.diversityStrictness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Single Sector</span>
                <span className="font-semibold text-foreground">{settings.maxSingleSectorPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Sectors Required</span>
                <span className="font-semibold text-foreground">{settings.minSectorsRequired}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crypto Allowed</span>
                <span className="font-semibold text-foreground">{settings.allowCrypto ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">International Allowed</span>
                <span className="font-semibold text-foreground">{settings.allowInternational ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Playoffs Start</span>
                <span className="font-semibold text-foreground">Week {settings.playoffStartWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Playoff Teams</span>
                <span className="font-semibold text-foreground">{settings.playoffTeams}</span>
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary font-display text-[8px] font-bold text-secondary-foreground">
                      {m.avatar}
                    </div>
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
        </main>
      </div>
    </PageTransition>
  );
};

export default LeaguePage;
