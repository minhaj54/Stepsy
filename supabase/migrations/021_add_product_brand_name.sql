-- Allow products to carry a free-text brand name when no matching brand exists ("Other")
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_name TEXT;
