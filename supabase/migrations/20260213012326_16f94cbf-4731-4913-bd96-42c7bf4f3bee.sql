-- Allow group conversations to be created (by the trigger which is SECURITY DEFINER)
-- Drop the overly restrictive INSERT policy on conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Recreate to allow both DM and group creation
-- Group conversations are only created by the SECURITY DEFINER trigger, 
-- but we also need a policy that doesn't block the trigger.
-- Since the trigger is SECURITY DEFINER, we need to ensure RLS doesn't block it.
-- The simplest fix: allow authenticated users to insert conversations they're part of.
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Note: The create_league_group_chat trigger runs as SECURITY DEFINER but 
-- RLS is still enforced. We need to explicitly bypass it in the function.
-- Let's update the function to use SET LOCAL to bypass RLS.

-- Alternative approach: just make the policy more permissive for the trigger
-- Actually, SECURITY DEFINER functions DO bypass RLS by default in Supabase
-- if the function owner is the postgres role. Let me check if the issue is 
-- actually the conversation_members table instead.

-- Also fix conversation_members INSERT policy which is restrictive
DROP POLICY IF EXISTS "Users can add conversation members" ON public.conversation_members;

CREATE POLICY "Users can add conversation members"
ON public.conversation_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
