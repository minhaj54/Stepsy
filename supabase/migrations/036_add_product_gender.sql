-- Add gender categorization to products
-- Values: 'male', 'female', 'unisex'
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender TEXT;
