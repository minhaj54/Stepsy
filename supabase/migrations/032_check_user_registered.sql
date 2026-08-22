-- Allow checking whether a phone number is already registered without
-- being blocked by Row Level Security on the public.users table.
-- The public SELECT policy (auth.uid() = id) returns zero rows for an
-- unauthenticated user, so a client-side .select() during login always
-- "finds" nothing and wrongly reports "user not registered".
-- This SECURITY DEFINER function runs as the table owner and bypasses RLS.

CREATE OR REPLACE FUNCTION public.check_user_registered(p_phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE phone LIKE '%' || right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  );
$$;

GRANT EXECUTE ON FUNCTION public.check_user_registered(text) TO anon, authenticated;
