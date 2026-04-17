-- Admin wiring: moderation actions (warn/suspend/ban) + persistent platform toggles.

-- ─── Profile moderation fields ──────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS warning_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_warning_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_until timestamptz,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS banned_reason text;

CREATE INDEX IF NOT EXISTS profiles_suspended_until_idx ON public.profiles (suspended_until);
CREATE INDEX IF NOT EXISTS profiles_banned_at_idx ON public.profiles (banned_at);

-- ─── Platform settings (single row) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  maintenance_mode boolean NOT NULL DEFAULT false,
  allow_signups boolean NOT NULL DEFAULT true,
  auto_moderation boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_settings_select_staff" ON public.platform_settings;
CREATE POLICY "platform_settings_select_staff" ON public.platform_settings
  FOR SELECT TO authenticated
  USING (public.has_any_staff_role());

DROP POLICY IF EXISTS "platform_settings_update_admin" ON public.platform_settings;
CREATE POLICY "platform_settings_update_admin" ON public.platform_settings
  FOR UPDATE TO authenticated
  USING (public.has_app_role('founder') OR public.has_app_role('admin'))
  WITH CHECK (public.has_app_role('founder') OR public.has_app_role('admin'));

-- Ensure the singleton row exists.
INSERT INTO public.platform_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ─── Admin RPCs ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_issue_warning(_user_id uuid, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin') OR public.has_app_role('moderator')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'invalid user id';
  END IF;

  UPDATE public.profiles
  SET
    warning_count = COALESCE(warning_count, 0) + 1,
    last_warning_at = now(),
    updated_at = now()
  WHERE id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  INSERT INTO public.moderation_actions (moderator_id, action, notes)
  VALUES (auth.uid(), 'warning', _notes);

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'user_warning_issued',
    'profile',
    _user_id::text,
    jsonb_build_object('notes', COALESCE(_notes, ''))
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_suspend_user(_user_id uuid, _days int DEFAULT 7, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  d int;
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin') OR public.has_app_role('moderator')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'invalid user id';
  END IF;
  d := GREATEST(1, LEAST(COALESCE(_days, 7), 365));

  UPDATE public.profiles
  SET
    suspended_until = now() + make_interval(days => d),
    updated_at = now()
  WHERE id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  INSERT INTO public.moderation_actions (moderator_id, action, notes)
  VALUES (auth.uid(), 'suspend', _notes);

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, meta)
  VALUES (
    auth.uid(),
    'user_suspended',
    'profile',
    _user_id::text,
    jsonb_build_object('days', d, 'notes', COALESCE(_notes, ''))
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unsuspend_user(_user_id uuid, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin') OR public.has_app_role('moderator')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'invalid user id';
  END IF;

  UPDATE public.profiles
  SET suspended_until = NULL, updated_at = now()
  WHERE id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  INSERT INTO public.moderation_actions (moderator_id, action, notes)
  VALUES (auth.uid(), 'unsuspend', _notes);

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), 'user_unsuspended', 'profile', _user_id::text, jsonb_build_object('notes', COALESCE(_notes, '')));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_ban_user(_user_id uuid, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'invalid user id';
  END IF;

  UPDATE public.profiles
  SET
    banned_at = now(),
    banned_reason = _notes,
    updated_at = now()
  WHERE id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  INSERT INTO public.moderation_actions (moderator_id, action, notes)
  VALUES (auth.uid(), 'ban', _notes);

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), 'user_banned', 'profile', _user_id::text, jsonb_build_object('notes', COALESCE(_notes, '')));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unban_user(_user_id uuid, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'invalid user id';
  END IF;

  UPDATE public.profiles
  SET banned_at = NULL, banned_reason = NULL, updated_at = now()
  WHERE id = _user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  INSERT INTO public.moderation_actions (moderator_id, action, notes)
  VALUES (auth.uid(), 'unban', _notes);

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), 'user_unbanned', 'profile', _user_id::text, jsonb_build_object('notes', COALESCE(_notes, '')));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_platform_setting(_key text, _value boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT (public.has_app_role('founder') OR public.has_app_role('admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _key NOT IN ('maintenance_mode', 'allow_signups', 'auto_moderation') THEN
    RAISE EXCEPTION 'invalid key';
  END IF;

  UPDATE public.platform_settings
  SET
    maintenance_mode = CASE WHEN _key = 'maintenance_mode' THEN _value ELSE maintenance_mode END,
    allow_signups = CASE WHEN _key = 'allow_signups' THEN _value ELSE allow_signups END,
    auto_moderation = CASE WHEN _key = 'auto_moderation' THEN _value ELSE auto_moderation END,
    updated_at = now()
  WHERE id = 1;

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, meta)
  VALUES (auth.uid(), 'platform_setting_updated', 'platform_settings', '1', jsonb_build_object('key', _key, 'value', _value));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_issue_warning(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_suspend_user(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_unsuspend_user(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_ban_user(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_unban_user(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_platform_setting(text, boolean) TO authenticated;

