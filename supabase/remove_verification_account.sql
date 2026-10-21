-- ==============================================================================
-- Liread - Remove the verification account created during integration
-- ==============================================================================
-- This removes the single account created while wiring up Supabase auth, so the
-- database contains only accounts that real readers sign up for themselves.
-- Run this in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Remove the profile row (cascades from the auth user, but safe to run first)
DELETE FROM public.profiles
WHERE id = '1410725d-2399-4d54-a45e-2a88b7664db9';

-- 2. Remove the matching auth user
DELETE FROM auth.users
WHERE id = '1410725d-2399-4d54-a45e-2a88b7664db9';

-- 3. Confirm the database is empty again
SELECT 'profiles remaining: ' || COUNT(*)::text AS profiles FROM public.profiles;
SELECT 'posts remaining: ' || COUNT(*)::text AS posts FROM public.posts;
SELECT 'reading_sessions remaining: ' || COUNT(*)::text AS sessions FROM public.reading_sessions;
