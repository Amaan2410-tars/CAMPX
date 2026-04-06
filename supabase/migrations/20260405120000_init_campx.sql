-- CampX initial schema (run via Supabase CLI or SQL Editor → New migration)
-- Requires: Auth enabled, email provider configured

-- ─── Profiles (1:1 with auth.users) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  college TEXT NOT NULL DEFAULT '',
  program TEXT NOT NULL DEFAULT 'ug' CHECK (program IN ('ug', 'pg')),
  year_of_study TEXT NOT NULL DEFAULT '',
  major TEXT,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'verified', 'pro', 'plus')),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'email_verified', 'kyc_pending', 'verified')),
  campx_id TEXT UNIQUE NOT NULL,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_campx_id_idx ON public.profiles (campx_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── New user → profile row (metadata from signUp options.data) ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb;
  new_campx_id text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  new_campx_id := 'CX-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    college,
    program,
    year_of_study,
    major,
    marketing_opt_in,
    campx_id
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(meta->>'full_name'), ''), ''),
    NULLIF(trim(meta->>'phone'), ''),
    COALESCE(NULLIF(trim(meta->>'college'), ''), ''),
    CASE WHEN lower(COALESCE(meta->>'program', 'ug')) = 'pg' THEN 'pg' ELSE 'ug' END,
    COALESCE(NULLIF(trim(meta->>'year_of_study'), ''), ''),
    NULLIF(trim(meta->>'major'), ''),
    CASE
      WHEN lower(trim(COALESCE(meta->>'marketing_opt_in', ''))) IN ('true', 't', '1') THEN true
      ELSE false
    END,
    new_campx_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── updated_at ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS handle_profile_updated_at ON public.profiles;
CREATE TRIGGER handle_profile_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
