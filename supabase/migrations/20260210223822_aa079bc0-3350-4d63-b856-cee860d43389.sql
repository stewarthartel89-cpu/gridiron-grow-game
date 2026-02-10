
-- 1. Holdings: Allow league members to view each other's holdings
CREATE POLICY "League members can view holdings"
ON public.holdings FOR SELECT TO authenticated
USING (league_id IN (SELECT get_user_league_ids(auth.uid())));

-- 2. Matchups: Allow commissioner to update matchup results
CREATE POLICY "Commissioner can update matchups"
ON public.matchups FOR UPDATE TO authenticated
USING (league_id IN (
  SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()
));

-- 3. Harden get_user_league_ids to only allow querying own leagues
CREATE OR REPLACE FUNCTION public.get_user_league_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT league_id FROM public.league_members
  WHERE user_id = _user_id AND _user_id = auth.uid();
$$;
