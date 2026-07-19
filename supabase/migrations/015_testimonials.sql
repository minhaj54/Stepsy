-- Testimonials / Verified Buyer Feedback shown on the home page
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  initials TEXT NOT NULL DEFAULT '',
  review TEXT NOT NULL,
  product TEXT NOT NULL DEFAULT '',
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view testimonials"
    ON testimonials FOR SELECT TO public USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage testimonials"
    ON testimonials FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
