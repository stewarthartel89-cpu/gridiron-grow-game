-- Commissioners need to SELECT their league immediately after creation
-- (before they're added to league_members)
CREATE POLICY "Commissioner can view own league"
ON public.leagues
FOR SELECT
TO authenticated
USING (commissioner_id = auth.uid());
