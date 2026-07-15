-- ============================================================
-- Marketplace: vendor stores
-- ============================================================

-- 1. stores table -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  banner_url text DEFAULT '',
  logo_url text DEFAULT '',
  social_handle text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stores_owner_id_idx ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS stores_slug_idx ON public.stores(slug);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Public can view active stores
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view active stores" ON public.stores;
  CREATE POLICY "Public can view active stores"
    ON public.stores FOR SELECT
    TO public
    USING (status = 'active');
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Store owners can manage their own stores
DO $$ BEGIN
  DROP POLICY IF EXISTS "Owners can manage their stores" ON public.stores;
  CREATE POLICY "Owners can manage their stores"
    ON public.stores FOR ALL
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Admins can manage all stores
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage all stores" ON public.stores;
  CREATE POLICY "Admins can manage all stores"
    ON public.stores FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN undefined_object THEN null; END $$;

-- 2. storage bucket for store assets -----------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view store assets" ON storage.objects;
  CREATE POLICY "Public can view store assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'store-assets');
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated can upload store assets" ON storage.objects;
  CREATE POLICY "Authenticated can upload store assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'store-assets');
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated can update store assets" ON storage.objects;
  CREATE POLICY "Authenticated can update store assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'store-assets')
    WITH CHECK (bucket_id = 'store-assets');
EXCEPTION WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated can delete store assets" ON storage.objects;
  CREATE POLICY "Authenticated can delete store assets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'store-assets');
EXCEPTION WHEN undefined_object THEN null; END $$;

-- 3. link products to a store ------------------------------------
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS products_store_id_idx ON public.products(store_id);

-- Store owners can manage products that belong to their store
DO $$ BEGIN
  DROP POLICY IF EXISTS "Store owners can manage their products" ON public.products;
  CREATE POLICY "Store owners can manage their products"
    ON public.products FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Store owners can manage images of their store's products
DO $$ BEGIN
  DROP POLICY IF EXISTS "Store owners can manage their product images" ON public.product_images;
  CREATE POLICY "Store owners can manage their product images"
    ON public.product_images FOR ALL
    TO authenticated
    USING (product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())))
    WITH CHECK (product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Store owners can manage variants of their store's products
DO $$ BEGIN
  DROP POLICY IF EXISTS "Store owners can manage their product variants" ON public.product_variants;
  CREATE POLICY "Store owners can manage their product variants"
    ON public.product_variants FOR ALL
    TO authenticated
    USING (product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())))
    WITH CHECK (product_id IN (SELECT id FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
EXCEPTION WHEN undefined_object THEN null; END $$;
