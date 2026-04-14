-- Profile customization fields for launch UX:
-- - bio: user-editable short description
-- - theme: UI theme accent preference
-- - avatar_url: optional profile picture URL

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'purple',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Keep theme values constrained to known UI palette.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_theme_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_theme_check;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_theme_check
  CHECK (theme IN ('purple', 'teal', 'amber', 'coral'));

