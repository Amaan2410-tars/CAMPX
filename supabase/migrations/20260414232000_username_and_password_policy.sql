-- User-chosen username (unique) support.

-- 1) Add username column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

-- 2) Enforce uniqueness (case-insensitive via unique index on lower(username))
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_uniq
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL AND length(username) > 0;

-- 3) Basic validation constraint (only if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_username_format_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_format_check
      CHECK (
        username IS NULL
        OR username ~ '^[a-zA-Z0-9_\\.]{3,20}$'
      );
  END IF;
END $$;

-- 4) Allow user to set username on their own profile (existing policies already allow UPDATE own).
-- Staff can also update via existing staff policy.

-- 5) Update new-user trigger to capture username from metadata if provided.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb;
  new_campx_id text;
  meta_dob date;
  meta_college_id uuid;
  meta_username text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  new_campx_id := 'CX-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  -- Optional DOB for age-gate (ISO date string recommended).
  BEGIN
    meta_dob := NULLIF(trim(meta->>'date_of_birth'), '')::date;
  EXCEPTION WHEN others THEN
    meta_dob := NULL;
  END;

  PERFORM public.assert_age_18_plus(meta_dob);

  BEGIN
    meta_college_id := NULLIF(trim(meta->>'college_id'), '')::uuid;
  EXCEPTION WHEN others THEN
    meta_college_id := NULL;
  END;

  meta_username := lower(NULLIF(trim(meta->>'username'), ''));

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    college,
    college_id,
    program,
    year_of_study,
    major,
    marketing_opt_in,
    campx_id,
    date_of_birth,
    username
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(meta->>'full_name'), ''), ''),
    NEW.email,
    NULLIF(trim(meta->>'phone'), ''),
    COALESCE(NULLIF(trim(meta->>'college'), ''), ''),
    meta_college_id,
    CASE WHEN lower(COALESCE(meta->>'program', 'ug')) = 'pg' THEN 'pg' ELSE 'ug' END,
    COALESCE(NULLIF(trim(meta->>'year_of_study'), ''), ''),
    NULLIF(trim(meta->>'major'), ''),
    CASE
      WHEN lower(trim(COALESCE(meta->>'marketing_opt_in', ''))) IN ('true', 't', '1') THEN true
      ELSE false
    END,
    new_campx_id,
    meta_dob,
    meta_username
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

