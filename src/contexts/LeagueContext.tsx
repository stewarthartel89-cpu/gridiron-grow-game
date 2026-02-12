import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserLeague {
  leagueId: string;
  leagueName: string;
}

interface LeagueContextType {
  leagues: UserLeague[];
  activeLeagueId: string | null;
  leagueId: string | null; // alias for activeLeagueId (backward compat)
  leagueName: string | null;
  loading: boolean;
  setActiveLeague: (id: string) => void;
  refetch: () => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType>({
  leagues: [],
  activeLeagueId: null,
  leagueId: null,
  leagueName: null,
  loading: true,
  setActiveLeague: () => {},
  refetch: async () => {},
});

export const useLeague = () => useContext(LeagueContext);

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<UserLeague[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeagues = async () => {
    if (!user) {
      setLeagues([]);
      setActiveLeagueId(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("league_members")
      .select("league_id, leagues(name)")
      .eq("user_id", user.id);

    if (!error && data && data.length > 0) {
      const mapped: UserLeague[] = data.map((d: any) => ({
        leagueId: d.league_id,
        leagueName: d.leagues?.name ?? "Unknown League",
      }));
      setLeagues(mapped);
      // Keep current active if still valid, otherwise pick first
      setActiveLeagueId((prev) => {
        if (prev && mapped.some((l) => l.leagueId === prev)) return prev;
        return mapped[0].leagueId;
      });
    } else {
      setLeagues([]);
      setActiveLeagueId(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeagues();
  }, [user]);

  const activeName = leagues.find((l) => l.leagueId === activeLeagueId)?.leagueName ?? null;

  return (
    <LeagueContext.Provider
      value={{
        leagues,
        activeLeagueId,
        leagueId: activeLeagueId,
        leagueName: activeName,
        loading,
        setActiveLeague: setActiveLeagueId,
        refetch: fetchLeagues,
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
};
