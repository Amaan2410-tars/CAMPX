-- Secure helper to grant/revoke staff roles by email.
-- This avoids direct editing of user_roles from the client.

CREATE OR REPLACE FUNCTION public.grant_user_role_by_email(_email text, _role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RAISE EXCEPTION 'invalid email';
  END IF;

  IF _role NOT IN ('founder', 'admin', 'moderator', 'ambassador', 'user') THEN
    RAISE EXCEPTION 'invalid role';
  END IF;

  SELECT u.id
  INTO target_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(_email))
  LIMIT 1;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'user not found for email';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (target_id, _role, auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_user_role_by_email(_email text, _role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RAISE EXCEPTION 'invalid email';
  END IF;

  IF _role NOT IN ('founder', 'admin', 'moderator', 'ambassador', 'user') THEN
    RAISE EXCEPTION 'invalid role';
  END IF;

  SELECT u.id
  INTO target_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(_email))
  LIMIT 1;

  IF target_id IS NULL THEN
    RAISE EXCEPTION 'user not found for email';
  END IF;

  DELETE FROM public.user_roles ur
  WHERE ur.user_id = target_id
    AND ur.role = _role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_user_role_by_email(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_role_by_email(text, text) TO authenticated;

