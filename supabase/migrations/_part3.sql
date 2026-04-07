
-- â”€â”€â”€ Analytics rollups (dashboards) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  day DATE PRIMARY KEY,
  dau INTEGER NOT NULL DEFAULT 0,
  signups INTEGER NOT NULL DEFAULT 0,
  posts_created INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_select_staff" ON public.analytics_daily;
CREATE POLICY "analytics_select_staff" ON public.analytics_daily
  FOR SELECT TO authenticated USING (public.has_app_role('founder') OR public.has_app_role('admin'));

-- Ambassador metrics (simple aggregate table)
CREATE TABLE IF NOT EXISTS public.ambassador_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  referrals_week INTEGER NOT NULL DEFAULT 0,
  events_assisted INTEGER NOT NULL DEFAULT 0,
  recognition_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ambassador_stats_select_own_or_staff" ON public.ambassador_stats;
CREATE POLICY "ambassador_stats_select_own_or_staff" ON public.ambassador_stats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_any_staff_role());

DROP POLICY IF EXISTS "ambassador_stats_update_staff" ON public.ambassador_stats;
CREATE POLICY "ambassador_stats_update_staff" ON public.ambassador_stats
  FOR UPDATE TO authenticated
  USING (public.has_any_staff_role())
  WITH CHECK (public.has_any_staff_role());

-- Notify post author on like (server-side; bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.tg_notify_post_liked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  author uuid;
BEGIN
  SELECT p.author_id INTO author FROM public.posts p WHERE p.id = NEW.post_id;
  IF author IS NOT NULL AND author <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, payload)
    VALUES (
      author,
      'post_like',
      'New like',
      'Someone liked your post',
      jsonb_build_object('post_id', NEW.post_id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_likes_notify ON public.post_likes;
CREATE TRIGGER trg_post_likes_notify
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_notify_post_liked();

-- Feed list with interaction counts (single round-trip)
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
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
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
  WHERE p.feed_kind = p_kind
  ORDER BY p.created_at DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_feed_with_counts(text, int) TO authenticated;

-- DM: find or create 1:1 conversation (two participants only)
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

CREATE OR REPLACE FUNCTION public.founder_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN jsonb_build_object(
    'open_reports', (SELECT count(*)::int FROM public.reports WHERE status = 'open'),
    'profiles_total', (SELECT count(*)::int FROM public.profiles),
    'dau_today', COALESCE((SELECT dau FROM public.analytics_daily WHERE day = CURRENT_DATE), 0),
    'signups_today', COALESCE((SELECT signups FROM public.analytics_daily WHERE day = CURRENT_DATE), 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.founder_dashboard_metrics() TO authenticated;

CREATE OR REPLACE FUNCTION public.ambassador_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pts int;
BEGIN
  IF NOT (
    public.has_app_role('ambassador')
    OR public.has_app_role('founder')
    OR public.has_app_role('admin')
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT recognition_points INTO pts
  FROM public.ambassador_stats
  WHERE user_id = auth.uid();
  RETURN jsonb_build_object(
    'recognition_points', COALESCE(pts, 0),
    'referrals_week', COALESCE((SELECT referrals_week FROM public.ambassador_stats WHERE user_id = auth.uid()), 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.ambassador_dashboard_metrics() TO authenticated;
