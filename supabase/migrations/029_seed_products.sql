-- Seed Products for Mobile App
-- Run this in Supabase SQL Editor after applying migrations

-- Products
INSERT INTO products (id, brand_id, category_id, title, slug, description, price, sale_price, sku, status, featured, new_arrival, best_seller, rating, reviews_count, specifications, weight_kg, length_cm, breadth_cm, height_cm, created_at) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AeroStride Velocity', 'aerostride-velocity', 'Lightweight performance running shoe with responsive foam cushioning and breathable mesh upper.', 129.00, 99.00, 'AS-VEL-001', 'active', true, true, true, 4.8, 215, '{"material":"Mesh","sole":"Rubber"}', 0.45, 28, 18, 10, '2026-05-01T08:00:00Z'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AeroStride Glide', 'aerostride-glide', 'Plush cushioning built for daily miles. Soft foam with responsive Zoom Air units.', 149.00, NULL, 'AS-GLI-002', 'active', true, false, true, 4.7, 164, '{"material":"Knit","sole":"EVA"}', 0.5, 28, 18, 11, '2026-05-10T10:00:00Z'),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ApexCraft Oxford', 'apexcraft-oxford', 'Handcrafted luxury leather oxford with timeless elegance and durable construction.', 189.00, 159.00, 'AC-OXF-003', 'active', true, false, true, 4.9, 382, '{"material":"Leather","sole":"Leather"}', 0.7, 32, 20, 12, '2026-04-20T09:00:00Z'),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ApexCraft Loafer', 'apexcraft-loafer', 'Premium leather loafers designed for all-day comfort and sophisticated style.', 169.00, NULL, 'AC-LOF-004', 'active', false, true, false, 4.6, 95, '{"material":"Leather","sole":"Rubber"}', 0.55, 30, 19, 11, '2026-03-15T08:00:00Z'),
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'TerraTrek Summit', 'terratrek-summit', 'Rugged all-weather boot built to endure the elements with waterproof membrane.', 159.00, 129.00, 'TT-SUM-005', 'active', true, true, false, 4.8, 78, '{"material":"Suede","sole":"Vibram"}', 0.8, 34, 22, 14, '2026-05-12T08:00:00Z'),
  ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'TerraTrek Hiker', 'terratrek-hiker', 'Mid-cut hiking boot with ankle support and aggressive lug outsole for trail grip.', 179.00, NULL, 'TT-HIK-006', 'active', false, false, true, 4.7, 53, '{"material":"Nubuck","sole":"Rubber"}', 0.75, 33, 21, 13, '2026-05-14T08:00:00Z'),
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'CloudWalk Slide', 'cloudwalk-slide', 'Ultra-cushioned lifestyle slide with contoured footbed for all-day comfort.', 69.00, 49.00, 'CW-SLI-007', 'active', true, true, false, 4.5, 120, '{"material":"EVA","sole":"Cushion"}', 0.3, 26, 16, 9, '2026-06-01T08:00:00Z'),
  ('h8h8h8h8-h8h8-h8h8-h8h8-h8h8h8h8h8h8', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'CloudWalk Flip', 'cloudwalk-flip', 'Classic flip-flop with soft straps and textured footbed for pool and beach.', 39.00, NULL, 'CW-FLI-008', 'active', false, false, false, 4.3, 80, '{"material":"Rubber","sole":"Flat"}', 0.25, 24, 14, 8, '2026-06-05T08:00:00Z')
ON CONFLICT (slug) DO NOTHING;

-- Product Images
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800', 0),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800', 1),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800', 0),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&q=80&w=800', 0),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&q=80&w=800', 1),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800', 2),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800', 0),
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800', 0),
  ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?auto=format&fit=crop&q=80&w=800', 0),
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800', 0),
  ('h8h8h8h8-h8h8-h8h8-h8h8-h8h8h8h8h8h8', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', 0);

-- Product Variants
INSERT INTO product_variants (product_id, size, color, stock_quantity) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '34', 'Neon Green', 10),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '38', 'Black', 15),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '42', 'White', 8),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '34', 'Teal/Green', 12),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '38', 'Orange', 14),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '42', 'Yellow', 6),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '34', 'White/Grey', 20),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '38', 'White/Grey', 18),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '42', 'White/Grey', 15),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '46', 'White/Grey', 10),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '38', 'Tan', 9),
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '38', 'Brown', 11),
  ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', '42', 'Black', 7),
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', '34', 'Grey', 25),
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', '38', 'Navy', 20),
  ('h8h8h8h8-h8h8-h8h8-h8h8-h8h8h8h8h8h8', '34', 'Blue', 30),
  ('h8h8h8h8-h8h8-h8h8-h8h8-h8h8h8h8h8h8', '38', 'Red', 25);
