-- Phone OTP auth support
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Update trigger to store phone from auth metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_phone TEXT;
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  -- Get full name first
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Ensure phone has leading '+'
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    IF NEW.phone NOT LIKE '+%' THEN
      v_phone := '+' || NEW.phone;
    ELSE
      v_phone := NEW.phone;
    END IF;
  ELSE
    v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
    -- Also ensure user_metadata phone also has leading '+'
    IF v_phone != '' AND v_phone NOT LIKE '+%' THEN
      v_phone := '+' || v_phone;
    END IF;
  END IF;

  -- Create synthetic email
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    v_email := NEW.email;
  ELSE
    v_email := CONCAT(REPLACE(v_phone, '+', ''), '@phone.whishkhu.app');
  END IF;

  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    v_full_name,
    v_email,
    v_phone,
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();