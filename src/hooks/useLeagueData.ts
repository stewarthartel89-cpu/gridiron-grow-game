import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLeague } from "@/contexts/LeagueContext";
import { useAuth } from "@/contexts/AuthContext";

export interface LeagueMemberData {
  id: string;
  userId: string;
  displayName: string;
  teamName: string;
  avatar: string;
  wins: number;
  losses: number;
  streak: string;
  xp: number;
  level: number;
}

export interface LeagueSettingsData {
  name: string;
  weeklyDeposit: number;
  seasonLength: number;
  currentWeek: number;
  memberCount: number;
  maxMembers: number;
  commissionerId: string;
  commissionerName: string;
  diversityStrictness: string;
  playoffTeams: number;
  playoffStartWeek: number;
  allowCrypto: boolean;
  allowInternational: boolean;
  maxSingleSectorPct: number;
  minSectorsRequired: number;
  inviteCode: string | null;
}

export interface MatchupData {
  id: string;
  week: number;
  homeUserId: string;
  awayUserId: string;
  homeGrowthPct: number | null;
  awayGrowthPct: number | null;
  homeAdjustedPct: number | null;
  awayAdjustedPct: number | null;
  winnerUserId: string | null;
  isFinal: boolean;
}

export const useLeagueData = () => {
  const { leagueId } = useLeague();
  const { user } = useAuth();
  const [settings, setSettings] = useState<LeagueSettingsData | null>(null);
  const [members, setMembers] = useState<LeagueMemberData[]>([]);
  const [matchups, setMatchups] = useState<MatchupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leagueId || !user) return;

    const fetch = async () => {
      setLoading(true);

      // Fetch league settings
      const { data: league } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", leagueId)
        .maybeSingle();

      // Fetch members with profiles
      const { data: membersData } = await supabase
        .from("league_members")
        .select("id, user_id, wins, losses, streak")
        .eq("league_id", leagueId);

      // Fetch profiles for all members
      const userIds = (membersData || []).map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, team_name, xp, level, avatar_url")
        .in("user_id", userIds.length > 0 ? userIds : ["__none__"]);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const enrichedMembers: LeagueMemberData[] = (membersData || []).map((m) => {
        const p = profileMap.get(m.user_id);
        const name = p?.display_name || "Unknown";
        return {
          id: m.id,
          userId: m.user_id,
          displayName: name,
          teamName: p?.team_name || name,
          avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
          wins: m.wins,
          losses: m.losses,
          streak: m.streak || "",
          xp: p?.xp || 0,
          level: p?.level || 1,
        };
      });

      // Find commissioner name
      const commProfile = profileMap.get(league?.commissioner_id);
      const commName = commProfile?.display_name || "Unknown";

      // Fetch matchups for current week
      const { data: matchupsData } = await supabase
        .from("matchups")
        .select("*")
        .eq("league_id", leagueId)
        .eq("week", league?.current_week || 1);

      if (league) {
        setSettings({
          name: league.name,
          weeklyDeposit: league.weekly_deposit,
          seasonLength: league.season_length,
          currentWeek: league.current_week,
          memberCount: enrichedMembers.length,
          maxMembers: league.max_members,
          commissionerId: league.commissioner_id,
          commissionerName: commName,
          diversityStrictness: league.diversity_strictness,
          playoffTeams: league.playoff_teams,
          playoffStartWeek: league.playoff_start_week,
          allowCrypto: league.allow_crypto,
          allowInternational: league.allow_international,
          maxSingleSectorPct: league.max_single_sector_pct,
          minSectorsRequired: league.min_sectors_required,
          inviteCode: league.invite_code,
        });
      }

      setMembers(enrichedMembers.sort((a, b) => b.wins - a.wins || a.losses - b.losses));

      setMatchups(
        (matchupsData || []).map((m) => ({
          id: m.id,
          week: m.week,
          homeUserId: m.home_user_id,
          awayUserId: m.away_user_id,
          homeGrowthPct: m.home_growth_pct,
          awayGrowthPct: m.away_growth_pct,
          homeAdjustedPct: m.home_adjusted_pct,
          awayAdjustedPct: m.away_adjusted_pct,
          winnerUserId: m.winner_user_id,
          isFinal: m.is_final,
        }))
      );

      setLoading(false);
    };

    fetch();
  }, [leagueId, user]);

  const currentMember = members.find((m) => m.userId === user?.id) || null;

  return { settings, members, matchups, currentMember, loading };
};
