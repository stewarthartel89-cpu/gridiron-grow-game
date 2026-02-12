
-- Conversations table (group chats per league + DMs)
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('group', 'dm')),
  name TEXT, -- for group chats (e.g. league name)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation members
CREATE TABLE public.conversation_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- RLS: Users can see conversations they are members of
CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT
  USING (id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid()));

-- RLS: Users can see their own memberships
CREATE POLICY "Users see own memberships"
  ON public.conversation_members FOR SELECT
  USING (user_id = auth.uid());

-- RLS: Users can see messages in their conversations
CREATE POLICY "Members can view messages"
  ON public.messages FOR SELECT
  USING (conversation_id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid()));

-- RLS: Users can send messages to their conversations
CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid())
  );
