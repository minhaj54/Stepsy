-- ============================================================
-- Apply ALL migrations in order
-- Run this entire file in Supabase Dashboard > SQL Editor
-- ============================================================

-- 001: Initial Schema
-- Users profile (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT DEFAULT '',
  description TEXT DEFAULT '',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  sku TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  specifications JSONB,
  featured BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,
  size TEXT,
  color TEXT
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  read_time TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Service role can insert users" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Service role can insert users" ON users FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins have full access to users" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins have full access to users" ON users FOR ALL USING (
      is_admin(auth.uid())
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Brands (public read, admin write)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view brands" ON brands;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view brands" ON brands FOR SELECT TO public USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage brands" ON brands FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Categories (public read, admin write)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view categories" ON categories;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view categories" ON categories FOR SELECT TO public USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Products (public read active, admin write)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view active products" ON products;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view active products" ON products FOR SELECT TO public USING (status = 'active');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Product Images
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view product images" ON product_images;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view product images" ON product_images FOR SELECT TO public USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Product Variants
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view product variants" ON product_variants;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view product variants" ON product_variants FOR SELECT TO public USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage product variants" ON product_variants;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage product variants" ON product_variants FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Addresses
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Orders
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can update orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Order Items
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
      EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Reviews
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT TO public USING (approved = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Wishlist
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own wishlist" ON wishlist;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can insert own wishlist" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlist;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can delete own wishlist" ON wishlist FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Coupons (public read, admin write)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view active coupons" ON coupons;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view active coupons" ON coupons FOR SELECT TO public USING (active = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies: Blog Posts (public read, admin write)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT TO public USING (published_at IS NOT NULL);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage blog posts" ON blog_posts FOR ALL USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 002: Phone Auth Trigger
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_phone TEXT;
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NEW.phone NOT LIKE '+%' THEN
      v_phone := '+' || NEW.phone;
    ELSE
      v_phone := NEW.phone;
    END IF;
  ELSE
    v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
    IF v_phone != '' AND v_phone NOT LIKE '+%' THEN
      v_phone := '+' || v_phone;
    END IF;
  END IF;

  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    v_email := NEW.email;
  ELSE
    v_email := CONCAT(REPLACE(v_phone, '+', ''), '@phone.zarwinto.app');
  END IF;

  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (NEW.id, v_full_name, v_email, v_phone, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 004/005/008: User insert policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Service role can insert users" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Service role can insert users" ON users FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 006: Orders policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can update orders" ON orders;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin(auth.uid()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 007: Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'product-images');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Authenticated can upload product images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can delete product images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'product-images' AND
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
