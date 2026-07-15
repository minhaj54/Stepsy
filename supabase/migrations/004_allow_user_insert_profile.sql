-- Allow users to insert their own profile (for fallback when trigger doesn't fire)
-- This policy ensures the client-side fallback in AuthContext.tsx works
DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
