
-- 1. Create a secure view for profiles that excludes sensitive fields
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, display_name, team_name, avatar_url, level, xp, created_at, updated_at
FROM public.profiles;

-- 2. Drop the overly permissive "Users can view all profiles" policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 3. Create a policy that lets users see all profiles but only their own secret
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view other profiles non-sensitive"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- Note: RLS doesn't support column-level restrictions, so we need a different approach.
-- Drop the broad policy and use a security definer function for accessing secrets.
DROP POLICY IF EXISTS "Users can view other profiles non-sensitive" ON public.profiles;

-- Keep only the own-profile policy (covers viewing own data including secret)
-- For other users' public info, use the public view

-- 4. Remove the anonymous read policy on leagues
DROP POLICY IF EXISTS "Anon can read leagues" ON public.leagues;
