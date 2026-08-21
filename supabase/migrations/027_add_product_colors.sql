-- Product colors: a seller-curated list of available colorways shown as selectable
-- swatches on the product detail page. Stored as a TEXT array.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors TEXT[] NOT NULL DEFAULT '{}';
