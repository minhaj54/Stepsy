-- Add shipping dimension fields to products table
-- This allows per-product optimized packaging to reduce shipping costs

ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2) DEFAULT 0.5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_cm INTEGER DEFAULT 20;
ALTER TABLE products ADD COLUMN IF NOT EXISTS breadth_cm INTEGER DEFAULT 12;
ALTER TABLE products ADD COLUMN IF NOT EXISTS height_cm INTEGER DEFAULT 8;

-- Add comments for documentation
COMMENT ON COLUMN products.weight_kg IS 'Shipping weight in kilograms per unit (used for rate calculation)';
COMMENT ON COLUMN products.length_cm IS 'Package length in centimeters (used for dimensional weight calculation)';
COMMENT ON COLUMN products.breadth_cm IS 'Package breadth/width in centimeters (used for dimensional weight calculation)';
COMMENT ON COLUMN products.height_cm IS 'Package height in centimeters (used for dimensional weight calculation)';
