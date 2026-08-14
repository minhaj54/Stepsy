-- Add cancel_reason column to orders table for admin panel visibility
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Index for admin panel filtering of cancelled orders
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_status ON orders(status) WHERE status = 'cancelled';
