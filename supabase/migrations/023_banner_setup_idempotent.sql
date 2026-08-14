-- Idempotent: safe to run multiple times.

-- 1) Ensure table exists
CREATE TABLE IF NOT EXISTS home_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT DEFAULT '',
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  background_color TEXT DEFAULT '',
  text_color TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE home_banners ENABLE ROW LEVEL SECURITY;

-- 2) Recreate RLS policies (drop first so re-runs don't error)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Home banners are viewable by everyone" ON home_banners;
  CREATE POLICY "Home banners are viewable by everyone" ON home_banners FOR SELECT USING (true);
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins have full access to home_banners" ON home_banners;
  CREATE POLICY "Admins have full access to home_banners" ON home_banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null; END $$;

-- 3) Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4) Storage policies (drop first so re-runs don't error)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
  CREATE POLICY "Public can view banner images"
    ON storage.objects FOR SELECT TO public USING (bucket_id = 'banner-images');
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated can upload banner images" ON storage.objects;
  CREATE POLICY "Authenticated can upload banner images"
    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banner-images');
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;
  CREATE POLICY "Admins can delete banner images"
    ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banner-images');
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Done. Tables/policies are now in place.
SELECT 'home_banners OK' AS result;
