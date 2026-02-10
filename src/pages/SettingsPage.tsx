import { useNavigate } from "react-router-dom";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { leagueSettings, leagueMembers } from "@/data/mockData";
import { Settings as SettingsIcon, Crown, Shield, DollarSign, Calendar, Users, ChevronRight, Trophy, BarChart3, LogOut } from "lucide-react";

const SettingsPage = () => {
  const s = leagueSettings;
  const me = leagueMembers[0];
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      <LeagueHeader />
      <main className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          Settings
        </h2>

        {/* My Profile */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">MY PROFILE</h3>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
              {me.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{me.name}</p>
              <p className="text-xs text-muted-foreground">{me.teamName}</p>
              <div className="mt-1 flex items-center gap-2">
                {me.badges.slice(0, 3).map(b => (
                  <span key={b} className="text-xs">{b}</span>
                ))}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Trophy className="h-4 w-4 text-xp mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{me.record.wins}</p>
            <p className="text-[10px] text-muted-foreground">Wins</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">
              {((me.currentValue - me.totalInvested) / me.totalInvested * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">All-Time ROI</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <Crown className="h-4 w-4 text-xp mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{me.level}</p>
            <p className="text-[10px] text-muted-foreground">Level</p>
          </div>
        </div>

        {/* Commissioner Settings */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Crown className="h-4 w-4 text-xp" />
            <h3 className="font-display text-sm font-bold text-foreground">COMMISSIONER SETTINGS</h3>
          </div>
          <div className="divide-y divide-border/50">
            {[
              { icon: DollarSign, label: "Weekly Deposit", value: `$${s.weeklyDeposit}`, color: "text-primary" },
              { icon: Calendar, label: "Season Length", value: `${s.seasonLength} weeks`, color: "text-bonus" },
              { icon: Shield, label: "Diversity Strictness", value: s.diversityStrictness, color: "text-gain" },
              { icon: Users, label: "Max Members", value: `${s.maxMembers}`, color: "text-foreground" },
              { icon: Trophy, label: "Playoff Teams", value: `${s.playoffTeams}`, color: "text-xp" },
            ].map(({ icon: Icon, label, value, color }) => (
              <button key={label} className="flex w-full items-center gap-3 px-4 py-3 active:bg-accent">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="flex-1 text-left text-sm text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground capitalize">{value}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Invite */}
        <button className="w-full rounded-xl bg-primary py-3 font-display text-sm font-bold text-primary-foreground active:bg-primary/80">
          INVITE PLAYERS
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-loss/30 py-3 text-sm font-semibold text-loss active:bg-loss/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </main>
    </div>
    </PageTransition>
  );
};

export default SettingsPage;
