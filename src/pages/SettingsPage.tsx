import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { leagueSettings, leagueMembers } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, Crown, Shield, DollarSign, Calendar, Users, ChevronRight, Trophy, BarChart3, LogOut, Link2, RefreshCw, Loader2 } from "lucide-react";

const SettingsPage = () => {
  const s = leagueSettings;
  const me = leagueMembers[0];
  const { signOut, session } = useAuth();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleConnectBrokerage = async () => {
    if (!session) return;
    setConnecting(true);
    setSyncResult(null);
    try {
      // Step 1: Register user and get userSecret
      const { data: regData, error: regError } = await supabase.functions.invoke("snaptrade-auth", {
        body: { action: "register" },
      });

      if (regError) throw regError;
      const userSecret = regData?.userSecret;
      if (!userSecret) throw new Error("Failed to get user secret from registration");

      // Step 2: Get connection portal redirect URL
      const { data, error } = await supabase.functions.invoke("snaptrade-auth", {
        body: {
          action: "connect",
          userSecret,
          redirectUri: window.location.origin + "/settings",
        },
      });

      if (error) throw error;
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL returned");
      }
    } catch (err) {
      console.error("Connect error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setSyncResult(`Failed to connect: ${msg}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!session) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("snaptrade-sync", {
        body: { leagueId: "current" }, // TODO: use actual league ID from context
      });
      if (error) throw error;
      setSyncResult(`Synced ${data?.synced || 0} holdings from your brokerage.`);
    } catch (err) {
      console.error("Sync error:", err);
      setSyncResult("Sync failed. Make sure you've connected a brokerage first.");
    } finally {
      setSyncing(false);
    }
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

        {/* Brokerage Connection */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Link2 className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">BROKERAGE SYNC</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Connect your Robinhood account to automatically sync your portfolio holdings.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConnectBrokerage}
                disabled={connecting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:bg-primary/80 disabled:opacity-50"
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                {connecting ? "Connecting…" : "Connect Robinhood"}
              </button>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground active:bg-accent disabled:opacity-50"
              >
                {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sync
              </button>
            </div>
            {syncResult && (
              <p className={`text-xs ${syncResult.includes("Failed") || syncResult.includes("failed") ? "text-loss" : "text-gain"}`}>
                {syncResult}
              </p>
            )}
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
