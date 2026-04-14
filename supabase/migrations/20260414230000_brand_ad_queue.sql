-- Brand advertising queue (admin review).

CREATE TABLE IF NOT EXISTS public.brand_ad_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  ad_format TEXT,
  budget_inr INTEGER,
  audience TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

ALTER TABLE public.brand_ad_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brand_ad_requests_select_staff" ON public.brand_ad_requests;
CREATE POLICY "brand_ad_requests_select_staff" ON public.brand_ad_requests
  FOR SELECT TO authenticated
  USING (public.has_any_staff_role());

DROP POLICY IF EXISTS "brand_ad_requests_insert_authenticated" ON public.brand_ad_requests;
CREATE POLICY "brand_ad_requests_insert_authenticated" ON public.brand_ad_requests
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "brand_ad_requests_update_staff" ON public.brand_ad_requests;
CREATE POLICY "brand_ad_requests_update_staff" ON public.brand_ad_requests
  FOR UPDATE TO authenticated
  USING (public.has_any_staff_role())
  WITH CHECK (public.has_any_staff_role());

GRANT SELECT, INSERT, UPDATE ON TABLE public.brand_ad_requests TO authenticated;

