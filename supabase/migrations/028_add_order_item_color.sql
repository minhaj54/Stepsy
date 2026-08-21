-- Store the buyer-selected colorway on each order item so the order reflects the
-- exact color the customer chose (product-level colorway), independent of the
-- variant's own color field.
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS color TEXT;
