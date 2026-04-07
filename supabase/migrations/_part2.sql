
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

-- â”€â”€â”€ Community posts (optional channel for community tab) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ Billing (Razorpay identifiers stored; payment verified via Edge Function) â”€
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

-- â”€â”€â”€ Audit log (staff writes via app using elevated RPC later) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
