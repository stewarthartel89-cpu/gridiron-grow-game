
-- Fix: Tighten conversation_members INSERT policy
-- Only allow users to add themselves. Group chat additions are handled by SECURITY DEFINER triggers.
DROP POLICY IF EXISTS "Users can add conversation members" ON public.conversation_members;

CREATE POLICY "Users can add conversation members"
  ON public.conversation_members FOR INSERT
  WITH CHECK (user_id = auth.uid());
