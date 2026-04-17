  -- Admin action: verify/activate a user profile.
  -- This is SECURITY DEFINER so client-side admin UI can call it safely.

  CREATE OR REPLACE FUNCTION public.admin_verify_user(_user_id uuid, _verification_status text DEFAULT 'verified', _tier text DEFAULT NULL)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, auth
  AS $$
  DECLARE
    next_status text;
    next_tier text;
  BEGIN
    IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
      RAISE EXCEPTION 'forbidden';
    END IF;

    IF _user_id IS NULL THEN
      RAISE EXCEPTION 'invalid user id';
    END IF;

    next_status := COALESCE(NULLIF(trim(_verification_status), ''), 'verified');
    IF next_status NOT IN ('unverified', 'email_verified', 'verified') THEN
      RAISE EXCEPTION 'invalid verification status';
    END IF;

    next_tier := NULLIF(trim(COALESCE(_tier, '')), '');
    IF next_tier IS NOT NULL AND next_tier NOT IN ('basic', 'verified', 'pro', 'plus') THEN
      RAISE EXCEPTION 'invalid tier';
    END IF;

    UPDATE public.profiles
    SET
      verification_status = next_status,
      tier = COALESCE(next_tier, CASE WHEN tier = 'basic' THEN 'verified' ELSE tier END),
      updated_at = now()
    WHERE id = _user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'profile not found';
    END IF;
  END;
  $$;

  GRANT EXECUTE ON FUNCTION public.admin_verify_user(uuid, text, text) TO authenticated;

