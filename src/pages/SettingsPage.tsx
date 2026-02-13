import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LeagueHeader from "@/components/LeagueHeader";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useLeague } from "@/contexts/LeagueContext";
import { useLeagueData } from "@/hooks/useLeagueData";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon, Crown, Shield, DollarSign, Calendar, Users,
  ChevronRight, Trophy, BarChart3, LogOut, Link2, RefreshCw, Loader2,
  Pencil, Check, X, Copy, Share2, CheckCheck, Sun, Moon,
} from "lucide-react";

/* ── Editable Field ─────────────────────────────────────── */
const EditableField = ({
  label, value, onSave, type = "text",
}: {
  label: string; value: string; onSave: (v: string) => Promise<void>; type?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(value), [value]);

  const save = async () => {
    if (draft.trim() === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft.trim());
    setSaving(false);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="flex w-full items-center justify-between py-2 group">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {value || "—"}
          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <input
        autoFocus
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
      />
      <button onClick={save} disabled={saving} className="text-gain">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      <button onClick={() => { setDraft(value); setEditing(false); }} className="text-loss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/* ── Commissioner Editable Row ──────────────────────────── */
const CommissionerRow = ({
  icon: Icon, label, value, color, editable, onSave, type = "text", options,
}: {
  icon: React.ElementType; label: string; value: string; color: string;
  editable: boolean; onSave?: (v: string) => Promise<void>; type?: string;
  options?: { value: string; label: string }[];
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(value), [value]);

  const save = async () => {
    if (!onSave || draft === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  if (editing && editable) {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm text-foreground shrink-0">{label}</span>
        <div className="flex-1" />
        {options ? (
          <select
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            autoFocus
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-20 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground text-right outline-none"
          />
        )}
        <button onClick={save} disabled={saving} className="text-gain">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button onClick={() => { setDraft(value); setEditing(false); }} className="text-loss">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      className="flex w-full items-center gap-3 px-4 py-3 active:bg-accent"
      onClick={() => editable && setEditing(true)}
    >
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="flex-1 text-left text-sm text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground capitalize">{value}</span>
      {editable && <Pencil className="h-3 w-3 text-muted-foreground" />}
      {!editable && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
};

/* ── Invite Code Section ────────────────────────────────── */
const InviteCodeSection = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    const text = `Join me on Pogro! Use invite code: ${code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join Pogro", text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">INVITE PLAYERS</h3>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Share this code with friends so they can join your league.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 py-3">
            <span className="font-display text-xl font-bold tracking-[0.3em] text-foreground">{code.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyCode}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground active:bg-accent transition-colors"
          >
            {copied ? <CheckCheck className="h-4 w-4 text-gain" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <button
            onClick={shareInvite}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:bg-primary/80"
          >
            <Share2 className="h-4 w-4" />
            Share Invite
          </button>
        </div>
      </div>
    </div>
  );
};

const THEME_KEY = "capital_league_theme";

const SettingsPage = () => {
  const { signOut, user, session } = useAuth();
  const { settings, currentMember, loading } = useLeagueData();
  const { leagueId: activeLeagueId } = useLeague();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === "dark" : true; // default dark
  });

  // Profile state from DB
  const [displayName, setDisplayName] = useState("");
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (currentMember) {
      setDisplayName(currentMember.displayName);
      setTeamName(currentMember.teamName);
    }
  }, [currentMember]);

  const isCommissioner = settings && user && settings.commissionerId === user.id;


  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const updateProfile = async (field: string, value: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("user_id", user.id);
    if (error) console.error("Profile update error:", error);
    if (field === "display_name") setDisplayName(value);
    if (field === "team_name") setTeamName(value);
  };

  const updateLeague = async (field: string, value: string | number | boolean) => {
    if (!settings || !isCommissioner || !activeLeagueId) return;
    const { error } = await supabase
      .from("leagues")
      .update({ [field]: value })
      .eq("id", activeLeagueId);
    if (error) console.error("League update error:", error);
  };

  const handleConnectBrokerage = async () => {
    if (!session) return;
    setConnecting(true);
    setSyncResult(null);
    try {
      const { data: regData, error: regError } = await supabase.functions.invoke("snaptrade-auth", {
        body: { action: "register" },
      });
      if (regError) throw regError;
      const userSecret = regData?.userSecret;
      if (!userSecret) throw new Error("Failed to get user secret from registration");

      const { data, error } = await supabase.functions.invoke("snaptrade-auth", {
        body: { action: "connect", userSecret, redirectUri: window.location.origin + "/settings" },
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
        body: { leagueId: "current" },
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

  const avatar = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-2.5">
            <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <h1 className="font-display text-lg font-bold tracking-wider text-foreground">Settings</h1>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-5 space-y-5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Settings
          </h2>

          {/* My Profile — Editable */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">MY PROFILE</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {avatar}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
            <div className="divide-y divide-border/50">
              <EditableField
                label="Display Name"
                value={displayName}
                onSave={(v) => updateProfile("display_name", v)}
              />
              <EditableField
                label="Team Name"
                value={teamName}
                onSave={(v) => updateProfile("team_name", v)}
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">APPEARANCE</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-warning" />}
                <span className="text-sm text-foreground">{isDark ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <Switch checked={isDark} onCheckedChange={setIsDark} />
            </div>
          </div>

          {/* Stats */}
          {currentMember && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <Trophy className="h-4 w-4 text-gain mx-auto mb-1" />
                <p className="font-display text-lg font-bold text-foreground">{currentMember.wins}</p>
                <p className="text-[10px] text-muted-foreground">Wins</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="font-display text-lg font-bold text-foreground">{currentMember.losses}</p>
                <p className="text-[10px] text-muted-foreground">Losses</p>
              </div>
            </div>
          )}

          {/* Commissioner Settings — Editable for commissioner */}
          {settings && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Crown className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">
                  {isCommissioner ? "COMMISSIONER SETTINGS" : "LEAGUE SETTINGS"}
                </h3>
                {isCommissioner && (
                  <span className="ml-auto text-[10px] text-primary font-semibold">You're Commissioner</span>
                )}
              </div>
              <div className="divide-y divide-border/50">
                <CommissionerRow
                  icon={DollarSign} label="Weekly Deposit" value={`$${settings.weeklyDeposit}`}
                  color="text-primary" editable={!!isCommissioner}
                  type="number"
                  onSave={async (v) => { await updateLeague("weekly_deposit", parseInt(v.replace("$", "")) || 50); }}
                />
                <CommissionerRow
                  icon={Calendar} label="Season Length" value={`${settings.seasonLength} weeks`}
                  color="text-bonus" editable={!!isCommissioner}
                  type="number"
                  onSave={async (v) => { await updateLeague("season_length", parseInt(v.replace(" weeks", "")) || 17); }}
                />
                <CommissionerRow
                  icon={Shield} label="Diversification Tier" value={{ relaxed: "Cautious (50/50)", standard: "Moderate (65/35)", strict: "Aggressive (80/20)" }[settings.diversityStrictness] || settings.diversityStrictness}
                  color="text-gain" editable={!!isCommissioner}
                  options={[
                    { value: "relaxed", label: "Cautious (50/50)" },
                    { value: "standard", label: "Moderate (65/35)" },
                    { value: "strict", label: "Aggressive (80/20)" },
                  ]}
                  onSave={async (v) => { await updateLeague("diversity_strictness", v); }}
                />
                <CommissionerRow
                  icon={Users} label="Max Members" value={`${settings.maxMembers}`}
                  color="text-foreground" editable={!!isCommissioner}
                  type="number"
                  onSave={async (v) => { await updateLeague("max_members", parseInt(v) || 10); }}
                />
                <CommissionerRow
                  icon={Trophy} label="Playoff Teams" value={`${settings.playoffTeams}`}
                  color="text-primary" editable={!!isCommissioner}
                  type="number"
                  onSave={async (v) => { await updateLeague("playoff_teams", parseInt(v) || 4); }}
                />
              </div>
            </div>
          )}

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

          {/* Invite Code */}
          {settings?.inviteCode && (
            <InviteCodeSection code={settings.inviteCode} />
          )}




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
