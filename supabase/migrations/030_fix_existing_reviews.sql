-- Fix existing reviews to be visible
-- Run this in Supabase SQL Editor if you have existing reviews with approved = false
UPDATE public.reviews SET approved = true WHERE approved = false;
