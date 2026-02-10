
-- Fix: commissioner must be able to SELECT their league immediately after creating it
-- (before they're added to league_members)
DROP POLICY IF EXISTS "Anyone authenticated can view public leagues" ON public.leagues;
CREATE POLICY "Authenticated users can view leagues" ON public.leagues 
  FOR SELECT TO authenticated 
  USING (
    commissioner_id = auth.uid() 
    OR is_public = true 
    OR id IN (SELECT get_user_league_ids(auth.uid()))
  );
