-- Fix 403s in admin panel by granting table privileges and adding staff write policy.
-- RLS policies alone are not sufficient if SQL privileges are missing.

-- ─────────────────────────────────────────────────────────────────────────────
-- colleges
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.colleges') IS NULL THEN
    RAISE NOTICE 'Skipping colleges grants/policies: public.colleges does not exist';
    RETURN;
  END IF;

  GRANT SELECT ON TABLE public.colleges TO anon, authenticated;
  GRANT INSERT, UPDATE, DELETE ON TABLE public.colleges TO authenticated;

  ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "colleges_staff_write" ON public.colleges;
  CREATE POLICY "colleges_staff_write" ON public.colleges
    FOR ALL TO authenticated
    USING (public.has_any_staff_role())
    WITH CHECK (public.has_any_staff_role());
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- college_email_domains
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.college_email_domains') IS NULL THEN
    RAISE NOTICE 'Skipping college_email_domains grants: public.college_email_domains does not exist';
    RETURN;
  END IF;

  GRANT SELECT ON TABLE public.college_email_domains TO authenticated;
  GRANT INSERT, UPDATE, DELETE ON TABLE public.college_email_domains TO authenticated;
END $$;

