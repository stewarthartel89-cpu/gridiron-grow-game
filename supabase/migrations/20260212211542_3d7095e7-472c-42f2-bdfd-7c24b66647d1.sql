
-- Fix 1: Replace broad leagues invite code SELECT policy with a secure RPC function
DROP POLICY IF EXISTS "Authenticated users can find league by invite code" ON public.leagues;

CREATE OR REPLACE FUNCTION public.find_league_by_invite_code(_invite_code text)
RETURNS TABLE(id uuid, name text, max_members integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.id, l.name, l.max_members
  FROM public.leagues l
  WHERE l.invite_code = lower(trim(_invite_code))
    AND l.invite_code IS NOT NULL
    AND auth.uid() IS NOT NULL;
$$;

-- Fix 2: Restrict profiles SELECT to league members + own profile
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view league member profiles"
  ON public.profiles FOR SELECT
  USING (
    user_id IN (
      SELECT lm.user_id FROM public.league_members lm
      WHERE lm.league_id IN (SELECT get_user_league_ids(auth.uid()))
    )
  );

-- Fix 3: Add DELETE policy for snaptrade_secrets
CREATE POLICY "Users can delete own secret"
  ON public.snaptrade_secrets FOR DELETE
  USING (auth.uid() = user_id);

-- Fix 4: Drop unused profiles_public view
DROP VIEW IF EXISTS public.profiles_public;
