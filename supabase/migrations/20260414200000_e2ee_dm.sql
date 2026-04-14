-- E2EE DMs: store ciphertext only (no plaintext).
-- Approach:
-- - Each user has an ECDH identity public key stored on profiles (P-256 JWK).
-- - Each message uses a sender-generated ephemeral ECDH keypair.
-- - DB stores: ephemeral public key, nonce, ciphertext, version.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dm_identity_pub_jwk JSONB;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS e2ee_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS e2ee_ephemeral_pub_jwk JSONB,
  ADD COLUMN IF NOT EXISTS e2ee_nonce TEXT,
  ADD COLUMN IF NOT EXISTS e2ee_ciphertext TEXT;

-- Allow body to be NULL (legacy rows might keep plaintext; new inserts must not).
ALTER TABLE public.messages
  ALTER COLUMN body DROP NOT NULL;

-- Enforce new inserts to use ciphertext-only. (Best-effort; service role can bypass.)
CREATE OR REPLACE FUNCTION public.tg_messages_require_e2ee()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.e2ee_ciphertext IS NULL OR NEW.e2ee_nonce IS NULL OR NEW.e2ee_ephemeral_pub_jwk IS NULL THEN
      RAISE EXCEPTION 'e2ee required';
    END IF;
    IF NEW.body IS NOT NULL AND length(trim(NEW.body)) > 0 THEN
      RAISE EXCEPTION 'plaintext body not allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_messages_require_e2ee ON public.messages;
CREATE TRIGGER trg_messages_require_e2ee
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_messages_require_e2ee();

-- Tighten insert RLS to ensure ciphertext fields are present and body is null.
DROP POLICY IF EXISTS "messages_insert_participant" ON public.messages;
CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.require_min_tier('verified')
    AND sender_id = auth.uid()
    AND body IS NULL
    AND e2ee_ciphertext IS NOT NULL
    AND e2ee_nonce IS NOT NULL
    AND e2ee_ephemeral_pub_jwk IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
    )
  );

