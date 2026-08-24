-- ============================================================
-- Store-owner order access (recursion-proof)
-- ============================================================
-- A plain policy that joins orders -> order_items -> products -> stores recurses
-- with the existing order_items policy that references orders. We instead use
-- SECURITY DEFINER helper functions so the link check runs as the definer
-- (bypassing RLS) and never recurses. This also works off the live product
-- -> store association, so no denormalized columns are required.

-- 1. Helper functions -------------------------------------------------
-- NOTE: orders.id / order_items.order_id are text (e.g. "ord_XXXXX"), not uuid.
CREATE OR REPLACE FUNCTION public.order_belongs_to_store(o_id text, uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN stores s ON s.id = p.store_id
    WHERE oi.order_id = o_id
      AND s.owner_id = uid
  );
$$;

CREATE OR REPLACE FUNCTION public.order_item_belongs_to_store(oi_product_id uuid, uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM products p
    JOIN stores s ON s.id = p.store_id
    WHERE p.id = oi_product_id
      AND s.owner_id = uid
  );
$$;

-- 2. Ensure denormalized columns exist (optional, harmless) --------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;

-- 3. Remove any previously-created store-owner policies ------------------
DROP POLICY IF EXISTS "Store owners can view their store orders" ON orders;
DROP POLICY IF EXISTS "Store owners can update their store orders" ON orders;
DROP POLICY IF EXISTS "Store owners can view their store order items" ON order_items;

-- 4. Non-recursive store-owner policies using the helper functions ------
DO $$ BEGIN
  CREATE POLICY "Store owners can view their store orders" ON orders FOR SELECT USING (
    order_belongs_to_store(id, auth.uid())
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Store owners can update their store orders" ON orders FOR UPDATE USING (
    order_belongs_to_store(id, auth.uid())
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Store owners can view their store order items" ON order_items FOR SELECT USING (
    order_item_belongs_to_store(product_id, auth.uid())
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
