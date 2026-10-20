-- ==============================================================================
-- Readers Hub - Optional cleanup of legacy demo data
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
  'c3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.saved_posts
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.post_upvotes
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.reading_sessions
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.bookshelf
WHERE user_id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
);

-- 2. Remove the seeded demo posts
DELETE FROM public.posts
WHERE id IN (
  'd4444444-4444-4444-4444-444444444441',
  'd4444444-4444-4444-4444-444444444442',
  'd4444444-4444-4444-4444-444444444443'
);

-- 3. Remove the demo profiles
--    NOTE: profiles.id references auth.users(id). The old seed inserted
--    profiles without matching auth.users rows, so the delete usually succeeds.
--    If a foreign key blocks it, delete the matching auth.users rows first.
DELETE FROM public.profiles
WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
);

-- 4. Remove matching auth users (only if they exist for the demo profiles)
DELETE FROM auth.users
WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
);

SELECT 'Demo data cleanup complete.' AS notice;
