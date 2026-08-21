-- Product color swatches: a curated list of available colorways shown as
-- selectable swatches on the product detail page. Each row maps a human
-- readable color name to its hex value so the app can render an accurate
-- swatch instead of relying on a hardcoded fallback map.
CREATE TABLE IF NOT EXISTS public.colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  hex TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;

-- Colors are reference data: safe for anyone (including anonymous shoppers) to read.
DROP POLICY IF EXISTS "Colors are viewable by everyone" ON public.colors;
CREATE POLICY "Colors are viewable by everyone"
  ON public.colors FOR SELECT
  USING (true);

-- Seed the catalog of colors (name -> hex) consumed by the app's color section.
INSERT INTO public.colors (name, hex, sort_order) VALUES
  ('Red',         '#E53935', 1),
  ('Black',       '#1C1C1E', 2),
  ('White',       '#F2F2F2', 3),
  ('Blue',        '#1E88E5', 4),
  ('Navy',        '#1A237E', 5),
  ('Green',       '#43A047', 6),
  ('Neon Green',  '#76FF03', 7),
  ('Teal/Green',  '#00897B', 8),
  ('Orange',      '#FB8C00', 9),
  ('Yellow',      '#FDD835', 10),
  ('White/Grey',  '#ECEFF1', 11),
  ('Tan',         '#D2B48C', 12),
  ('Brown',       '#795548', 13),
  ('Grey',        '#9E9E9E', 14),
  ('Gray',        '#9E9E9E', 15),
  ('Pink',        '#EC407A', 16),
  ('Purple',      '#8E24AA', 17),
  ('Gold',        '#FFD54F', 18),
  ('Silver',      '#C0C0C0', 19),
  ('Rose Gold',   '#B76E79', 20),
  ('Beige',       '#D6C3A3', 21),
  ('Maroon',      '#800000', 22)
ON CONFLICT (name) DO UPDATE
  SET hex = EXCLUDED.hex,
      sort_order = EXCLUDED.sort_order;
