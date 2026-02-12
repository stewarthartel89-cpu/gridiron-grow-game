
-- Create a helper function to get conversation IDs for a user (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT conversation_id FROM public.conversation_members
  WHERE user_id = _user_id AND _user_id = auth.uid();
$$;

-- Fix the recursive SELECT policy
DROP POLICY "Users see conversation members" ON public.conversation_members;

CREATE POLICY "Users see conversation members"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (conversation_id IN (SELECT get_user_conversation_ids(auth.uid())));

-- Also fix the INSERT policy which has the same recursion issue
DROP POLICY "Users can add conversation members" ON public.conversation_members;

CREATE POLICY "Users can add conversation members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR conversation_id IN (SELECT get_user_conversation_ids(auth.uid()))
  );
