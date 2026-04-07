-- Seed default plans (idempotent by slug)
INSERT INTO public.plans (slug, name, price_cents, currency, interval, active)
VALUES
  ('basic', 'CampX Basic', 0, 'INR', 'month', true),
  ('pro', 'CampX Pro', 49900, 'INR', 'month', true),
  ('pro_annual', 'CampX Pro (Annual)', 499900, 'INR', 'year', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  currency = EXCLUDED.currency,
  interval = EXCLUDED.interval,
  active = EXCLUDED.active;
