-- Fix order ID type to accept custom order reference strings like "ord_ABC123XYZ"
-- The app generates non-UUID order IDs, so we need to change the column types

-- Drop ALL policies on orders and order_items that depend on the id column
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON order_items;

-- Drop foreign key constraints
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;

-- Change orders.id from UUID to TEXT
ALTER TABLE orders ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE orders ALTER COLUMN id SET DEFAULT 'ord_' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 9));

-- Re-add primary key
ALTER TABLE orders ADD PRIMARY KEY (id);

-- Change order_items.order_id from UUID to TEXT
ALTER TABLE order_items ALTER COLUMN order_id TYPE TEXT USING order_id::TEXT;

-- Re-add foreign key
ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Recreate policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
