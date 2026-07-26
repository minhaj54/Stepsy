-- ============================================================
-- Cashfree Payments Integration
-- Adds fields to track Cashfree payment transactions
-- ============================================================

-- 1. Add Cashfree fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cashfree_order_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cashfree_payment_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cashfree_payment_status text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cashfree_payment_method text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cashfree_payment_message text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cashfree_webhook_received boolean DEFAULT false;

-- 2. Create index for faster lookups by cashfree_order_id
CREATE INDEX IF NOT EXISTS idx_orders_cashfree_order_id ON public.orders(cashfree_order_id);

-- 3. Create index for faster lookups by cashfree_payment_id
CREATE INDEX IF NOT EXISTS idx_orders_cashfree_payment_id ON public.orders(cashfree_payment_id);

-- 4. Create payment_transactions table for detailed payment history
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  cashfree_order_id text NOT NULL,
  cashfree_payment_id text DEFAULT '',
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  payment_status text NOT NULL DEFAULT 'PENDING',
  payment_method text DEFAULT '',
  payment_message text DEFAULT '',
  customer_details jsonb DEFAULT '{}',
  transaction_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Enable RLS on payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for payment_transactions
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own payment transactions" ON public.payment_transactions;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Users can view own payment transactions"
    ON public.payment_transactions FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = payment_transactions.order_id
        AND orders.user_id = auth.uid()
      )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage payment transactions" ON public.payment_transactions;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can manage payment transactions"
    ON public.payment_transactions FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Create index on payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_cashfree_order_id ON public.payment_transactions(cashfree_order_id);
