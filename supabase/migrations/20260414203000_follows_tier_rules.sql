-- Follow system tier enforcement:
-- - Basic users cannot follow or be followed.
-- - Verified+ users can follow.

-- Ensure follows table exists (some environments may not have it yet).
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT follows_pk PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_no_self CHECK (follower_id <> following_id)
);

CREATE OR REPLACE FUNCTION public.can_follow(_following uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  my_tier text;
  their_tier text;
BEGIN
  IF me IS NULL OR _following IS NULL OR _following = me THEN
    RETURN false;
  END IF;

  SELECT tier INTO my_tier FROM public.profiles WHERE id = me;
  SELECT tier INTO their_tier FROM public.profiles WHERE id = _following;

  IF public.tier_rank(my_tier) < public.tier_rank('verified') THEN
    RETURN false;
  END IF;
  IF public.tier_rank(their_tier) < public.tier_rank('verified') THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own follows" ON public.follows;
CREATE POLICY "follows_insert_verified_plus" ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id AND public.can_follow(following_id));

DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;
CREATE POLICY "follows_delete_self" ON public.follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

