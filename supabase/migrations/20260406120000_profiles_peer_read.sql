-- Allow signed-in users to read other students’ public profile fields (for feed author names).
-- Tighten later with a view or column-level exposure if you add sensitive data to profiles.

DROP POLICY IF EXISTS "profiles_select_peers" ON public.profiles;
CREATE POLICY "profiles_select_peers" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
