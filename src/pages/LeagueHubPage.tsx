import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Plus, Users, Copy, Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLeague } from "@/contexts/LeagueContext";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const LeagueHubPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"create" | "join">("create");
  const { user } = useAuth();
  const { refetch } = useLeague();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Create form
  const [name, setName] = useState("");
  const [weeklyDeposit, setWeeklyDeposit] = useState("50");
  const [maxMembers, setMaxMembers] = useState("10");
  const [seasonLength, setSeasonLength] = useState("17");
  const [diversityStrictness, setDiversityStrictness] = useState("standard");

  // Join form
  const [inviteCode, setInviteCode] = useState("");

  // Created league result
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("leagues")
        .insert({
          name,
          commissioner_id: user.id,
          weekly_deposit: parseInt(weeklyDeposit),
          max_members: parseInt(maxMembers),
          season_length: parseInt(seasonLength),
          diversity_strictness: diversityStrictness,
        })
        .select("id, invite_code")
        .single();

      if (error) throw error;

      // Auto-join the creator
      const { error: joinError } = await supabase
        .from("league_members")
        .insert({ league_id: data.id, user_id: user.id });

      if (joinError) throw joinError;

      setCreatedCode(data.invite_code);
      toast({ title: "League created!", description: `${name} is ready to go.` });
      await refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Find league by invite code via secure RPC
      const { data: leagues, error: findError } = await supabase
        .rpc("find_league_by_invite_code", { _invite_code: inviteCode.trim() });

      const league = leagues && leagues.length > 0 ? leagues[0] : null;

      if (findError) throw findError;
      if (!league) throw new Error("No league found with that invite code.");

      // Check member count
      const { count } = await supabase
        .from("league_members")
        .select("id", { count: "exact", head: true })
        .eq("league_id", league.id);

      if (count !== null && count >= league.max_members) {
        throw new Error("This league is full.");
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from("league_members")
        .select("id")
        .eq("league_id", league.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) throw new Error("You're already in this league.");

      const { error: joinError } = await supabase
        .from("league_members")
        .insert({ league_id: league.id, user_id: user.id });

      if (joinError) throw joinError;

      toast({ title: "Joined!", description: `Welcome to ${league.name}.` });
      await refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show invite code after league creation
  if (createdCode) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm text-center space-y-6"
          >
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/15">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">LEAGUE CREATED</h2>
              <p className="text-sm text-muted-foreground">Share this invite code with your friends</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-2">Invite Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-display text-2xl font-bold tracking-[0.3em] text-primary">
                  {createdCode.toUpperCase()}
                </span>
                <button onClick={copyCode} className="rounded-lg p-2 text-muted-foreground active:bg-accent">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground active:bg-primary/80"
            >
              GO TO LEAGUE
            </button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative">
        {/* Back arrow */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 rounded-xl p-2 text-muted-foreground active:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary glow-primary mb-3">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-wider text-foreground">
            JOIN THE GAME
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Create or join a fantasy investing league</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex w-full max-w-sm rounded-xl bg-secondary p-1 mb-6">
          {(["create", "join"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTab(m)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 font-display text-xs font-bold tracking-wider transition-colors ${
                tab === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "create" ? <Plus className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
              {m === "create" ? "CREATE" : "JOIN"}
            </button>
          ))}
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {tab === "create" ? (
            <motion.form
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleCreate}
              className="w-full max-w-sm space-y-3"
            >
              <input
                type="text"
                placeholder="League name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={40}
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Weekly Buy-In ($)</label>
                  <input
                    type="number"
                    value={weeklyDeposit}
                    onChange={(e) => setWeeklyDeposit(e.target.value)}
                    min={1}
                    max={1000}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Max Members</label>
                  <input
                    type="number"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    min={2}
                    max={20}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Season Length (weeks)</label>
                  <input
                    type="number"
                    value={seasonLength}
                    onChange={(e) => setSeasonLength(e.target.value)}
                    min={4}
                    max={52}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Diversification Tier</label>
                  <select
                    value={diversityStrictness}
                    onChange={(e) => setDiversityStrictness(e.target.value)}
                    className={inputClass}
                  >
                    <option value="relaxed">Cautious (50/50)</option>
                    <option value="standard">Moderate (65/35)</option>
                    <option value="strict">Aggressive (80/20)</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground active:bg-primary/80 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "CREATE LEAGUE"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleJoin}
              className="w-full max-w-sm space-y-3"
            >
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Invite Code</label>
                <input
                  type="text"
                  placeholder="Enter 8-character code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  maxLength={8}
                  className={`${inputClass} text-center font-display text-lg tracking-[0.2em] uppercase`}
                />
              </div>
              <button
                type="submit"
                disabled={loading || inviteCode.length < 1}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-sm font-bold text-primary-foreground active:bg-primary/80 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "JOIN LEAGUE"
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default LeagueHubPage;
