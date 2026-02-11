CREATE POLICY "Commissioner can create matchups"
ON public.matchups FOR INSERT TO authenticated
WITH CHECK (
  league_id IN (
    SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()
  )
);