-- Stepzy Phase 1 Database Schema
-- Run this in Supabase SQL Editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  sku TEXT NOT NULL UNIQUE,
  status product_status NOT NULL DEFAULT 'active',
  specifications JSONB DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE(product_id, size, color)
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address_line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  coupon_code TEXT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type coupon_type NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  featured_image TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  read_time TEXT DEFAULT '5 min read',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 2: Vendor Architecture (inactive but schema-ready)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  status vendor_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(vendor_id, product_id)
);

CREATE TABLE IF NOT EXISTS vendor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status payout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_phone TEXT;
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Get full name first
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Ensure phone has leading '+'
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NEW.phone NOT LIKE '+%' THEN
      v_phone := '+' || NEW.phone;
    ELSE
      v_phone := NEW.phone;
    END IF;
  ELSE
    v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
    -- Also ensure user_metadata phone also has leading '+'
    IF v_phone != '' AND v_phone NOT LIKE '+%' THEN
      v_phone := '+' || v_phone;
    END IF;
  END IF;

  -- Create synthetic email
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    v_email := NEW.email;
  ELSE
    v_email := CONCAT(REPLACE(v_phone, '+', ''), '@phone.stepzy.app');
  END IF;

  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    v_full_name,
    v_email,
    v_phone,
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security
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
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payouts ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$ BEGIN
    CREATE POLICY "Brands are viewable by everyone" ON brands FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Active products are viewable by everyone" ON products FOR SELECT USING (status = 'active');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Product images are viewable by everyone" ON product_images FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Product variants are viewable by everyone" ON product_variants FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (approved = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Active coupons are viewable by everyone" ON coupons FOR SELECT USING (active = true AND start_date <= NOW() AND end_date >= NOW());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User policies
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
      EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Admin policies (full access for admin role)
DO $$ BEGIN
    CREATE POLICY "Admins have full access to users" ON users FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to products" ON products FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to product_images" ON product_images FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to product_variants" ON product_variants FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to orders" ON orders FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to order_items" ON order_items FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to reviews" ON reviews FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to brands" ON brands FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to categories" ON categories FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to coupons" ON coupons FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to blog_posts" ON blog_posts FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins have full access to vendors" ON vendors FOR ALL USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Seed: Brands
INSERT INTO brands (id, name, slug, logo, description, featured) VALUES
  ('11111111-1111-1111-1111-111111111111', 'AeroStride', 'aerostride', '⚡', 'Cutting-edge athletic and running performance footwear designed for speed and comfort.', true),
  ('22222222-2222-2222-2222-222222222222', 'ApexCraft', 'apexcraft', '👑', 'Handcrafted luxury leather shoes, boots, and loafers designed with timeless elegance.', true),
  ('33333333-3333-3333-3333-333333333333', 'TerraTrek', 'terratrek', '⛰️', 'Rugged, all-weather boots and trail shoes built to endure the elements.', true),
  ('44444444-4444-4444-4444-444444444444', 'CloudWalk', 'cloudwalk', '☁️', 'Ultra-cushioned lifestyle slides, sandals, and casual slip-ons.', false)
ON CONFLICT (slug) DO NOTHING;

-- Seed: Categories
INSERT INTO categories (id, name, slug, image) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sneakers', 'sneakers', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Casual Shoes', 'casual', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Boots', 'boots', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Formal Shoes', 'formal', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Sandals', 'sandals', 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=600')
ON CONFLICT (slug) DO NOTHING;

-- Seed: Coupons
INSERT INTO coupons (code, type, value, start_date, end_date) VALUES
  ('STEPZY20', 'percentage', 20, NOW(), NOW() + INTERVAL '1 year'),
  ('WELCOME10', 'percentage', 10, NOW(), NOW() + INTERVAL '1 year'),
  ('SHOEHEAVEN', 'fixed', 30, NOW(), NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

-- Seed: Blog Posts
INSERT INTO blog_posts (title, slug, summary, content, featured_image, category, tags, read_time, published_at) VALUES
  ('Sneaker Care 101: How to Keep Your Kicks Looking Brand New', 'sneaker-care-101-keep-kicks-new',
   'A step-by-step professional guide to cleaning leather, suede, and knit sneakers, plus storing techniques to avoid oxidation.',
   'Sneakers are more than just footwear; they are an investment and a form of self-expression. In this guide, we dive into the chemical properties of different materials and outline the absolute best techniques to clean and maintain them.',
   'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
   'Guide', ARRAY['Sneaker Care', 'Maintenance', 'Sneakerheads'], '5 min read', '2026-05-25T12:00:00Z'),
  ('The Rise of Technical Footwear in Modern Street Fashion', 'rise-technical-footwear-street-fashion',
   'Explore how running shoes, hiking boots, and outdoor gear crossed over from trails and tracks to high-fashion runways.',
   'Over the past decade, we have seen a dramatic shift. Performance footwear once reserved exclusively for marathons or mountain climbs is now commonplace at Fashion Weeks worldwide.',
   'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
   'Fashion Trends', ARRAY['Streetwear', 'Techwear', 'Gorpcore'], '7 min read', '2026-06-02T10:30:00Z')
ON CONFLICT (slug) DO NOTHING;
