
-- Profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  team_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Leagues table
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  commissioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_deposit INTEGER NOT NULL DEFAULT 50,
  season_length INTEGER NOT NULL DEFAULT 17,
  current_week INTEGER NOT NULL DEFAULT 1,
  max_members INTEGER NOT NULL DEFAULT 10,
  diversity_strictness TEXT NOT NULL DEFAULT 'standard' CHECK (diversity_strictness IN ('relaxed', 'standard', 'strict')),
  playoff_teams INTEGER NOT NULL DEFAULT 4,
  playoff_start_week INTEGER NOT NULL DEFAULT 14,
  allow_crypto BOOLEAN NOT NULL DEFAULT true,
  allow_international BOOLEAN NOT NULL DEFAULT true,
  max_single_sector_pct INTEGER NOT NULL DEFAULT 40,
  min_sectors_required INTEGER NOT NULL DEFAULT 3,
  is_public BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- League members (join table)
CREATE TABLE public.league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  streak TEXT DEFAULT '',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (league_id, user_id)
);
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- Holdings
CREATE TABLE public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  shares NUMERIC NOT NULL DEFAULT 0,
  avg_cost NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC NOT NULL DEFAULT 0,
  allocation NUMERIC NOT NULL DEFAULT 0,
  sector TEXT NOT NULL,
  weeks_held INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- Weekly matchups
CREATE TABLE public.matchups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  home_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  away_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  home_growth_pct NUMERIC,
  away_growth_pct NUMERIC,
  home_adjusted_pct NUMERIC,
  away_adjusted_pct NUMERIC,
  winner_user_id UUID REFERENCES auth.users(id),
  is_final BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matchups ENABLE ROW LEVEL SECURITY;

-- Activity feed
CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trade', 'matchup_result', 'deposit', 'badge', 'trash_talk', 'lineup_alert')),
  message TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS policies for leagues (members can view, commissioner can update)
CREATE POLICY "Anyone authenticated can view public leagues" ON public.leagues FOR SELECT TO authenticated USING (is_public = true OR id IN (SELECT league_id FROM public.league_members WHERE user_id = auth.uid()));
CREATE POLICY "Commissioner can update league" ON public.leagues FOR UPDATE TO authenticated USING (commissioner_id = auth.uid());
CREATE POLICY "Authenticated users can create leagues" ON public.leagues FOR INSERT TO authenticated WITH CHECK (commissioner_id = auth.uid());

-- RLS for league_members
CREATE POLICY "Members can view league members" ON public.league_members FOR SELECT TO authenticated USING (league_id IN (SELECT league_id FROM public.league_members lm WHERE lm.user_id = auth.uid()));
CREATE POLICY "Users can join leagues" ON public.league_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave leagues" ON public.league_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS for holdings (own data only)
CREATE POLICY "Users can view own holdings" ON public.holdings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own holdings" ON public.holdings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own holdings" ON public.holdings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own holdings" ON public.holdings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS for matchups (league members can view)
CREATE POLICY "League members can view matchups" ON public.matchups FOR SELECT TO authenticated USING (league_id IN (SELECT league_id FROM public.league_members WHERE user_id = auth.uid()));

-- RLS for activity feed (league members can view and post)
CREATE POLICY "League members can view feed" ON public.activity_feed FOR SELECT TO authenticated USING (league_id IN (SELECT league_id FROM public.league_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can post to feed" ON public.activity_feed FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND league_id IN (SELECT league_id FROM public.league_members WHERE user_id = auth.uid()));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON public.holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
