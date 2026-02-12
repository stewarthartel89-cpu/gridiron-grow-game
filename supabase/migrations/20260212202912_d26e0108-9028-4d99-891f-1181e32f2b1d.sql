
-- Tighten conversation_members INSERT policy
DROP POLICY "Users can add conversation members" ON public.conversation_members;

CREATE POLICY "Users can add conversation members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves, or add others to conversations they're already in
    user_id = auth.uid()
    OR conversation_id IN (SELECT cm.conversation_id FROM public.conversation_members cm WHERE cm.user_id = auth.uid())
  );
