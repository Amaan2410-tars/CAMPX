-- Colleges master data for searchable signup dropdown.
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS colleges_name_idx ON public.colleges (name);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "colleges_public_read" ON public.colleges;
CREATE POLICY "colleges_public_read" ON public.colleges
  FOR SELECT
  USING (true);
