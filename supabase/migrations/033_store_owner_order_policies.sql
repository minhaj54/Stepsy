-- ============================================================
-- Fix store-owner order access without RLS recursion
-- ============================================================
-- The previous approach joined orders -> order_items -> products -> stores,
-- which recursed with the existing order_items policy that references orders.
-- We denormalize store_id onto orders/order_items so the policies are simple
-- and recursion-free.

-- 1. Add store_id columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS orders_store_id_idx ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS order_items_store_id_idx ON public.order_items(store_id);

-- 2. Backfill from existing data
UPDATE public.order_items oi
SET store_id = p.store_id
FROM public.products p
WHERE oi.product_id = p.id AND oi.store_id IS NULL;

UPDATE public.orders o
SET store_id = (
  SELECT oi.store_id FROM public.order_items oi
  WHERE oi.order_id = o.id AND oi.store_id IS NOT NULL
  LIMIT 1
)
WHERE o.store_id IS NULL;

-- 3. Drop the previously added (recursive) policies if they exist
DROP POLICY IF EXISTS "Store owners can view their store orders" ON orders;
DROP POLICY IF EXISTS "Store owners can update their store orders" ON orders;
DROP POLICY IF EXISTS "Store owners can view their store order items" ON order_items;

-- 4. Non-recursive store-owner policies using store_id
DO $$ BEGIN
  CREATE POLICY "Store owners can view their store orders" ON orders FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Store owners can update their store orders" ON orders FOR UPDATE USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Store owners can view their store order items" ON order_items FOR SELECT USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
