
-- Fix leagues policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can create leagues" ON public.leagues;
CREATE POLICY "Authenticated users can create leagues"
ON public.leagues
FOR INSERT
TO authenticated
WITH CHECK (commissioner_id = auth.uid());

DROP POLICY IF EXISTS "Anyone authenticated can view public leagues" ON public.leagues;
CREATE POLICY "Anyone authenticated can view public leagues"
ON public.leagues
FOR SELECT
TO authenticated
USING (is_public = true OR id IN (SELECT public.get_user_league_ids(auth.uid())));

DROP POLICY IF EXISTS "Commissioner can update league" ON public.leagues;
CREATE POLICY "Commissioner can update league"
ON public.leagues
FOR UPDATE
TO authenticated
USING (commissioner_id = auth.uid());

-- Fix league_members policies
DROP POLICY IF EXISTS "Members can view league members" ON public.league_members;
CREATE POLICY "Members can view league members"
ON public.league_members
FOR SELECT
TO authenticated
USING (league_id IN (SELECT public.get_user_league_ids(auth.uid())));

DROP POLICY IF EXISTS "Users can join leagues" ON public.league_members;
CREATE POLICY "Users can join leagues"
ON public.league_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can leave leagues" ON public.league_members;
CREATE POLICY "Users can leave leagues"
ON public.league_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Fix holdings policies
DROP POLICY IF EXISTS "Users can view own holdings" ON public.holdings;
CREATE POLICY "Users can view own holdings"
ON public.holdings FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own holdings" ON public.holdings;
CREATE POLICY "Users can manage own holdings"
ON public.holdings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own holdings" ON public.holdings;
CREATE POLICY "Users can update own holdings"
ON public.holdings FOR UPDATE TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own holdings" ON public.holdings;
CREATE POLICY "Users can delete own holdings"
ON public.holdings FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Fix activity_feed policies
DROP POLICY IF EXISTS "League members can view feed" ON public.activity_feed;
CREATE POLICY "League members can view feed"
ON public.activity_feed FOR SELECT TO authenticated
USING (league_id IN (SELECT public.get_user_league_ids(auth.uid())));

DROP POLICY IF EXISTS "Users can post to feed" ON public.activity_feed;
CREATE POLICY "Users can post to feed"
ON public.activity_feed FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND league_id IN (SELECT public.get_user_league_ids(auth.uid())));

-- Fix matchups policies
DROP POLICY IF EXISTS "League members can view matchups" ON public.matchups;
CREATE POLICY "League members can view matchups"
ON public.matchups FOR SELECT TO authenticated
USING (league_id IN (SELECT public.get_user_league_ids(auth.uid())));

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
