
-- Drop existing restrictive policies on leagues
DROP POLICY IF EXISTS "Authenticated users can create leagues" ON public.leagues;
DROP POLICY IF EXISTS "Commissioner can update league" ON public.leagues;
DROP POLICY IF EXISTS "Members can view their leagues" ON public.leagues;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Authenticated users can create leagues"
ON public.leagues
FOR INSERT
TO authenticated
WITH CHECK (commissioner_id = auth.uid());

CREATE POLICY "Commissioner can update league"
ON public.leagues
FOR UPDATE
TO authenticated
USING (commissioner_id = auth.uid());

CREATE POLICY "Members can view their leagues"
ON public.leagues
FOR SELECT
TO authenticated
USING (id IN (SELECT get_user_league_ids(auth.uid())));
