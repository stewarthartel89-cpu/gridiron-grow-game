
-- Fix conversation_members SELECT policy to allow seeing co-members
DROP POLICY "Users see own memberships" ON public.conversation_members;

CREATE POLICY "Users see conversation members"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT cm.conversation_id FROM public.conversation_members cm WHERE cm.user_id = auth.uid()
    )
  );

-- Add last_read_at to track unread messages
ALTER TABLE public.conversation_members
  ADD COLUMN last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Allow users to update their own last_read_at
CREATE POLICY "Users can update own membership"
  ON public.conversation_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
