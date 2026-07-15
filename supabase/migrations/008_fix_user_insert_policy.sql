-- Fix user insert policy to allow authenticated users to insert their own profile
-- This fixes the timeout issue when client-side insert is attempted

-- Drop existing insert policies to avoid conflicts
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
DO $$ BEGIN
    DROP POLICY IF EXISTS "Service role can insert users" ON users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create a policy that allows authenticated users to insert their own profile
-- This is needed for the client-side fallback when the trigger doesn't create the profile
DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Also create a bypass for service role (for the trigger)
DO $$ BEGIN
    CREATE POLICY "Service role can insert users" ON users FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
