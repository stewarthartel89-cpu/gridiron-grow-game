
-- Fix recursion in activity_feed SELECT policy
DROP POLICY IF EXISTS "League members can view feed" ON public.activity_feed;
CREATE POLICY "League members can view feed"
ON public.activity_feed
FOR SELECT
USING (league_id IN (SELECT public.get_user_league_ids(auth.uid())));

-- Fix recursion in activity_feed INSERT policy  
DROP POLICY IF EXISTS "Users can post to feed" ON public.activity_feed;
CREATE POLICY "Users can post to feed"
ON public.activity_feed
FOR INSERT
WITH CHECK (user_id = auth.uid() AND league_id IN (SELECT public.get_user_league_ids(auth.uid())));

-- Fix recursion in matchups SELECT policy
DROP POLICY IF EXISTS "League members can view matchups" ON public.matchups;
CREATE POLICY "League members can view matchups"
ON public.matchups
FOR SELECT
USING (league_id IN (SELECT public.get_user_league_ids(auth.uid())));

-- Fix recursion in leagues SELECT policy
DROP POLICY IF EXISTS "Anyone authenticated can view public leagues" ON public.leagues;
CREATE POLICY "Anyone authenticated can view public leagues"
ON public.leagues
FOR SELECT
USING (is_public = true OR id IN (SELECT public.get_user_league_ids(auth.uid())));
