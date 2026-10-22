-- ==============================================================================
-- Liread - Optional cleanup of legacy demo data
-- ==============================================================================
-- Run this ONCE in the Supabase SQL Editor if your database still contains the
-- demo users, posts, sessions and bookshelf rows from the old seed file.
-- It removes demo content while leaving any real user data untouched.
-- ==============================================================================

-- 1. Remove reading sessions, upvotes, bookmarks, comments and bookshelf rows
--    that belong to the known demo profiles.
DELETE FROM public.post_comments
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.saved_posts
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.post_upvotes
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.reading_sessions
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.bookshelf
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

-- 2. Remove the seeded demo posts
DELETE FROM public.posts
WHERE id IN (
  'd4444444-4444-4444-4444-444444444441',
  'd4444444-4444-4444-4444-444444444442',
  'd4444444-4444-4444-4444-444444444443'
);

-- 3. Remove the demo profiles
DELETE FROM public.profiles
WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

-- 4. Remove matching auth users (the 5 demo accounts from seed.sql)
DELETE FROM auth.users
WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'd4444444-4444-4444-4444-444444444444',
  'e5555555-5555-5555-5555-555555555555'
);

-- 5. Auto-confirm any pending unconfirmed accounts so you can sign in immediately
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

SELECT 'Demo cleanup complete & real accounts confirmed.' AS notice;
