-- Single-row setting that controls which product is featured in the home hero banner.
CREATE TABLE IF NOT EXISTS home_banner_product (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE home_banner_product ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view home banner product" ON home_banner_product;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view home banner product"
    ON home_banner_product FOR SELECT TO public USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage home banner product" ON home_banner_product;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage home banner product"
    ON home_banner_product FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
