-- Add unique constraint for upsert in snaptrade-sync
ALTER TABLE public.holdings
ADD CONSTRAINT holdings_user_league_symbol_unique
UNIQUE (user_id, league_id, symbol);
