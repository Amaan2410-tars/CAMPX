-- CampX production core: RBAC, feed interactions, DMs, notifications, moderation, events, billing, audit.
-- Apply after existing migrations.

-- ─── Role helpers ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('founder', 'admin', 'moderator', 'ambassador', 'user')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles (role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_app_role(_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_staff_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('founder', 'admin', 'moderator')
  );
$$;

DROP POLICY IF EXISTS "user_roles_select_own_or_staff" ON public.user_roles;
CREATE POLICY "user_roles_select_own_or_staff" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_any_staff_role());

DROP POLICY IF EXISTS "user_roles_insert_founder_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_founder_admin" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_app_role('founder') OR public.has_app_role('admin'));

DROP POLICY IF EXISTS "user_roles_delete_founder_admin" ON public.user_roles;
CREATE POLICY "user_roles_delete_founder_admin" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_app_role('founder') OR public.has_app_role('admin'));

-- ─── Feed interactions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS post_likes_user_idx ON public.post_likes (user_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_likes_select_authenticated" ON public.post_likes;
CREATE POLICY "post_likes_select_authenticated" ON public.post_likes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "post_likes_insert_self" ON public.post_likes;
CREATE POLICY "post_likes_insert_self" ON public.post_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_likes_delete_self" ON public.post_likes;
CREATE POLICY "post_likes_delete_self" ON public.post_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_comments_post_idx ON public.post_comments (post_id, created_at DESC);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_comments_select_authenticated" ON public.post_comments;
CREATE POLICY "post_comments_select_authenticated" ON public.post_comments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "post_comments_insert_own" ON public.post_comments;
CREATE POLICY "post_comments_insert_own" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_comments_delete_own" ON public.post_comments;
CREATE POLICY "post_comments_delete_own" ON public.post_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.post_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS post_reposts_post_idx ON public.post_reposts (post_id);

ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_reposts_select_authenticated" ON public.post_reposts;
CREATE POLICY "post_reposts_select_authenticated" ON public.post_reposts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "post_reposts_insert_own" ON public.post_reposts;
CREATE POLICY "post_reposts_insert_own" ON public.post_reposts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "post_reposts_delete_own" ON public.post_reposts;
CREATE POLICY "post_reposts_delete_own" ON public.post_reposts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─── Notifications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_preferences_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_own" ON public.notification_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── DMs ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conv_created_idx ON public.messages (conversation_id, created_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conv_part_select_participant" ON public.conversation_participants;
CREATE POLICY "conv_part_select_participant" ON public.conversation_participants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "conv_part_insert_self" ON public.conversation_participants;
CREATE POLICY "conv_part_insert_self" ON public.conversation_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_select_participant" ON public.messages;
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

-- ─── Moderation ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'profile', 'message', 'community')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports (status, created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_reporter_or_staff" ON public.reports;
CREATE POLICY "reports_select_reporter_or_staff" ON public.reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_any_staff_role());

DROP POLICY IF EXISTS "reports_update_staff" ON public.reports;
CREATE POLICY "reports_update_staff" ON public.reports
  FOR UPDATE TO authenticated
  USING (public.has_any_staff_role())
  WITH CHECK (public.has_any_staff_role());

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports (id) ON DELETE SET NULL,
  moderator_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mod_actions_select_staff" ON public.moderation_actions;
CREATE POLICY "mod_actions_select_staff" ON public.moderation_actions
  FOR SELECT TO authenticated USING (public.has_any_staff_role());

DROP POLICY IF EXISTS "mod_actions_insert_staff" ON public.moderation_actions;
CREATE POLICY "mod_actions_insert_staff" ON public.moderation_actions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_staff_role() AND auth.uid() = moderator_id);

CREATE TABLE IF NOT EXISTS public.appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appeals_insert_own" ON public.appeals;
CREATE POLICY "appeals_insert_own" ON public.appeals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "appeals_select_own_or_staff" ON public.appeals;
CREATE POLICY "appeals_select_own_or_staff" ON public.appeals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_any_staff_role());

-- ─── Community posts (optional channel for community tab) ─────────────────
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities (id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_posts_community_idx ON public.community_posts (community_id, created_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts_select_member" ON public.community_posts;
CREATE POLICY "community_posts_select_member" ON public.community_posts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members m
      WHERE m.community_id = community_id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "community_posts_insert_member" ON public.community_posts;
CREATE POLICY "community_posts_insert_member" ON public.community_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.community_members m
      WHERE m.community_id = community_id AND m.user_id = auth.uid()
    )
  );

-- ─── Events ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  tier_min TEXT CHECK (tier_min IS NULL OR tier_min IN ('basic', 'verified', 'pro', 'plus')),
  created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  event_id UUID NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_authenticated" ON public.events;
CREATE POLICY "events_select_authenticated" ON public.events
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events;
CREATE POLICY "events_insert_authenticated" ON public.events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "event_reg_select_own" ON public.event_registrations;
CREATE POLICY "event_reg_select_own" ON public.event_registrations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "event_reg_insert_own" ON public.event_registrations;
CREATE POLICY "event_reg_insert_own" ON public.event_registrations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─── Billing (Razorpay identifiers stored; payment verified via Edge Function) ─
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  interval TEXT NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  razorpay_plan_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plans_select_authenticated" ON public.plans;
CREATE POLICY "plans_select_authenticated" ON public.plans
  FOR SELECT TO authenticated USING (active = true OR public.has_any_staff_role());

DROP POLICY IF EXISTS "plans_insert_staff" ON public.plans;
CREATE POLICY "plans_insert_staff" ON public.plans
  FOR INSERT TO authenticated WITH CHECK (public.has_app_role('founder') OR public.has_app_role('admin'));

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'past_due', 'canceled')),
  current_period_end TIMESTAMPTZ,
  razorpay_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON public.subscriptions (user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_any_staff_role());

DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_update_own_staff" ON public.subscriptions;
CREATE POLICY "subscriptions_update_own_staff" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_any_staff_role())
  WITH CHECK (user_id = auth.uid() OR public.has_any_staff_role());

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_any_staff_role());

CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
-- Service role only in practice; deny anon/authenticated direct access
DROP POLICY IF EXISTS "billing_events_deny_all" ON public.billing_events;
CREATE POLICY "billing_events_deny_all" ON public.billing_events
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ─── Audit log (staff writes via app using elevated RPC later) ─────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select_staff" ON public.audit_log;
CREATE POLICY "audit_select_staff" ON public.audit_log
  FOR SELECT TO authenticated USING (public.has_any_staff_role());

-- ─── Analytics rollups (dashboards) ─────────────────────────────────────────
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
