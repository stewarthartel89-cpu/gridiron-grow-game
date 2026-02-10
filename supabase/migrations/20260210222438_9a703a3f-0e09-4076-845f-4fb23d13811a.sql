-- Add snaptrade_user_secret to profiles for persisting the SnapTrade user secret
ALTER TABLE public.profiles
ADD COLUMN snaptrade_user_secret TEXT DEFAULT NULL;
