
-- Ensure grants exist for authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Re-create the INSERT policy to be sure it's correct
DROP POLICY IF EXISTS "Authenticated users can create leagues" ON public.leagues;
CREATE POLICY "Authenticated users can create leagues"
  ON public.leagues FOR INSERT
  TO authenticated
  WITH CHECK (commissioner_id = auth.uid());
