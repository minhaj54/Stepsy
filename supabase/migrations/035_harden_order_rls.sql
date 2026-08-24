-- ============================================================
-- Harden store-owner order access (prevents RLS recursion -> 500)
-- ============================================================
-- The order_items INSERT policy runs an EXISTS subquery against `orders`,
-- which in turn evaluates `orders` SELECT policies. One of those policies
-- calls order_belongs_to_store(), which reads `order_items`. If that helper
-- is not SECURITY DEFINER it runs under the caller's RLS, producing infinite
-- recursion and a 500 with an empty body (seen as `{}` in the client).
-- This migration idempotently re-creates the helpers as SECURITY DEFINER so
-- they bypass RLS and never recurse.

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

-- Re-create the store-owner policies (idempotent) so they use the hardened helpers.
DROP POLICY IF EXISTS "Store owners can view their store orders" ON orders;
CREATE POLICY "Store owners can view their store orders" ON orders FOR SELECT USING (
  order_belongs_to_store(id, auth.uid())
);

DROP POLICY IF EXISTS "Store owners can update their store orders" ON orders;
CREATE POLICY "Store owners can update their store orders" ON orders FOR UPDATE USING (
  order_belongs_to_store(id, auth.uid())
);

DROP POLICY IF EXISTS "Store owners can view their store order items" ON order_items;
CREATE POLICY "Store owners can view their store order items" ON order_items FOR SELECT USING (
  order_item_belongs_to_store(product_id, auth.uid())
);
