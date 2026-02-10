
-- Fix infinite recursion in league_members SELECT policy
DROP POLICY IF EXISTS "Members can view league members" ON public.league_members;

-- Create a security definer function to safely check league membership
CREATE OR REPLACE FUNCTION public.get_user_league_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT league_id FROM public.league_members WHERE user_id = _user_id;
$$;

-- Recreate the policy using the function to avoid recursion
CREATE POLICY "Members can view league members"
ON public.league_members
FOR SELECT
USING (league_id IN (SELECT public.get_user_league_ids(auth.uid())));
