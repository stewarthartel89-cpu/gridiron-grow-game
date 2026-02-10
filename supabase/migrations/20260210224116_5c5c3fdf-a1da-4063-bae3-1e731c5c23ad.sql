
-- Create a separate secure table for snaptrade secrets
CREATE TABLE IF NOT EXISTS public.snaptrade_secrets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  user_secret text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.snaptrade_secrets ENABLE ROW LEVEL SECURITY;

-- Only the user can see their own secret
CREATE POLICY "Users can view own secret"
ON public.snaptrade_secrets FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own secret"
ON public.snaptrade_secrets FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own secret"
ON public.snaptrade_secrets FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing data
INSERT INTO public.snaptrade_secrets (user_id, user_secret)
SELECT user_id, snaptrade_user_secret
FROM public.profiles
WHERE snaptrade_user_secret IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Remove the secret column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS snaptrade_user_secret;
