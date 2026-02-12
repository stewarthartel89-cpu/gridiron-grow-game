
-- Allow authenticated users to create DM conversations
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND type = 'dm');

-- Allow users to add members to conversations they created
CREATE POLICY "Users can add conversation members"
  ON public.conversation_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
