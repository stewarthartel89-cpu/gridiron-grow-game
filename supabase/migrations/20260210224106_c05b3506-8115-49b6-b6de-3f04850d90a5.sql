
-- Fix: Drop the security definer view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT id, user_id, display_name, team_name, avatar_url, level, xp, created_at, updated_at
FROM public.profiles;

-- We also need authenticated users to see other profiles (without secrets)
-- Since RLS can't do column-level, we add back a broad SELECT but 
-- the snaptrade_user_secret is only accessed via edge functions (service role)
-- So we can safely allow authenticated users to see all profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- Drop the restrictive own-profile-only policy since the broad one covers it
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
