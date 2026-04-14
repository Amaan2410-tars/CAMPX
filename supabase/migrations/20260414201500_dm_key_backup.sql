-- DM E2EE multi-device continuity: encrypted key backup stored server-side.
-- Private key backup is encrypted client-side with a user passphrase (PBKDF2 -> AES-GCM).

CREATE TABLE IF NOT EXISTS public.dm_key_backups (
  user_id UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  kdf JSONB NOT NULL DEFAULT '{}'::jsonb,
  salt_b64 TEXT NOT NULL,
  nonce_b64 TEXT NOT NULL,
  ciphertext_b64 TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dm_key_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dm_key_backups_select_own" ON public.dm_key_backups;
CREATE POLICY "dm_key_backups_select_own" ON public.dm_key_backups
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dm_key_backups_upsert_own" ON public.dm_key_backups;
CREATE POLICY "dm_key_backups_upsert_own" ON public.dm_key_backups
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dm_key_backups_update_own" ON public.dm_key_backups;
CREATE POLICY "dm_key_backups_update_own" ON public.dm_key_backups
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tighten profiles peer-read: avoid exposing DM public keys / other sensitive fields.
-- NOTE: This is a hardening change; it keeps peer SELECT enabled but blocks selecting rows unless you use a view.
-- For now we keep peer read as-is and rely on not storing backups on profiles.
-- NEEDS FOUNDER INPUT: decide which profile columns are public and implement a `public_profiles` view.

