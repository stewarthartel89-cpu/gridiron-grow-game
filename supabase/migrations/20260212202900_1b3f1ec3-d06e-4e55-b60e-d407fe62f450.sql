
-- Fix conversation_members policies to be permissive
DROP POLICY "Users see own memberships" ON public.conversation_members;
DROP POLICY "Users can add conversation members" ON public.conversation_members;

CREATE POLICY "Users see own memberships"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add conversation members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also fix messages policies to be permissive
DROP POLICY "Members can view messages" ON public.messages;
DROP POLICY "Members can send messages" ON public.messages;

CREATE POLICY "Members can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (conversation_id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid())
  );
