-- Communities + DMs launch enforcement (server-side).
-- Applies to the schema created in existing migrations (public.communities, public.community_members, public.conversations/messages).

-- ─────────────────────────────────────────────────────────────────────────────
-- Communities: Verified join cap (5), Pro/Plus unlimited; Basic cannot join.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.community_join_allowed()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t text;
  joined_count int;
BEGIN
  t := public.current_user_tier();

  IF public.tier_rank(t) < public.tier_rank('verified') THEN
    RETURN false;
  END IF;

  IF public.tier_rank(t) >= public.tier_rank('pro') THEN
    RETURN true;
  END IF;

  SELECT count(*)::int INTO joined_count
  FROM public.community_members
  WHERE user_id = auth.uid();

  RETURN joined_count < 5;
END;
$$;

-- Tighten insert policy for community_members
DROP POLICY IF EXISTS "community_members_insert_self" ON public.community_members;
CREATE POLICY "community_members_insert_self" ON public.community_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.community_join_allowed());

-- Community creation must not auto-publish: introduce requests table (admin review queue).
-- Keep schema aligned with later migrations (created_by references auth.users).
CREATE TABLE IF NOT EXISTS public.community_creation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

ALTER TABLE public.community_creation_requests ENABLE ROW LEVEL SECURITY;

-- Drop any older policy names (from previous iterations).
DROP POLICY IF EXISTS "community_creation_requests_insert_verified" ON public.community_creation_requests;
DROP POLICY IF EXISTS "community_creation_requests_select_own_or_staff" ON public.community_creation_requests;

DROP POLICY IF EXISTS "community_creation_requests_insert_own" ON public.community_creation_requests;
CREATE POLICY "community_creation_requests_insert_own" ON public.community_creation_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.require_min_tier('pro') -- only Pro/Plus can request creation
  );

DROP POLICY IF EXISTS "community_creation_requests_select_staff" ON public.community_creation_requests;
CREATE POLICY "community_creation_requests_select_staff" ON public.community_creation_requests
  FOR SELECT TO authenticated
  USING (public.has_any_staff_role());

DROP POLICY IF EXISTS "community_creation_requests_update_staff" ON public.community_creation_requests;
CREATE POLICY "community_creation_requests_update_staff" ON public.community_creation_requests
  FOR UPDATE TO authenticated
  USING (public.has_any_staff_role())
  WITH CHECK (public.has_any_staff_role());

-- Prevent direct community inserts by non-staff (forces approval flow).
DROP POLICY IF EXISTS "communities_insert_authenticated" ON public.communities;
CREATE POLICY "communities_insert_staff_only" ON public.communities
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_staff_role());

-- ─────────────────────────────────────────────────────────────────────────────
-- DMs: Basic blocked already (policies in launch_audit). Add same-college OR mutual-follow gate.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.are_mutual_follows(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Some environments may apply this migration before the follows table exists.
  -- In that case, treat as "not mutual" rather than erroring.
  IF to_regclass('public.follows') IS NULL THEN
    RETURN false;
  END IF;

  RETURN
    EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = _a AND f.following_id = _b)
    AND
    EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = _b AND f.following_id = _a);
END;
$$;

CREATE OR REPLACE FUNCTION public.can_dm(_other uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  my_college uuid;
  other_college uuid;
BEGIN
  IF me IS NULL THEN RETURN false; END IF;
  IF _other IS NULL OR _other = me THEN RETURN false; END IF;
  IF NOT public.require_min_tier('verified') THEN RETURN false; END IF;

  SELECT college_id INTO my_college FROM public.profiles WHERE id = me;
  SELECT college_id INTO other_college FROM public.profiles WHERE id = _other;

  IF my_college IS NOT NULL AND other_college IS NOT NULL AND my_college = other_college THEN
    RETURN true;
  END IF;

  RETURN public.are_mutual_follows(me, _other);
END;
$$;

-- Harden get_or_create_dm to enforce DM eligibility
CREATE OR REPLACE FUNCTION public.get_or_create_dm(_other uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cid uuid;
  me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _other IS NULL OR _other = me THEN RAISE EXCEPTION 'invalid peer'; END IF;
  IF NOT public.can_dm(_other) THEN RAISE EXCEPTION 'forbidden'; END IF;

  SELECT c.id INTO cid
  FROM public.conversations c
  WHERE (SELECT count(*)::int FROM public.conversation_participants p WHERE p.conversation_id = c.id) = 2
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = me)
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = _other)
  LIMIT 1;

  IF cid IS NOT NULL THEN RETURN cid; END IF;

  INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO cid;
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (cid, me), (cid, _other);
  RETURN cid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;

