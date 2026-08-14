-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Public can view banner images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'banner-images');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Authenticated can upload banner images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Authenticated can upload banner images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'banner-images');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    CREATE POLICY "Admins can delete banner images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'banner-images');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
