-- Allow authenticated users to insert their own profile
-- This fixes the client-side fallback when the trigger doesn't create the profile

-- Add a policy that allows users to insert their own profile
DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
