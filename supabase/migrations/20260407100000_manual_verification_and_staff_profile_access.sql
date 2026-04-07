-- Manual verification flow (founder/admin approve or reject)
-- plus staff read/update access for profile moderation.

-- Staff can review all profiles
DROP POLICY IF EXISTS "profiles_select_staff" ON public.profiles;
CREATE POLICY "profiles_select_staff" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_any_staff_role());

-- Staff can update verification-related profile fields
DROP POLICY IF EXISTS "profiles_update_staff" ON public.profiles;
CREATE POLICY "profiles_update_staff" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_app_role('founder') OR public.has_app_role('admin'))
  WITH CHECK (public.has_app_role('founder') OR public.has_app_role('admin'));

-- Optional helper used by founder dashboard action buttons.
CREATE OR REPLACE FUNCTION public.founder_review_account(
  _user_id uuid,
  _decision text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tier text;
  new_status text;
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'invalid decision';
  END IF;

  IF _decision = 'approve' THEN
    new_tier := 'verified';
    new_status := 'verified';
  ELSE
    new_tier := 'basic';
    new_status := 'unverified';
  END IF;

  UPDATE public.profiles
  SET
    tier = new_tier,
    verification_status = new_status,
    updated_at = now()
  WHERE id = _user_id;

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    CASE WHEN _decision = 'approve' THEN 'account_approved' ELSE 'account_rejected' END,
    'profile',
    _user_id::text,
    jsonb_build_object('decision', _decision)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'user_id', _user_id,
    'decision', _decision,
    'tier', new_tier,
    'verification_status', new_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.founder_review_account(uuid, text) TO authenticated;

