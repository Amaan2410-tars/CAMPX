-- Community creation requests table (admin review queue).

CREATE TABLE IF NOT EXISTS public.community_creation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

ALTER TABLE public.community_creation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_creation_requests_insert_own" ON public.community_creation_requests;
CREATE POLICY "community_creation_requests_insert_own" ON public.community_creation_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "community_creation_requests_select_staff" ON public.community_creation_requests;
CREATE POLICY "community_creation_requests_select_staff" ON public.community_creation_requests
  FOR SELECT TO authenticated
  USING (public.has_any_staff_role());

DROP POLICY IF EXISTS "community_creation_requests_update_staff" ON public.community_creation_requests;
CREATE POLICY "community_creation_requests_update_staff" ON public.community_creation_requests
  FOR UPDATE TO authenticated
  USING (public.has_any_staff_role())
  WITH CHECK (public.has_any_staff_role());

GRANT SELECT, INSERT, UPDATE ON TABLE public.community_creation_requests TO authenticated;

