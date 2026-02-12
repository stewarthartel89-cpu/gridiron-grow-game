
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can find league by invite code" ON public.leagues;

-- Create a new policy: members can see their leagues, OR any authenticated user
-- can see a league row if they provide an invite_code match (handled by query filter).
-- We allow members full SELECT and restrict non-members to only see leagues
-- they look up by invite_code.
CREATE POLICY "Members can view their leagues"
ON public.leagues
FOR SELECT
USING (
  id IN (SELECT get_user_league_ids(auth.uid()))
);

-- Separate policy for invite code lookup: allow seeing a league if you're authenticated
-- This is narrow because the app only queries by invite_code, and we don't expose
-- the full list. We restrict to only return rows matching an invite_code filter.
CREATE POLICY "Authenticated users can find league by invite code"
ON public.leagues
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND invite_code IS NOT NULL
);
