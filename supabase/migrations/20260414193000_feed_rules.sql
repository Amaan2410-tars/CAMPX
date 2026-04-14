-- Feed rules for launch:
-- - Explore feed shows posts from verified/pro/plus authors only (Basic can view)
-- - College feed is accessible only to verified+ viewers and is isolated to viewer's college_id
-- - Plus users do not see sponsored posts (query-level)

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.get_feed_with_counts(p_kind text, p_limit int DEFAULT 40)
RETURNS TABLE (
  id uuid,
  body text,
  created_at timestamptz,
  author_id uuid,
  like_count bigint,
  comment_count bigint,
  repost_count bigint,
  full_name text,
  campx_id text,
  college text
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  viewer_tier text;
  viewer_college uuid;
BEGIN
  IF me IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT tier, college_id INTO viewer_tier, viewer_college
  FROM public.profiles
  WHERE id = me;

  IF p_kind = 'college' THEN
    IF NOT public.require_min_tier('verified') THEN
      RAISE EXCEPTION 'forbidden';
    END IF;
    IF viewer_college IS NULL THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.body,
    p.created_at,
    p.author_id,
    (SELECT count(*)::bigint FROM public.post_likes pl WHERE pl.post_id = p.id),
    (SELECT count(*)::bigint FROM public.post_comments pc WHERE pc.post_id = p.id),
    (SELECT count(*)::bigint FROM public.post_reposts pr WHERE pr.post_id = p.id),
    prf.full_name,
    prf.campx_id,
    prf.college
  FROM public.posts p
  INNER JOIN public.profiles prf ON prf.id = p.author_id
  WHERE
    p.feed_kind = p_kind
    -- Explore feed: only verified+ authors
    AND (
      p_kind <> 'explore'
      OR prf.tier IN ('verified', 'pro', 'plus')
    )
    -- College feed: same-college isolation
    AND (
      p_kind <> 'college'
      OR prf.college_id = viewer_college
    )
    -- Plus users should not see sponsored posts (across feeds)
    AND (
      lower(coalesce(viewer_tier, 'basic')) <> 'plus'
      OR p.is_sponsored = false
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_feed_with_counts(text, int) TO authenticated;

