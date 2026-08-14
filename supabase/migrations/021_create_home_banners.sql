-- Create missing home_banners table to match web app
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

DO $$ BEGIN
    CREATE POLICY "Home banners are viewable by everyone" ON home_banners FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to home_banners" ON home_banners FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Seed a default banner if none exists
INSERT INTO home_banners (image_url, title, subtitle, background_color, text_color, sort_order)
VALUES (
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800',
  'Best Sale',
  'Discount',
  '#2E4B7E',
  '#ffffff',
  0
)
ON CONFLICT DO NOTHING;
