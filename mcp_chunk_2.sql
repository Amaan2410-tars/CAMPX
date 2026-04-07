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
