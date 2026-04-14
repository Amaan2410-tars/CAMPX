-- Launch audit hardening: remove KYC, add college email domain verification, age gate, and tier enforcement.
-- Apply after existing migrations.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) College email domains (source of truth)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.college_email_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.colleges (id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain)
);

CREATE INDEX IF NOT EXISTS college_email_domains_college_idx ON public.college_email_domains (college_id);

ALTER TABLE public.college_email_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "college_email_domains_select_authenticated" ON public.college_email_domains;
CREATE POLICY "college_email_domains_select_authenticated" ON public.college_email_domains
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "college_email_domains_write_staff" ON public.college_email_domains;
CREATE POLICY "college_email_domains_write_staff" ON public.college_email_domains
  FOR ALL TO authenticated
  USING (public.has_any_staff_role())
  WITH CHECK (public.has_any_staff_role());

CREATE OR REPLACE FUNCTION public.normalize_domain(_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    CASE
      WHEN _input IS NULL THEN ''
      ELSE regexp_replace(lower(trim(both from replace(_input, '@', ''))), '^www\.', '')
    END;
$$;

CREATE OR REPLACE FUNCTION public.email_domain(_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.normalize_domain(split_part(coalesce(_email, ''), '@', 2));
$$;

CREATE OR REPLACE FUNCTION public.college_for_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ced.college_id
  FROM public.college_email_domains ced
  WHERE ced.domain = public.email_domain(_email)
     OR public.email_domain(_email) LIKE ('%.' || ced.domain)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.college_for_email(text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Profiles: add college_id + dob, remove KYC status, lock immutable fields
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges (id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Drop legacy KYC-only verification status value.
UPDATE public.profiles
SET verification_status = 'unverified'
WHERE verification_status = 'kyc_pending';

-- Replace the verification_status check constraint to remove kyc_pending.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_verification_status_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_verification_status_check;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status IN ('unverified', 'email_verified', 'verified'));

-- Prevent editing immutable identity fields after initial set.
CREATE OR REPLACE FUNCTION public.tg_profiles_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- full_name must not change after it's first set to a non-empty value
  IF coalesce(OLD.full_name, '') <> '' AND NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    RAISE EXCEPTION 'full_name cannot be changed after signup';
  END IF;

  -- college_id must not change after it is set once
  IF OLD.college_id IS NOT NULL AND NEW.college_id IS DISTINCT FROM OLD.college_id THEN
    RAISE EXCEPTION 'college_id cannot be changed after signup';
  END IF;

  -- major (course) must not change after it is set once
  IF OLD.major IS NOT NULL AND NEW.major IS DISTINCT FROM OLD.major THEN
    RAISE EXCEPTION 'major cannot be changed after signup';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_immutable_fields ON public.profiles;
CREATE TRIGGER trg_profiles_immutable_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_profiles_immutable_fields();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Age gate: block under-18 accounts at user creation
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.assert_age_18_plus(_dob date)
RETURNS void
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF _dob IS NULL THEN
    RETURN;
  END IF;
  IF _dob > (CURRENT_DATE - INTERVAL '18 years')::date THEN
    RAISE EXCEPTION 'must be 18+';
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Replace new-user profile trigger: set dob/college_id from metadata and gate age
-- ─────────────────────────────────────────────────────────────────────────────
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
    date_of_birth
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
    meta_dob
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Auto-upgrade to Verified on email confirmation if domain matches
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.tg_on_auth_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cid uuid;
BEGIN
  -- Only act on first confirmation event.
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    cid := public.college_for_email(NEW.email);
    IF cid IS NOT NULL THEN
      UPDATE public.profiles
      SET
        tier = 'verified',
        verification_status = 'verified',
        college_id = COALESCE(college_id, cid)
      WHERE id = NEW.id;
    ELSE
      UPDATE public.profiles
      SET
        tier = COALESCE(NULLIF(tier, ''), 'basic'),
        verification_status = CASE
          WHEN verification_status = 'verified' THEN verification_status
          ELSE 'email_verified'
        END
      WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_on_auth_email_confirmed();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6) Tier helper + enforce Basic blocks (server-side)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.tier_rank(_tier text)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(coalesce(_tier, 'basic'))
    WHEN 'basic' THEN 0
    WHEN 'verified' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'plus' THEN 3
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_tier()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT tier FROM public.profiles WHERE id = auth.uid()), 'basic');
$$;

CREATE OR REPLACE FUNCTION public.require_min_tier(_min text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.tier_rank(public.current_user_tier()) >= public.tier_rank(_min);
$$;

-- Posts: Basic can read, but cannot create/update/delete posts.
DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND public.require_min_tier('verified'));

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id AND public.require_min_tier('verified'))
  WITH CHECK (auth.uid() = author_id AND public.require_min_tier('verified'));

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id AND public.require_min_tier('verified'));

-- Likes/comments/reposts: Verified+ only.
DROP POLICY IF EXISTS "post_likes_insert_self" ON public.post_likes;
CREATE POLICY "post_likes_insert_self" ON public.post_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.require_min_tier('verified'));

DROP POLICY IF EXISTS "post_comments_insert_own" ON public.post_comments;
CREATE POLICY "post_comments_insert_own" ON public.post_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.require_min_tier('verified'));

DROP POLICY IF EXISTS "post_reposts_insert_own" ON public.post_reposts;
CREATE POLICY "post_reposts_insert_own" ON public.post_reposts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.require_min_tier('verified'));

-- DMs: block Basic from reading or sending messages at the RLS layer.
DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    public.require_min_tier('verified')
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "conv_part_select_participant" ON public.conversation_participants;
CREATE POLICY "conv_part_select_participant" ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (public.require_min_tier('verified') AND user_id = auth.uid());

DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT TO authenticated
  USING (
    public.require_min_tier('verified')
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.require_min_tier('verified')
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

