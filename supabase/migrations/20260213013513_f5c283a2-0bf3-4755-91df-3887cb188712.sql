-- Allow commissioners to delete their own league
CREATE POLICY "Commissioner can delete league"
ON public.leagues
FOR DELETE
TO authenticated
USING (commissioner_id = auth.uid());
