-- Fix infinite recursion in users RLS policies properly
-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- 2. Create a simple, non-recursive policy for users to view/update their own profiles
DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create a safe insert policy (for the trigger)
DO $$ BEGIN
    CREATE POLICY "Service role can insert users" ON users FOR INSERT WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Add admin access using a security definer function to avoid recursion
-- First, create a helper function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create admin policies that use this function
DO $$ BEGIN
    CREATE POLICY "Admins have full access to users" ON users FOR ALL USING (
      is_admin(auth.uid())
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
