-- Add COD support to orders

-- Add cod_pending to payment_status enum
DO $$ BEGIN
    ALTER TYPE payment_status ADD VALUE 'cod_pending';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add payment_method column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'prepaid';
