-- ============================================================
-- Enhanced Seller Onboarding: additional seller details
-- ============================================================

-- 1. Add new columns to stores table ---------------------------------
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS customer_support_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS government_id_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS government_id_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_handles jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pickup_address jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pickup_pincode text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pickup_city text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pickup_state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS gst_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_name text DEFAULT '';

-- 2. Storage bucket for government IDs -------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-documents', 'seller-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Only admins can view seller documents
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view seller documents" ON storage.objects;
  CREATE POLICY "Admins can view seller documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'seller-documents' AND
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Sellers can upload their own documents
DO $$ BEGIN
  DROP POLICY IF EXISTS "Sellers can upload own documents" ON storage.objects;
  CREATE POLICY "Sellers can upload own documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'seller-documents' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Sellers can update their own documents
DO $$ BEGIN
  DROP POLICY IF EXISTS "Sellers can update own documents" ON storage.objects;
  CREATE POLICY "Sellers can update own documents"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'seller-documents' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'seller-documents' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN undefined_object THEN null; END $$;

-- Sellers can delete their own documents
DO $$ BEGIN
  DROP POLICY IF EXISTS "Sellers can delete own documents" ON storage.objects;
  CREATE POLICY "Sellers can delete own documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'seller-documents' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
EXCEPTION WHEN undefined_object THEN null; END $$;
