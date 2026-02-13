-- Allow commissioners to clean up league data when terminating

-- Commissioner can delete all league members
CREATE POLICY "Commissioner can delete league members"
ON public.league_members
FOR DELETE
TO authenticated
USING (league_id IN (SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()));

-- Commissioner can delete matchups
CREATE POLICY "Commissioner can delete matchups"
ON public.matchups
FOR DELETE
TO authenticated
USING (league_id IN (SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()));

-- Commissioner can delete league holdings
CREATE POLICY "Commissioner can delete league holdings"
ON public.holdings
FOR DELETE
TO authenticated
USING (league_id IN (SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()));

-- Commissioner can delete activity feed
CREATE POLICY "Commissioner can delete activity feed"
ON public.activity_feed
FOR DELETE
TO authenticated
USING (league_id IN (SELECT id FROM public.leagues WHERE commissioner_id = auth.uid()));
