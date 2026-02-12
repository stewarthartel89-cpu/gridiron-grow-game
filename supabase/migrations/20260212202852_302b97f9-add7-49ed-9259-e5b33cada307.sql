
-- Drop the restrictive INSERT policy and recreate as permissive
DROP POLICY "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (type = 'dm');

-- Also need a permissive SELECT so new conversations can be returned
-- The existing SELECT is restrictive, which blocks returning the row after INSERT
-- We need to keep existing restrictive SELECT but also allow seeing conversations you just created
-- Actually the simplest fix is to make the SELECT permissive
DROP POLICY "Members can view conversations" ON public.conversations;

CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (id IN (SELECT conversation_id FROM public.conversation_members WHERE user_id = auth.uid()));
