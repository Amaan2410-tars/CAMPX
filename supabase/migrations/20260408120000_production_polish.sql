-- One subscription row per user (upserts from webhooks / app)
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_user ON public.subscriptions (user_id);

ALTER TABLE public.ambassador_stats
  ADD COLUMN IF NOT EXISTS pending_leads INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.ambassador_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
BEGIN
  IF NOT (
    public.has_app_role('ambassador')
    OR public.has_app_role('founder')
    OR public.has_app_role('admin')
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT
    recognition_points,
    referrals_week,
    events_assisted,
    pending_leads
  INTO s
  FROM public.ambassador_stats
  WHERE user_id = auth.uid();

  RETURN jsonb_build_object(
    'recognition_points', COALESCE(s.recognition_points, 0),
    'referrals_week', COALESCE(s.referrals_week, 0),
    'events_assisted', COALESCE(s.events_assisted, 0),
    'pending_leads', COALESCE(s.pending_leads, 0)
  );
END;
$$;
