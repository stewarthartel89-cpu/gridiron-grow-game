import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leagueSettings } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useLeague } from "@/contexts/LeagueContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Standings from "@/components/Standings";
import MatchupSchedule from "@/components/MatchupSchedule";
import {
  Trophy, Crown, Users, Calendar, Shield, DollarSign, Copy, Check, Info,
  Trash2, Loader2, Pencil, X, ChevronRight,
} from "lucide-react";
import { TIER_ALLOCATIONS, TIER_LABELS, BUCKETS, type DiversificationTier } from "@/lib/diversificationModifier";

/* ── Commissioner Editable Row ──────────────────────────── */
const CommissionerRow = ({
  icon: Icon, label, value, color, onSave, type = "text", options,
}: {
  icon: React.ElementType; label: string; value: string; color: string;
  onSave?: (v: string) => Promise<void>; type?: string;
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

  if (editing) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-foreground shrink-0">{label}</span>
        <div className="flex-1" />
        {options ? (
          <select
            autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none"
          >
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input
            autoFocus type={type} value={draft} onChange={(e) => setDraft(e.target.value)}
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
    <button className="flex w-full items-center gap-3 px-4 py-2.5 active:bg-accent" onClick={() => setEditing(true)}>
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="flex-1 text-left text-xs text-foreground">{label}</span>
      <span className="text-[11px] text-muted-foreground capitalize">{value}</span>
      <Pencil className="h-3 w-3 text-muted-foreground" />
    </button>
  );
};

const LeagueInfoContent = () => {
  const mockSettings = leagueSettings;
  const { user } = useAuth();
  const { refetch, leagueId: activeLeagueId } = useLeague();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [terminating, setTerminating] = useState(false);

  const isCommissioner = true; // mock: always commissioner
  const settings = {
    ...mockSettings,
    commissionerId: user?.id || "",
    commissionerName: mockSettings.commissioner,
    inviteCode: "ABC123",
  };

  const copyInvite = () => {
    if (settings?.inviteCode) {
      navigator.clipboard.writeText(settings.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTerminateLeague = async () => {
    if (!user || !isCommissioner || !activeLeagueId) return;
    setTerminating(true);
    try {
      await supabase.from("league_members").delete().eq("league_id", activeLeagueId);
      await supabase.from("matchups").delete().eq("league_id", activeLeagueId);
      await supabase.from("holdings").delete().eq("league_id", activeLeagueId);
      await supabase.from("activity_feed").delete().eq("league_id", activeLeagueId);
      const { error } = await supabase.from("leagues").delete().eq("id", activeLeagueId);
      if (error) throw error;
      toast({ title: "League terminated", description: "The league has been permanently deleted." });
      await refetch();
      navigate("/league-hub");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTerminating(false);
      setShowTerminateConfirm(false);
    }
  };

  const updateLeague = async (field: string, value: string | number | boolean) => {
    if (!settings || !isCommissioner || !activeLeagueId) return;
    const { error } = await supabase.from("leagues").update({ [field]: value }).eq("id", activeLeagueId);
    if (error) console.error("League update error:", error);
  };

  if (!settings) {
    return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  const tierMap: Record<string, DiversificationTier> = {
    cautious: "cautious", moderate: "moderate", aggressive: "aggressive",
    relaxed: "cautious", standard: "moderate", strict: "aggressive",
  };
  const tier: DiversificationTier = tierMap[settings.diversityStrictness] || "moderate";
  const targetAlloc = TIER_ALLOCATIONS[tier];

  return (
    <>
      {/* 1. Standings with integrated playoff picture */}
      <Standings />

      {/* 1b. Matchup Schedule */}
      <MatchupSchedule />

      {/* 2. Diversification Modifier */}
      <div className="rounded-xl border border-border bg-card card-elevated p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-bonus" />
          <h3 className="font-display text-sm font-bold text-foreground">DIVERSIFICATION MODIFIER</h3>
          <span className="ml-auto text-[10px] text-muted-foreground rounded-full border border-border px-2 py-0.5">
            {TIER_LABELS[tier]} Tier
          </span>
        </div>
        <div className="flex gap-4 mb-3">
          {BUCKETS.map((bucket) => (
            <div key={bucket} className="flex-1 rounded-lg bg-secondary p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">{bucket}</p>
              <p className="text-sm font-bold text-foreground">{targetAlloc[bucket]}%</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-secondary/50 p-2.5">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Deviation from the <strong>{TIER_LABELS[tier]}</strong> target applies a 0.75×–1.00× multiplier to your game score.
            </p>
          </div>
        </div>
      </div>

      {/* 3. League Details */}
      <div className="rounded-xl border border-border bg-card card-elevated p-4">
        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          LEAGUE DETAILS
        </h3>
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

      {/* 4. Commissioner Settings — only visible to commissioner */}
      {isCommissioner && (
        <div className="rounded-xl border border-border bg-card card-elevated overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Crown className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">COMMISSIONER SETTINGS</h3>
          </div>
          <div className="divide-y divide-border/50">
            <CommissionerRow
              icon={DollarSign} label="Weekly Deposit" value={`$${settings.weeklyDeposit}`}
              color="text-primary" type="number"
              onSave={async (v) => { await updateLeague("weekly_deposit", parseInt(v.replace("$", "")) || 50); }}
            />
            <CommissionerRow
              icon={Calendar} label="Season Length" value={`${settings.seasonLength} weeks`}
              color="text-bonus" type="number"
              onSave={async (v) => { await updateLeague("season_length", parseInt(v.replace(" weeks", "")) || 17); }}
            />
            <CommissionerRow
              icon={Shield} label="Diversification Tier"
              value={{ relaxed: "Cautious (50/50)", standard: "Moderate (65/35)", strict: "Aggressive (80/20)" }[settings.diversityStrictness] || settings.diversityStrictness}
              color="text-gain"
              options={[
                { value: "relaxed", label: "Cautious (50/50)" },
                { value: "standard", label: "Moderate (65/35)" },
                { value: "strict", label: "Aggressive (80/20)" },
              ]}
              onSave={async (v) => { await updateLeague("diversity_strictness", v); }}
            />
            <CommissionerRow
              icon={Users} label="Max Members" value={`${settings.maxMembers}`}
              color="text-foreground" type="number"
              onSave={async (v) => { await updateLeague("max_members", parseInt(v) || 10); }}
            />
            <CommissionerRow
              icon={Trophy} label="Playoff Teams" value={`${settings.playoffTeams}`}
              color="text-primary" type="number"
              onSave={async (v) => { await updateLeague("playoff_teams", parseInt(v) || 4); }}
            />
          </div>

          {/* Terminate inside commissioner section */}
          <div className="border-t border-loss/20">
            {!showTerminateConfirm ? (
              <button
                onClick={() => setShowTerminateConfirm(true)}
                className="flex w-full items-center justify-center gap-2 py-3 text-xs font-semibold text-loss active:bg-loss/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Terminate League
              </button>
            ) : (
              <div className="p-4 space-y-3">
                <p className="text-sm text-loss font-semibold text-center">Are you sure? This is permanent.</p>
                <p className="text-xs text-muted-foreground text-center">All data will be deleted.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowTerminateConfirm(false)} className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-foreground active:bg-accent">Cancel</button>
                  <button onClick={handleTerminateLeague} disabled={terminating} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-loss py-2 text-xs font-semibold text-white active:bg-loss/80 disabled:opacity-50">
                    {terminating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    {terminating ? "Deleting…" : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LeagueInfoContent;
