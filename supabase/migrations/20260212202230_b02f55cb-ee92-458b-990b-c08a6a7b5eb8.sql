
-- Function: when a league is created, create its group conversation
CREATE OR REPLACE FUNCTION public.create_league_group_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Create group conversation for the league
  INSERT INTO public.conversations (league_id, type, name)
  VALUES (NEW.id, 'group', NEW.name)
  RETURNING id INTO conv_id;

  -- Add the commissioner as first member
  INSERT INTO public.conversation_members (conversation_id, user_id)
  VALUES (conv_id, NEW.commissioner_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_league_created
  AFTER INSERT ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.create_league_group_chat();

-- Function: when a member joins a league, add them to the league group chat
CREATE OR REPLACE FUNCTION public.add_member_to_league_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Find the group conversation for this league
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE league_id = NEW.league_id AND type = 'group'
  LIMIT 1;

  -- If conversation exists and user isn't already a member, add them
  IF conv_id IS NOT NULL THEN
    INSERT INTO public.conversation_members (conversation_id, user_id)
    VALUES (conv_id, NEW.user_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_league_member_joined
  AFTER INSERT ON public.league_members
  FOR EACH ROW
  EXECUTE FUNCTION public.add_member_to_league_chat();

-- Backfill: create group chats for existing leagues and add current members
DO $$
DECLARE
  lg RECORD;
  conv_id UUID;
  mem RECORD;
BEGIN
  FOR lg IN SELECT id, name, commissioner_id FROM public.leagues LOOP
    -- Skip if already has a group chat
    IF NOT EXISTS (SELECT 1 FROM public.conversations WHERE league_id = lg.id AND type = 'group') THEN
      INSERT INTO public.conversations (league_id, type, name)
      VALUES (lg.id, 'group', lg.name)
      RETURNING id INTO conv_id;

      -- Add all current members
      FOR mem IN SELECT user_id FROM public.league_members WHERE league_id = lg.id LOOP
        INSERT INTO public.conversation_members (conversation_id, user_id)
        VALUES (conv_id, mem.user_id)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;
