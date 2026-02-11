
-- Allow authenticated users to find a league by invite_code (needed for joining)
CREATE POLICY "Anyone can find league by invite code"
  ON public.leagues
  FOR SELECT
  USING (true);

-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view leagues" ON public.leagues;
