-- Seed Additional Footwear Brands
-- Run this in Supabase SQL Editor after applying migrations.
-- Idempotent: safe to re-run, existing brands are left untouched.

INSERT INTO brands (id, name, slug, logo, description, featured) VALUES
  ('b0000001-0000-4000-8000-000000000001', 'Adidas', 'adidas', '', 'Global sportswear icon known for athletic footwear, football boots and lifestyle sneakers.', TRUE),
  ('b0000002-0000-4000-8000-000000000002', 'Nike', 'nike', '', 'World-leading sportswear brand offering performance running, training and lifestyle shoes.', TRUE),
  ('b0000003-0000-4000-8000-000000000003', 'Skechers', 'skechers', '', 'Comfort-first footwear with cushioned walking, running and casual shoe collections.', TRUE),
  ('b0000004-0000-4000-8000-000000000004', 'Reebok', 'reebok', '', 'Classic athletic heritage brand for training, running and retro court footwear.', TRUE),
  ('b0000005-0000-4000-8000-000000000005', 'Puma', 'puma', '', 'Sportstyle label delivering football, motorsport-inspired and everyday sneakers.', TRUE),
  ('b0000006-0000-4000-8000-000000000006', 'Clarks', 'clarks', '', 'Heritage British shoemaker renowned for comfortable casual, boot and formal footwear.', TRUE),
  ('b0000007-0000-4000-8000-000000000007', 'Bata', 'bata', '', 'Everyday footwear brand offering affordable school, formal and casual shoes.', TRUE),
  ('b0000008-0000-4000-8000-000000000008', 'Red Tape', 'red-tape', '', 'Contemporary lifestyle brand with sporty sneakers, sandals and everyday footwear.', TRUE),
  ('b0000009-0000-4000-8000-000000000009', 'Liberty', 'liberty', '', 'Well-rounded footwear label for school shoes, sandals and value comfort styles.', TRUE),
  ('b000000a-0000-4000-8000-00000000000a', 'Paragon', 'paragon', '', 'Indian comfort brand specialising in cushioned walking and casual footwear.', TRUE),
  ('b000000b-0000-4000-8000-00000000000b', 'Woodland', 'woodland', '', 'Adventure outfitter producing rugged hiking boots, trekking and outdoor shoes.', TRUE),
  ('b000000c-0000-4000-8000-00000000000c', 'Campus', 'campus', '', 'Sports shoe brand built for running, training and everyday campus-ready sneakers.', TRUE),
  ('b000000d-0000-4000-8000-00000000000d', 'Birkenstock', 'birkenstock', '', 'Iconic German sandal maker famous for contoured footbeds and moulded footwear.', TRUE),
  ('b000000e-0000-4000-8000-00000000000e', 'Asian', 'asian', '', 'Everyday comfort brand offering durable school, sports and casual footwear.', TRUE),
  ('b000000f-0000-4000-8000-00000000000f', 'Boldfit', 'boldfit', '', 'Fitness and athleisure brand focused on training shoes and activewear footwear.', TRUE),
  ('b0000010-0000-4000-8000-000000000010', 'Relaxo', 'relaxo', '', 'Comfort-led casual footwear with cushioned everyday styles for men and women.', TRUE),
  ('b0000011-0000-4000-8000-000000000011', 'Walkaroo', 'walkaroo', '', 'Indian brand delivering lightweight, flexible walking and casual shoes.', TRUE),
  ('b0000012-0000-4000-8000-000000000012', 'Sparx', 'sparx', '', 'Contemporary comfort footwear blending athletic styling with all-day cushioning.', TRUE),
  ('b0000013-0000-4000-8000-000000000013', 'Oofos', 'oofos', '', 'Recovery footwear brand built around a cushioned, contoured footbed for all-day wear.', TRUE),
  ('b0000014-0000-4000-8000-000000000014', 'FitFlop', 'fitflop', '', 'Wellness footwear known for ergonomic, weight-bearing comfortable shoe designs.', TRUE),
  ('b0000015-0000-4000-8000-000000000015', 'Flite', 'flite', '', 'Lightweight casual and sports footwear engineered for everyday mobility.', TRUE),
  ('b0000016-0000-4000-8000-000000000016', 'Aqualite', 'aqualite', '', 'Swim and water footwear specialist offering pool, beach and water sports shoes.', TRUE)
ON CONFLICT (slug) DO NOTHING;
