import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeagueContextType {
  leagueId: string | null;
  leagueName: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType>({
  leagueId: null,
  leagueName: null,
  loading: true,
  refetch: async () => {},
});

export const useLeague = () => useContext(LeagueContext);

export const LeagueProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeague = async () => {
    if (!user) {
      setLeagueId(null);
      setLeagueName(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("league_members")
      .select("league_id, leagues(name)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setLeagueId(data.league_id);
      setLeagueName((data as any).leagues?.name ?? null);
    } else {
      setLeagueId(null);
      setLeagueName(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeague();
  }, [user]);

  return (
    <LeagueContext.Provider value={{ leagueId, leagueName, loading, refetch: fetchLeague }}>
      {children}
    </LeagueContext.Provider>
  );
};
