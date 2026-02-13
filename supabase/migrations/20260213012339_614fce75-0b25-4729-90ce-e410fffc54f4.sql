-- Fix overly permissive INSERT policy on conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Only allow DM creation directly by users; group conversations are created by SECURITY DEFINER trigger
CREATE POLICY "Users can create dm conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (type = 'dm');
