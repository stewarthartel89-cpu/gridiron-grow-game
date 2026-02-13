
-- Create a SECURITY DEFINER function to safely create DM conversations
-- This ensures both members are added without requiring permissive INSERT policies
CREATE OR REPLACE FUNCTION public.create_dm_conversation(
  _current_user_id uuid,
  _target_user_id uuid,
  _league_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conv_id uuid;
  _existing_conv_id uuid;
BEGIN
  -- Verify caller is the current user
  IF _current_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify both users are members of the league
  IF NOT EXISTS (SELECT 1 FROM public.league_members WHERE league_id = _league_id AND user_id = _current_user_id) THEN
    RAISE EXCEPTION 'Current user is not a league member';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.league_members WHERE league_id = _league_id AND user_id = _target_user_id) THEN
    RAISE EXCEPTION 'Target user is not a league member';
  END IF;

  -- Check if DM already exists between these two users in this league
  SELECT c.id INTO _existing_conv_id
  FROM public.conversations c
  WHERE c.league_id = _league_id AND c.type = 'dm'
    AND EXISTS (SELECT 1 FROM public.conversation_members cm WHERE cm.conversation_id = c.id AND cm.user_id = _current_user_id)
    AND EXISTS (SELECT 1 FROM public.conversation_members cm WHERE cm.conversation_id = c.id AND cm.user_id = _target_user_id);

  IF _existing_conv_id IS NOT NULL THEN
    RETURN _existing_conv_id;
  END IF;

  -- Create the conversation
  INSERT INTO public.conversations (league_id, type, name)
  VALUES (_league_id, 'dm', NULL)
  RETURNING id INTO _conv_id;

  -- Add both members
  INSERT INTO public.conversation_members (conversation_id, user_id) VALUES (_conv_id, _current_user_id);
  INSERT INTO public.conversation_members (conversation_id, user_id) VALUES (_conv_id, _target_user_id);

  RETURN _conv_id;
END;
$$;
